import React from "react";
import { Component } from "react";
import Button from '@material-ui/core/Button';
import Select from "react-select";
import { withThemeCreator } from "@material-ui/styles";

const options = [
    { label: "Show Name", value: "show" },
    { label: "Episode Title", value: "episode" },
    { label: "Transcript", value: "transcript" },
    { label: "Publisher", value: "publisher" },
    { label: "All metadata", value: "all"}
];


class SearchBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            query: "",
            fields: []
        };
    }

    updateKeyword = () => {
        this.props.updateKeyword(this.state.query.toLowerCase(), this.state.fields);
    }

    onChangeType = async(event) => {
        console.log("on change type")
        console.log(event)
        this.setState({ fields: event });
        this.AutoUpload();
        await(5000);
        console.log("fields in onchange")
        console.log(this.state.fields.map(f => (f.value)));
    }

    onChangeSearch = async (event) => {
        this.state.query = event.target.value;
        this.setState({ query: event.target.value });
        this.AutoUpload();
    }

    AutoUpload = async () => {
        var sts = this.state.query;
        await new Promise(r => setTimeout(r, 100));
        if (sts === this.state.query) {
            this.updateKeyword();
        }
    }

    render = () => {
        const BarStyling = {
            width: "30rem",
            background: "#F2F1F9",
            border: "none",
            padding: "0.75rem",
            borderRadius: "10px",
        };
        const dropdown = {
            font_weight: 600,
            width: "30rem",
            padding: "0.75rem"
        }
        const banner = {
            display: "flex",
            justifyContent: "center",
            alignItems: "baseline",
            width: "30rem",
            padding: "1em",
            marginBottom: "2em",
            backgroundColor: "rgb(29, 185, 84)",
            color: "#fff",
            borderRadius: "20px",
        }
        return (
            <div style={{
                position: 'relative', left: '25%'
            }}
            >
                <br/>
                <div style={banner}>
                    <h1>Spotify Pod Engine</h1>
                </div>
                <input
                    style={BarStyling}
                    key="search-bar"
                    value={this.state.keyword}
                    placeholder={"What are you looking for?"}
                    onChange={this.onChangeSearch}
                />
                <div style = {dropdown}>
                    <Select
                        name="fields"
                        options={options}
                        isMulti={true}
                        value={this.state.fields}
                        onChange={this.onChangeType}
                    />
                </div>

            </div>
        );
    };
}

export default SearchBar;
