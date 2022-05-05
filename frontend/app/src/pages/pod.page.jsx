import React from "react";
import { CircularProgress } from "@material-ui/core";
import mediasUtil from '../utils/medias.util';
import ReactAudioPlayer from 'react-audio-player';
import mp3_file from '../sounds/sample.mp3';


export default class PodPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            pod: null,
            notFound: false,
        }
    }

    componentDidMount() {
        //this.fetchData();
        document.body.style.backgroundColor = "#333"
        this.setState({ pod: this.props.pod })
    }

    fetchData = async () => {
        // query = this.props.query
        // fields = this.props.fields
        // const formData = new FormData();
        // formData.append('query', query);
        // formData.append('fields', fields);
        // const res = await (await fetch(`http://127.0.0.1:5000/search`, {
        //     method: 'POST',
        //     headers: {
        //         'Accept': 'application/json'
        //     },
        //     body: formData
        // })).json();
        // if (res.results.length) {
        //     this.setState({ pod: res.results.bindings[0] }); // redo this based on python API
        //     this.setState({ media: { snippet: res.results.snippet } });
        // } else {
        //     this.setState({ notFound: true });
        // }

    }

    render = () => {
        return (
            <div className={"page"}>
                <div className="panel">
                    {this.state.pod ?
                        <>
                            {console.log(this.state.pod)}
                            <div className="titlebar">
                                <h1>{this.state.pod.title}</h1>
                                <h2>{this.state.pod.show}</h2>
                            </div>
                            <div className="topbar">
                                <div>
                                    <strong>Transcript</strong>
                                    <p>{this.state.pod.transcript}</p>
                                </div>
                            </div>
                            <div className="bottombar">
                                <div className="snippet">
                                    {console.log(this.state.pod.snippet)}
                                    {this.state.pod.snippet ?
                                        <audio
                                            ref="audio_tag"
                                            autoPlay={false}
                                            controls={true}>
                                            <source type="audio/mp3" src={new Audio(this.state.pod.snippet)} />
                                        </audio>
                                        : null
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