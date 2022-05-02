'''
Input: a query (string) and the fields to match against
Returns: the query (split into a list), show name (string), episode name (string)
'''
def search(query, fields):
    query_body = {
        "query": {"multi_match": {
            "query": query,
            "fields": fields
            }
        }
    }
    res = elastic_client.search(index="spotify-podcasts", body=query_body)
    return query.split(), res['hits']['hits']['_source']['show_name'], res['hits']['hits']['_source']['episode_name']