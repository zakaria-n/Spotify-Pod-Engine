#!/usr/bin/env python
# coding: utf-8

# In[32]:


from elasticsearch import Elasticsearch
import csv
import time
import os
import json
import xml.etree.ElementTree as ET
from tfidf import TfIdf


# In[33]:


transcript_dir = 'E:\Masters\Search Engines and Information Retrieval Systems\Project\podcasts-no-audio-13GB\spotify-podcasts-2020\podcasts-transcripts'
rss_dir = 'E:\Masters\Search Engines and Information Retrieval Systems\Project\podcasts-no-audio-13GB\spotify-podcasts-2020\show-rss'

trans2ID = {}
transcriptLst = []
idx = 0
# Get all the 2 min window range
# res -> [(show_filename_prefix, episode_filename_prefix)]
# expandedQuery: The query modified with relevance feedback or k-gram
# expandedQuery-> [{term1: score1}, ..., {termx: scorex}]
# e.g. res= [(query, "show_01DbRiALDPdvZdoiY8yQL6", "5fG4VlWnWwzAt6mSs0H7lY", episcore)]

table = TfIdf()

class transcript():
    def __init__(self, id, score, words):
        self.id = id
        self.score = score
        self.words = words

def getClips(res, n_minute, n_clips):
    result = []
    episode_frequency = {}
    for (qr, show, episode, score) in res:
        episode_frequency[episode] = 0
        subdir1, subdir2 = show.split('_')[1][0], show.split('_')[1][1]
        transcript_json_dir = os.path.join(transcript_dir, subdir1, subdir2, show, episode+'.json')
        rss_xml_dir = os.path.join(rss_dir, subdir1, subdir2, show+'.xml')
        rss_tree = ET.parse(rss_xml_dir)
        rss_root = rss_tree.getroot()
        rss_url = getUrlFromXml(rss_root)
        with open(transcript_json_dir, ) as f:
            transcript_json = json.load(f)
            
            addDocuments(transcript_json, score, show, episode, rss_url)
    getRelevantClips(qr)
    
    rankingTranscript()
    # for element in transcriptLst:
    #     print(element.id, element.score)
    for element in transcriptLst:
        show, episode, rss_url, start, end = trans2ID[element.id]
        cnt = element.id
        if element.score == 0:
            continue
        while cnt + 1 < idx:
            if trans2ID[cnt + 1][1] != episode or (trans2ID[cnt + 1][-1] - start) > n_minute or episode_frequency[episode] > n_clips:
                break
            end = trans2ID[cnt + 1][-1]
            cnt += 1
        result.append((show, episode, rss_url, start, end))
        episode_frequency[episode] += 1
    return result

def getUrlFromXml(root):
    item = root[0].find('item')
    url = item.find('enclosure')
    return url.attrib['url']

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
            tmp = transcript(idx, score, trans.split())
            # s = tmp.calTFIDF(qr)
            # if s != 0:
            transcriptLst.append(tmp)
            table.add_document(idx, trans.upper().split())
            trans2ID[idx] = (show, episode, rss_url, start, end)
            
            idx += 1
    # print(table.corpus_dict)

def getRelevantClips(qr, epi_w=0.4):
    table2 = table.similarities(qr)
    for i in range(idx):
        transcriptLst[i].score = epi_w * transcriptLst[i].score + (1 - epi_w) * table2[i][1]
    # print(table2)


# In[34]:


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
        res = self.client.search(index="spotify-metadata", body=query_body, size=100)
        print(len(res['hits']['hits']))
        result = []
        for doc in res['hits']['hits']:
            result.append((query.split(), doc['_source']['show_filename_prefix'], doc['_source']['episode_filename_prefix'], doc['_score']))
        return result


# In[35]:


def main():
    es = ElasticSearchClient()
    start = time.time()
    results = es.search("JESUS")
    result = getClips(results, 120, 2)
    print("Time to search: ",(time.time()-start))
    print(len(result))
    


# In[36]:


if __name__ == "__main__":
    main()

