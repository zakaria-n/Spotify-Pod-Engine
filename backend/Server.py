#!/usr/bin/env python
# coding: utf-8

# In[108]:


from elasticsearch import Elasticsearch
import csv
import time
import os
import json
import xml.etree.ElementTree as ET
from tfidf import TfIdf
from flask import Flask
from flask import request
from flask_restful import Resource, Api, reqparse
from flask_cors import CORS, cross_origin
from flask_ngrok import run_with_ngrok


app = Flask(__name__)
cors = CORS(app)
run_with_ngrok(app)
app.config['CORS_HEADERS'] = 'Content-Type'
api = Api(app)

transcript_dir = 'E:\Masters\Search Engines and Information Retrieval Systems\Project\podcasts-no-audio-13GB\spotify-podcasts-2020\podcasts-transcripts'
rss_dir = 'E:\Masters\Search Engines and Information Retrieval Systems\Project\podcasts-no-audio-13GB\spotify-podcasts-2020\show-rss'

showhash2name = {}
episodehash2name ={}
trans2ID = {}
transcriptLst = []
idx = 0
# Get all the 2 min window range
# res -> [(show_filename_prefix, episode_filename_prefix)]
# expandedQuery: The query modified with relevance feedback or k-gram
# expandedQuery-> [{term1: score1}, ..., {termx: scorex}]
# e.g. res= [(query, "show_01DbRiALDPdvZdoiY8yQL6", "5fG4VlWnWwzAt6mSs0H7lY", episcore)]

table = TfIdf()


class ElasticSearchClient:
    def __init__(self):
        
        print("Connecting to elastic search")
        self.client = Elasticsearch(['http://localhost:9200'], http_auth=('elastic', 'Xh2IngoELD1kH30khiKF'))
        if self.client.ping():
            print('Successfully connected to elasticsearch')
        else:
            print('Connection failed!')
            return
        
        #self.client.indices.delete(index='spotify-metadata', ignore=[400, 404])   
        if self.client.indices.exists(index = "spotify-metadata"):
            print("Index already exists!")
            tsv_file = open("podcasts-no-audio-13GB\spotify-podcasts-2020\metadata.tsv", encoding="utf8")
            read_tsv = csv.reader(tsv_file, delimiter="\t")
            header = True
            for row in read_tsv:
                if header:
                    header = False
                    continue
                showhash2name[row[10]] =  row[1]
                episodehash2name[row[11]] = row[7]
            tsv_file.close()
            #print(showhash2name)
        else:
            print("Creating the metadata index...")
            response = self.create_index_metadata(indexname = "spotify-metadata")
            print ('response:', response)
        
            print("Indexing documents")

            self.generate_actions_metadata(indexname = "spotify-metadata", metadatafile = "podcasts-no-audio-13GB\spotify-podcasts-2020\metadata.tsv")
            
        
    def generate_actions_metadata(self, indexname, metadatafile):

        doc_id_counter = 0
        tsv_file = open(metadatafile, encoding="utf8")
        read_tsv = csv.reader(tsv_file, delimiter="\t")
        doc = {}
        header = True
        for row in read_tsv:
            start = time.time()
            if header:
                header = False
                continue
            doc["show_uri"] = row[0]
            doc["show_name"] = row[1]
            doc["show_description"] = row[2]
            doc["publisher"] = row[3]
            doc["language"] = row[4]
            doc["rss_link"] = row[5]
            doc["episode_uri"] = row[6]
            doc["episode_name"] = row[7]
            doc["episode_description"] = row[8]
            doc["duration"] = row[9]
            doc["show_filename_prefix"] = row[10]
            doc["episode_filename_prefix"] = row[11]

            response = self.client.index(index=indexname, id=doc_id_counter, document=doc)
            doc_id_counter += 1

            #if (doc_id_counter%10000 == 0):
            print("lines processed:",doc_id_counter)
            print("Time required : ", (time.time()-start))
        tsv_file.close()
    
    
    def create_index_metadata(self, indexname):
        
         response = self.client.indices.create(
            index=indexname,
            body={
                "settings": {"number_of_shards": 2,
                            "number_of_replicas": 1},
                "mappings": {
                    "properties": {
                        "show_uri": {"type": "keyword"},
                        "show_name": {"type": "text"},
                        "show_description": {"type": "text"},
                        "publisher": {"type": "text"},
                        "language" : {"type": "text"},
                        "rss_link" :{"type": "text"},
                        "episode_uri" : {"type": "keyword"},
                        "show_name" : {"type": "text"},
                        "episode_description" : {"type": "text"},
                        "duration" : {"type": "float"},
                        "show_filename_prefix" : {"type": "text"},
                        "episode_filename_prefix" : {"type": "text"}
                    }
                },
            },
            ignore=400,
        )

    
    def search(self, query, fields=None):
        query_body = {}
        if fields == None:
            query_body = {
                "query": {"multi_match": {
                    "query": query
                    }
                }
            }
        else:
            query_body = {
                "query": {"multi_match": {
                    "query": query,
                    "fields": fields
                    }
                }
            }
        res = self.client.search(index="spotify-metadata", body=query_body, size=10)
        print(len(res['hits']['hits']))
        result = []
        for doc in res['hits']['hits']:
            result.append((query.split(), doc['_source']['show_filename_prefix'], doc['_source']['episode_filename_prefix'], doc['_score']))
        return result


