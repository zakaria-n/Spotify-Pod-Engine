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
        snippet: "/Users/zak/Music/Music/Media.localized/Unknown Artist/Unknown Album/GamlaStanZN.mp3"
    }, 
    {
        title: "Decobe",
        show: "Speech Dec",
        publisher: "Kobe Moer",
        snippet: "/Users/zak/Music/Music/Media.localized/Unknown Artist/Unknown Album/GamlaStanZN.mp3"
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

    updateKeyword = async (keywords, fields) => {
        this.setState({ keyword: keywords, fields: fields });

        const podcasts = dummy;
        this.setState({
            results: [...podcasts.map(a => ({
                type: 'album',
                data: a
            }))]
        });

    }

    render() {
        return (
            <div>
                <SearchBar updateKeyword={this.updateKeyword} />
                <SearchResults results={this.state.results} />
            </div>
        );
    }
}

export default App;