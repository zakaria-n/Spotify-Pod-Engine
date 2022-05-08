import './App.css';

import { Component } from "react";
import React from "react";
import SearchBar from "./components/SearchBar";
import SearchResults from "./components/SearchResults";
import './style/style.css';


class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            query: null,
            fields: [],
            results: [],
            notFound: false,
            elapsed: null,
            serverError: false
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
    }

    fetchData = async () => {
        const query = this.state.query
        const fields = this.state.fields.map(f => (f.value)).join('|')
        const res = await (await fetch(`http://49c7-2001-6b0-1-1041-24ed-a284-bb82-95da.ngrok.io/Search?query=${query}&fields=${fields}`, { // New URL here
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        })).json();
        console.log(res);
        try {
            if (res.result.length) {
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
            throw("Server Error:",error);
        }
        
    }

    render() {
        return (
            <div class="app">
                <SearchBar updateKeyword={this.updateKeyword} />
                <SearchResults results={this.state.results} elapsed={this.state.elapsed} />
                {this.state.serverError? <div key={this.state.serverError}>Server Error.</div> : null}
            </div>
        );
    }
}

export default App;