import React from 'react';
import { Button, CircularProgress } from "@material-ui/core";
import { Howl } from 'howler';


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
                                            style = {{width: "1055px"}}
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