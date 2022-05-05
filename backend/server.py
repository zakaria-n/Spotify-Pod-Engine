from flask import Flask
from flask_restful import Resource, Api, reqparse



app = Flask(__name__)
api = Api(app)

dummy = [
    {
        "title": "Decoanne",
        "show": "Speech Dec",
        "publisher": "Anne Baril",
        "snippet": "https://anchor.fm/s/d07a884/podcast/play/8625626/https%3A%2F%2Fd3ctxlq1ktw2nl.cloudfront.net%2Fproduction%2F2019-10-24%2F35451564-44100-2-25ff45e653bd8.mp3",
        "transcript": "Coucou c'est Anne",
        "start": "3:24",
        "end": "5:24"
    }, 
    {
        "title": "Decobe",
        "show": "Speech Dec",
        "publisher": "Kobe Moerman",
        "snippet": "https://anchor.fm/s/d07a884/podcast/play/8625626/https%3A%2F%2Fd3ctxlq1ktw2nl.cloudfront.net%2Fproduction%2F2019-10-24%2F35451564-44100-2-25ff45e653bd8.mp3",
        "transcript": "Hello c'est Koko",
        "start": "9:22",
        "end": "11:42"
    }
]


class Search(Resource):
    def get(self):        
        return dummy, 200


  
api.add_resource(Search, '/Search')



if __name__ == '__main__':
    app.run()  

# curl -d "key=newkey2&value=newvalue2" -X POST http://127.0.0.1:5000/tracking