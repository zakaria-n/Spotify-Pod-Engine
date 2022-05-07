import './App.css';

import { Component } from "react";
import React from "react";
import SearchBar from "./components/SearchBar";
import SearchResults from "./components/SearchResults";
import './style/style.css';

const banner = {
    color: "white",
    paddingLeft: "2%",
}

const dummy = [
    {
        title: "Decoanne",
        show: "Speech Dec",
        publisher: "Anne Baril",
        snippet: "https://anchor.fm/s/d07a884/podcast/play/8625626/https%3A%2F%2Fd3ctxlq1ktw2nl.cloudfront.net%2Fproduction%2F2019-10-24%2F35451564-44100-2-25ff45e653bd8.mp3",
        transcript: "Coucou c'est Anne",
        start: "3:24",
        end: "5:24"
    }, 
    {
        title: "Decobe",
        show: "Speech Dec",
        publisher: "Kobe Moerman",
        snippet: "https://anchor.fm/s/d07a884/podcast/play/8625626/https%3A%2F%2Fd3ctxlq1ktw2nl.cloudfront.net%2Fproduction%2F2019-10-24%2F35451564-44100-2-25ff45e653bd8.mp3",
        transcript: "Hello c'est Koko",
        start: "9:22",
        end: "11:42"
    },
    {
        title: "Decorémi",
        show: "Speech Dec",
        publisher: "Rémi Bourge",
        snippet: "https://anchor.fm/s/d07a884/podcast/play/8625626/https%3A%2F%2Fd3ctxlq1ktw2nl.cloudfront.net%2Fproduction%2F2019-10-24%2F35451564-44100-2-25ff45e653bd8.mp3",
        transcript: "Hello c'est encore Koko mdr",
        start: "7:14",
        end: "9:14"
    }
]

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            query: null,
            fields: [],
            results: [],
            notFound: false,
            elapsed: null
        };
    }

    componentDidMount() {
        document.body.style.backgroundColor = "#333"
    }

    updateKeyword = async (query, fields) => {
        this.setState({
            results: []});
        this.setState({ query: query, fields: fields });
        console.log("state query: " + this.state.query)
        console.log("state fields: " + this.state.fields.map(f => (f.value)))
        this.fetchData();
        // this.setState({
        //     results: [...podcasts.map(a => ({
        //         type: 'podcast',
        //         data: a
        //     }))]
        // });


    }

    fetchData = async () => {
        const query = this.state.query
        const fields = this.state.fields.map(f => (f.value)).join('|')
        // formData.append('query', query);
        // formData.append('fields', fields);
        const res = await (await fetch(`http://4918-2001-6b0-1-1041-24ed-a284-bb82-95da.ngrok.io/Search?query=${query}&fields=${fields}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        })).json();
        console.log(res);
        try {
            if (res.result.length) {
                // this.setState({ results: res }); // redo this based on python API
                this.setState({
                        results: [...res.result.map(a => ({
                            type: 'podcast',
                            data: a
                        }))],
                        elapsed: res.search_time
                    });
      
            } else {
                this.setState({ notFound: true });
            }
        } catch (error) {
            throw("Server Error");
        }
        
    }

    render() {
        return (
            <div class="app">
                <SearchBar updateKeyword={this.updateKeyword} />
                <SearchResults results={this.state.results} elapsed={this.state.elapsed} />
            </div>
        );
    }
}

export default App;