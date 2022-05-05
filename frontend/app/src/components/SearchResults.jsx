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

export default class SearchResults extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showDetails: false,
            details: {
                query: '',
                fields: [],
            }
        }
    }

    renderResult = (result) => {
        return this.renderPod(result.data);
    };

    render = () => {
        return (
            <>
                {this.props.results.length != 0 ? <h2 style={banner}>Search Results</h2> : null}
                <div className="results">
                    {this.props.results.map(result => this.renderResult(result))}
                </div>
                {this.renderDetails()}
            </>
        )
    }

    renderPod = (pod) => {
        return <div onClick={() => this.openDetails('pod', { trackId: pod.value }
        )} className={"result pod"} key={"pod_" + pod.title.value + pod.publisher.value}>
            {console.log(pod)}
            <span className="type">Podcast Episode</span>
            <span className="title">{pod.title}</span>
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
                <PodPage openDetails={this.openDetails} query={this.state.details.query} fields={this.state.details.fields} />
            </Dialog>);
    }

    openDetails = (type, data) => {
        this.setState({ showDetails: true, details: { type, ...data } });
    };

    handleClose = () => {
        this.setState({ showDetails: false });
    }
}