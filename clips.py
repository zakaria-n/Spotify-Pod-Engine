import os
import json
import xml.etree.ElementTree as ET
from tfidf import TfIdf

transcript_dir = '/Users/yixiong/Downloads/podcasts-no-audio-13GB/spotify-podcasts-2020-summarization-testset/podcasts-transcripts-summarization-testset'
rss_dir = '/Users/yixiong/Downloads/podcasts-no-audio-13GB/spotify-podcasts-2020-summarization-testset/show-rss-summarization-testset'

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
    


if __name__ == '__main__':
    res= [(["SPOTIFY", "JESUS"], "show_01DbRiALDPdvZdoiY8yQL6", "5fG4VlWnWwzAt6mSs0H7lY", 0.5), (["SPOTIFY", "JESUS"], "show_01eumErJvBdxCW4YJivbwc", "2WQ1GcC6J0k7qsO8Vvf2be", 0.5)]
    expandedQuery = ['spotify', 'Jesus']
    result = getClips(res, 120, 2)
    print(result)
    # print(time)
    # print()
    # print(scripts)
    # print()
    # print(duration)
    # print()
    # print(rss)