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
            keyword: "",
            type: { label: "Episode Title", value: "episode" }
        };
    }

    updateKeyword = () => {
        this.props.updateKeyword(this.state.keyword.toLowerCase(), this.state.type);
    }

    onChangeType = async(value) => {
        this.setState({ type: value });
        this.AutoUpload();
        await(5000);
        console.log(this.state.type)
    }

    onChangeSearch = async (event) => {
        this.state.keyword = event.target.value;
        this.setState({ keyword: event.target.value });
        this.AutoUpload();
    }

    AutoUpload = async () => {
        var sts = this.state.keyword;
        await new Promise(r => setTimeout(r, 100));
        if (sts === this.state.keyword) {
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

                {/* {<select onChange={this.onChangeType} value={this.state.type}>
                    <option value="show">Show Name</option>
                    <option value="episode">Episode Title</option>
                    <option value="transcript">Transcript</option>
                    <option value="publisher">Publisher</option>
                    <option value="all">Search All</option>
                </select>} */}
                <div style = {dropdown}>
                    <Select
                        name="fields"
                        options={options}
                        isMulti={true}
                        value={this.state.type}
                        onChange={this.onChangeType}
                    />
                </div>

            </div>
        );
    };
}

export default SearchBar;


/*
<iframe scrolling="no" frameBorder="0" allowTransparency="true"
        src="https://www.deezer.com/plugins/player?format=classic&autoplay=false&playlist=true&width=700&height=350&color=EF5466&layout=&size=medium&type=album&id=1238967&app_id=1"
        width="700" height="350"></iframe>

https://api.deezer.com/search/album?q=album:%22loud%22%20artist:%22rihanna%22*/
