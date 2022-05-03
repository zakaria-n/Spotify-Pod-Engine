import './App.css';

import { Component } from "react";
import React from "react";
import SearchBar from "./components/SearchBar";
import SearchResults from "./components/SearchResults";
import searchDbpediaUtil from './utils/search.dbpedia.util';
import './style/style.css';


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

        const groupss = await searchDbpediaUtil.searchGroup(value);
        this.setState({
            results: [...albumss.map(a => ({
                type: 'album',
                data: a
            })), ...singerss.map(s => ({ type: 'artist', data: s })), ...trackss.map(t => ({
                type: 'track',
                data: t
            })), ...groupss.map(g => ({ type: 'group', data: g }))]
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