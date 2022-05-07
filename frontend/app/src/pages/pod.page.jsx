import React, { useState, useEffect, useRef } from 'react';
import { Button, CircularProgress } from "@material-ui/core";
import mediasUtil from '../utils/medias.util';
import ReactAudioPlayer from 'react-audio-player';
import mp3_file from '../sounds/sample.mp3';
import AudioPlayerDOM from "./AudioPlayerDom";
import { Howl } from 'howler';
import Snippet from './snippet';
import { Link } from '@material-ui/core';

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

    soundPlay = (src) => {
        const sound = new Howl({
            src,
            html5: true
        })
        sound.play();
    }

    renderButtonSound = () => {
        return (
            <Button style={{ backgroundColor: "white" }} onClick={() => this.soundPlay(this.state.pod.snippet)}>
                Play Snippet
            </Button>
        )
    }

    playAudio = async () => {
        const importRes = await import(this.state.pod.snippet); 
        var audio = new Audio(importRes.default);
        try {
          await audio.play();
          console.log("Playing audio");
        } catch (err) {
          console.log("Failed to play, error: " + err);
        }
    }

    render = () => {
        if (this.state.pod) {
            // var audio_src = new Audio('../sounds/sample.mp3');
            // audio_src.load();
        }
        return (
            <div className={"page"}>
                <div className="panel">
                    {this.state.pod ?
                        <>
                            {console.log(this.state.pod)}
                            <div className="titlebar">
                                <h1 style={{color: "white"}}>{this.state.pod.title}  {new Date(this.state.pod.start * 1000).toISOString().substr(11, 8)}-{new Date(this.state.pod.end * 1000).toISOString().substr(11, 8)}</h1>
                                <h2 style={{color: "white"}}>{this.state.pod.show}</h2>
                            </div>
                            <div className="topbar">
                                <div>
                                    <strong style={{color: "grey"}}>Transcript</strong>
                                    <p style={{color: "white"}}>{this.state.pod.transcript}</p>
                                </div>
                            </div>
                            <div className="bottombar">
                                <div className="snippet">
                                    {console.log(this.state.pod.snippet)}
                                    {this.state.pod.snippet ?
                                        <audio
                                            style = {{width: "1060px"}}
                                            error="audioError"
                                            ref="audio_tag"
                                            autoPlay={false}
                                            controls={true}
                                            src={this.state.pod.snippet}
                                        >
                                        </audio>
                                        //this.renderButtonSound()
                                        // <Snippet url={this.state.pod.snippet}></Snippet>
                                        : null
                                    }
                                </div>
                            </div>
                            {/* <Link href={this.state.pod.snippet} color="inherit">
                                {'Go to Podcast'}
                            </Link> */}
                        </>
                        : this.state.notFound ? <span>No search results.</span> : <CircularProgress className={"loading"} />}
                </div>
            </div>
        )
    };
}