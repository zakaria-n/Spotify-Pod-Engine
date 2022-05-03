import React from "react";
import { CircularProgress } from "@material-ui/core";
import mediasUtil from '../utils/medias.util';
import ReactAudioPlayer from 'react-audio-player';

export default class PodPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            notFound: false,
            media: {
                snippet: ''
            }
        }
    }

    componentDidMount() {
        this.fetchData();
    }

    fetchData = async () => {
        query = this.props.query
        fields = this.props.fields
        const formData = new FormData();
        formData.append('query', query);
        formData.append('fields', fields);
        const res = await (await fetch(`http://127.0.0.1:5000/search`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json'
            },
            body: formData
        })).json();
        if (res.results.length) {
            this.setState({ pod: res.results.bindings[0] }); // redo this based on python API
            this.setState({ media: { snippet: res.results.snippet } });
        } else {
            this.setState({ notFound: true });
        }

    }

    render = () => {
        podcast = this.state.pod
        return (
            <div className={"page"}>
                <div className="panel">
                    {this.state.song ?
                        <>
                            <div className="titlebar">
                                <h1>{podcast.episode}</h1>
                                <h2>{podcast.shows}</h2>
                            </div>
                            <div className="topbar">
                                <div>
                                    <strong>Transcript</strong>
                                    <p>{podcast.transcript}</p>
                                </div>
                            </div>
                            <div className="bottombar">
                                <div className="snippet">
                                    {this.state.media.snippet ?
                                        <ReactAudioPlayer
                                            src={this.state.media.snippet}
                                            autoPlay
                                            controls
                                        /> : null
                                    }
                                </div>
                            </div>
                        </>
                        : this.state.notFound ? <span>No search results.</span> : <CircularProgress className={"loading"} />}
                </div>
            </div>
        )
    };
}