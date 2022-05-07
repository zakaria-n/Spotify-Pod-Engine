import React from "react";
import DialogTitle from "@material-ui/core/DialogTitle";
import { IconButton } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import Dialog from "@material-ui/core/Dialog";
import PodPage from "../pages/pod.page";

const banner = {
    color: "white",
    paddingLeft: "2%",
}
const show = {
    color: "white",
}

export default class SearchResults extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showDetails: false,
            pod: null
        }
    }

    renderResult = (result) => {
        return this.renderPod(result.data);
    };

    render = () => {
        return (
            <>
                {this.props.results.length != 0 ? <h2 style={banner}>{this.props.results.length}&nbsp;Search Results {'('+parseFloat(this.props.elapsed).toFixed(2)}s)</h2> : null}
                <div key = {this.props.results} className="results">
                    {this.props.results.map(result => this.renderResult(result))}
                </div>
                {this.renderDetails()}
            </>
        )
    }

    renderPod = (pod) => {
        return <div onClick={() => this.openDetails(pod)} 
        className={"result pod"} key={"pod_" + pod.title +Math.random()}>
            {/* {console.log(pod)} */}
            <span className="type">{pod.title} {new Date(pod.start * 1000).toISOString().substr(11, 8)}-{new Date(pod.end * 1000).toISOString().substr(11, 8)}</span>
            <span style={show}>{pod.show}</span>
            <span className="publisher">{pod.publisher}</span>
        </div>
    };

    renderDetails = () => {
        return (
            <Dialog onClose={this.handleClose} open={this.state.showDetails} fullScreen={true}>
                <DialogTitle id="simple-dialog-title">
                    <IconButton onClick={this.handleClose}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <PodPage openDetails={this.openDetails} pod={this.state.pod} />
            </Dialog>);
    }

    openDetails = (data) => {
        this.setState({ showDetails: true, pod: data });
    };

    handleClose = () => {
        this.setState({ showDetails: false });
    }
}