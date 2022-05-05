import './App.css';

import { Component } from "react";
import React from "react";
import SearchBar from "./components/SearchBar";
import SearchResults from "./components/SearchResults";
import searchDbpediaUtil from './utils/search.dbpedia.util';
import './style/style.css';

const dummy = [
    {
        title: "Decoanne",
        show: "Speech Dec",
        publisher: "Anne Baril",
        snippet: "/Users/zak/Documents/Spotify-Pod-Engine/frontend/app/public/sample.mp3",
        transcript: "Coucou c'est Anne",
        start: "3:24",
        end: "5:24"
    }, 
    {
        title: "Decobe",
        show: "Speech Dec",
        publisher: "Kobe Moerman",
        snippet: "/Users/zak/Documents/Spotify-Pod-Engine/frontend/app/public/sample.mp3",
        transcript: "Hello c'est Koko",
        start: "9:22",
        end: "11:42"
    },
    {
        title: "Decorémi",
        show: "Speech Dec",
        publisher: "Rémi Bourge",
        snippet: "/Users/zak/Documents/Spotify-Pod-Engine/frontend/app/public/sample.mp3",
        transcript: "Hello c'est encore Koko mdr",
        start: "7:14",
        end: "9:14"
    }
]

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            keyword: null,
            fields: [],
            results: [],
        };
    }

    componentDidMount() {
        document.body.style.backgroundColor = "#333"
    }

    updateKeyword = async (keywords, fields) => {
        this.setState({ keyword: keywords, fields: fields });

        const podcasts = dummy;
        this.setState({
            results: [...podcasts.map(a => ({
                type: 'podcast',
                data: a
            }))]
        });

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