es = ElasticSearchClient()
        
class Search(Resource):
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('query', required=True)
        parser.add_argument('fields', required=True)
        args = parser.parse_args()
        query = request.args.get("query").upper()
        fields = request.args.get("fields")
        print(fields)

        start = time.time()
        if "all" in fields:
            results = es.search(query)
        else:
            results = es.search(query, fields.split('|'))
        if results == []:
            print("No relevant episode")
            search_time = time.time()-start
            return {"search_time":search_time, "result": []}, 200
        result = getClips(results, 120, 2)
        search_time = time.time()-start
        print("Time to search: ",search_time)
        #print(result[0])
        
        return {"search_time":search_time, "result": result}, 200
  
    
# In[109]:


class transcript():
    def __init__(self, id, score, words, content):
        self.id = id
        self.score = score
        self.words = words
        self.content = content

def getClips(res, n_minute, n_clips):
    global transcriptLst
    global idx
    #print(res)
    result = []
    transcriptLst = []
    idx = 0
    episode_frequency = {}
    for (qr, show, episode, score) in res:
        episode_frequency[episode] = 0
        try:
            subdir1, subdir2 = show.split('_')[1][0], show.split('_')[1][1]
            transcript_json_dir = os.path.join(transcript_dir, subdir1, subdir2, show, episode+'.json')
            rss_xml_dir = os.path.join(rss_dir, subdir1, subdir2, show+'.xml')
            rss_tree = ET.parse(rss_xml_dir)
            rss_root = rss_tree.getroot()
            rss_url = getUrlFromXml(rss_root)
        except Exception as e:
            print(rss_xml_dir)
            continue
        with open(transcript_json_dir, ) as f:
            transcript_json = json.load(f)
            
            addDocuments(transcript_json, score, show, episode, rss_url)
    #print(transcriptLst)
    getRelevantClips(qr)
    
    rankingTranscript()
    # for element in transcriptLst:
    #     print(element.id, element.score)
    visited_elements = []
    for element in transcriptLst:
        if element.id in visited_elements:
            continue
        show, episode, rss_url, start, end, trans = trans2ID[element.id]
        cnt = element.id
        visited_elements.append(cnt)
        try:
            if element.score == 0 or episode_frequency[episode] >= n_clips:
                continue
        except Exception as e:
            continue
        final_trans = trans        
        while cnt + 1 < idx:
            if trans2ID[cnt + 1][1] != episode or (trans2ID[cnt + 1][-2] - start) > n_minute:
                break
            end = trans2ID[cnt + 1][-2]
            final_trans += trans2ID[cnt + 1][-1]
            visited_elements.append(cnt+1)
            cnt += 1
        result.append({"show":showhash2name[show], "title":episodehash2name[episode], "snippet":rss_url, "start":start, "end":end, "transcript":final_trans})
        episode_frequency[episode] += 1
    return result

def getUrlFromXml(root):
#     try:
    item = root[0].find('item')
    url = item.find('enclosure')
    return url.attrib['url']
#     except Exception as e:
#         print(e)

def rankingTranscript():
    transcriptLst.sort(key=lambda x: x.score, reverse=True)

def addDocuments(data, score, show, episode, rss_url):
    start = 0
    end = 0
    global idx
    alternatives = data['results']
    for alternative in alternatives:
        transcripts_data = alternative['alternatives']
        if transcripts_data == [{}]:
            continue
        for ele in transcripts_data:
            if 'transcript' not in ele.keys():
                continue
            trans = ele['transcript']
            start = float(ele['words'][0]['startTime'].rstrip('s'))
            end = float(ele['words'][-1]['endTime'].rstrip('s'))
            tmp = transcript(idx, score, trans.split(), trans)
            # s = tmp.calTFIDF(qr)
            # if s != 0:
            transcriptLst.append(tmp)
            table.add_document(idx, trans.upper().split())
            trans2ID[idx] = (show, episode, rss_url, start, end, trans)
            
            idx += 1
    # print(table.corpus_dict)

def getRelevantClips(qr, epi_w=0.4):
    table2 = table.similarities(qr)
    for i in range(idx):
        transcriptLst[i].score = epi_w * transcriptLst[i].score + (1 - epi_w) * table2[i][1]
    # print(table2)


# In[110]:





# In[111]:


#def main():
    
    


# In[112]:

api.add_resource(Search, '/Search')

if __name__ == '__main__':
    app.run()



