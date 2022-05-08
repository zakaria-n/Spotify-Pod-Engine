Hello and welcome to our Spotify Podcast Search Engine, built as a final project for the DD2477 VT22-1 Search Engines and Information Retrieval Systems course at KTH. Here's a quick start guide to get the app up and running and find the right podcast for you!

# Start the backend server
The search engine is served as a webservice using the Flask framework. You need to install the following dependencies: ```elasticsearch, tfidf, flask, flask_cors, flask_restful and flask_ngrok```.
You can run the server by running the backend/ElasticSearchTrial_FullData.py script after setting up your elastic search client:

SHWETA INSTRUCTION HERE

Upon completing this, you should see on the terminal that your server can be queried from a public ngrok URL. You can remove all the ngrok parts from the python code to run everything locally on http://127.0.0.1:5000, but if you want to run the server and the clients on different machines, you will want to publicly expose your backend, for which we recommend the ngrok tunnel redirection that we set up. 

# Start the React application
Update the API endpoint in frontend/app/src/App.js line 83 and from frontend/app run:
```npm install``` followed by ```npm start```. This assumes that you have Node.js installed on your machine. You now have a client running in localhost:3000 where you finally have user-friendly access to the Search Engine! 
If you want to test everything from yet another device, you can run ngrok on port 3000 which will make the React app accessible from anywhere, after following the ngrok authorisation instructions. 