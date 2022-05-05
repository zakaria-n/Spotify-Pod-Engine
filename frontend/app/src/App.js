import './App.css';

import { Component } from "react";
import React from "react";
import SearchBar from "./components/SearchBar";
import SearchResults from "./components/SearchResults";
import './style/style.css';

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
        };
    }

    componentDidMount() {
        document.body.style.backgroundColor = "#333"
    }

    updateKeyword = async (query, fields) => {
        this.setState({ query: query, fields: fields });

        // const podcasts = 
        this.fetchData();
        // this.setState({
        //     results: [...podcasts.map(a => ({
        //         type: 'podcast',
        //         data: a
        //     }))]
        // });

    }

    fetchData = async () => {
        const query = this.props.query
        const fields = this.props.fields.join('|')
        const formData = new FormData();
        formData.append('query', query);
        formData.append('fields', fields);
        const res = await (await fetch(`http://127.0.0.1:5000/Search`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            body: formData
        })).json();
        if (res.length) {
            // this.setState({ results: res }); // redo this based on python API
            this.setState({
                    results: [...res.map(a => ({
                        type: 'podcast',
                        data: a
                    }))]
                });
  
        } else {
            this.setState({ notFound: true });
        }
    }

    render() {
        return (
            <div class="app">
                <SearchBar updateKeyword={this.updateKeyword} />
                <SearchResults results={this.state.results} />
            </div>
        );
    }
}

export default App;