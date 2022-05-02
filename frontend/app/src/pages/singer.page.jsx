import React from "react";
import mediasUtil from '../utils/medias.util';
import "../style/style.css";
import {CircularProgress} from "@material-ui/core";

export default class SingerPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            medias: {
                picture: '',
                topSongs: '',
                biography: '',
                deezer: '',
            },
            singer: {},
        }
    }

    fetchData = () => { //Get info from the singer
        const queryString = `
            select ?Singer ?Name ?BirthName ?BirthDate ?Description ?Quote ?Gender str(?StartYear) as ?StartYearString 
                GROUP_CONCAT(DISTINCT ?Homepage;SEPARATOR=" | ") as ?Homepages 
                GROUP_CONCAT(DISTINCT ?BirthPlace;SEPARATOR=" | ") as ?BirthPlaces 
                GROUP_CONCAT(DISTINCT ?Album;SEPARATOR=" | ") as ?Albums 
            where { 
                ?Singer rdf:type dbo:MusicalArtist. 
                ?Singer rdfs:label ?Name. 
                ?Singer dbo:wikiPageID  ?Id.  
                ?Singer dbo:activeYearsStartYear ?StartYear. 
                OPTIONAL{ ?Singer dbo:birthName ?BirthName. }. 
                OPTIONAL{ ?Singer dct:description ?Description. }. 
                OPTIONAL { ?Singer dbp:quote ?Quote }. 
                OPTIONAL { ?Singer foaf:gender ?Gender }. 
                OPTIONAL { ?Singer foaf:homepage ?Homepage }. 
                OPTIONAL{ ?Singer dbo:birthDate ?BirthDate. FILTER(regex(str(?BirthDate),"(?!0000)[0-9]{4}-((0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-8])|(0[13-9]|1[0-2])-(29|30)|(0[13578]|1[02])-31)")). }. 
                OPTIONAL{ ?Singer dbo:birthPlace ?BirthPlace. ?BirthPlace rdf:type dbo:Location. }. 
                OPTIONAL{ ?Singer ^dbo:artist ?Album. ?Album rdf:type dbo:Album. }. 
                FILTER(regex(str(?Id), "^${this.props.singerId}$") && langMatches(lang(?Name),"EN")). 
            } LIMIT 1`;
        const formData = new FormData();
        formData.append('query', queryString)
        fetch("http://dbpedia.org/sparql", {
            method: 'POST',
            headers: {
                'Accept': 'application/json'
            },
            body: formData
        }).then(response => response.json())
            .then(response => {
                    this.state.singer = response.results.bindings[0];
                    this.setState({
                        singer: response.results.bindings[0],
                    });
                    this.fetchMedias();
                }
            );
    }

    fetchMedias = async () => { //Get media info from the singer on theaudiodb.com
        if (this.state.singer) {
            const medias = await mediasUtil.getSingerMedias(this.state.singer.Name.value);
            this.setState(
                {
                    medias:
                        {
                            picture: medias.picture,
                            topSongs: medias.topSongs,
                            biography: medias.biography,
                            deezer: medias.deezer
                        }
                }
            );
        }
    }

    componentDidMount = () => { //Load data
        this.fetchData();
    }

    componentDidUpdate = (prevProps) => { //Update data
        if (this.props.singerId !== prevProps.singerId) {
            if (this.props.singerId !== undefined) {
                this.fetchData();
            }
        }
    }

    affichageAlbum(singer) { //Display list of Album
        if (singer.Albums.value === "") return (<div>No Albums</div>);
        let albums = this.state.singer.Albums.value.split("|");
        return albums.map((val) => {
            let name = val.replace("http://dbpedia.org/resource/", "");
            name = name.replaceAll("_", " ");
            var reg = new RegExp(/\(.*[Aa]lbum.*\)/, "g");
            name = name.replace(reg,"");
            return (<div key={val} className={"clickable"} onClick={() => this.props.openDetails("album", { albumId: val.trim()})}>{name}</div>);
        });
    }

    affichageBirthPlaces(singer) { //Display list of birth places
        if (singer.BirthPlaces.value === "") return (<span>Unknown</span>);
        let birthPlaces = this.state.singer.BirthPlaces.value;
        birthPlaces = birthPlaces.replaceAll("http://dbpedia.org/resource/", "");
        birthPlaces = birthPlaces.replaceAll(" | ", ", ");
        birthPlaces = birthPlaces.replaceAll("_", " ");
        return birthPlaces;
    }

    affichageHomepages(singer) { //Display list of homepages
        if (singer.Homepages.value === "") return (<span>Unknown</span>);
        let homepages = this.state.singer.Homepages.value.split("|");
        return homepages.map((val) => {
            return (<a key={val} href={val} rel="noreferrer" target="_blank">{val}</a>);
        });
    }

    affichageTopSongs() {
        if (!this.state.medias.topSongs || this.state.medias.topSongs === "") return <br/>;
        return (
            <span>
                <div>
                    <br/>
                    <strong>Consult artist's top songs here : </strong>
                    <a href={this.state.medias.topSongs} rel="noreferrer" target="_blank">top songs</a>
                </div>
                <br/>
            </span>
        );
    }

    affichageDeezer = () => {
        if (!this.state.medias.deezer) return null;
        return (
            <div className="bottombar">
                <iframe title="Deezer artist" scrolling="yes" frameBorder="0"
                        src={`https://www.deezer.com/plugins/player?format=classic&autoplay=false&playlist=true&width=700&height=350&color=EF5466&layout=&size=medium&type=artist&id=${this.state.medias.deezer}&app_id=1`}
                        width="700" height="100"/>
            </div>
        )
    }

    render = () => {
        if (!this.props.singerId) {
            return (<div></div>);
        }
        const singer = this.state.singer;

        if (!singer.Name) {
            singer.Name = {};
            singer.Name.value = "";
        }

        if (!singer.BirthName) {
            singer.BirthName = {};
            singer.BirthName.value = "";
        }

        if (!singer.BirthDate) {
            singer.BirthDate = {};
            singer.BirthDate.value = "";
        }

        if (!singer.Description) {
            singer.Description = {};
            singer.Description.value = "";
        }

        if (!singer.Quote) {
            singer.Quote = {};
            singer.Quote.value = "";
        }

        if (!singer.Gender) {
            singer.Gender = {};
            singer.Gender.value = "";
        }

        if (!singer.Homepages) {
            singer.Homepages = {};
            singer.Homepages.value = "";
        }

        if (!singer.Albums) {
            singer.Albums = {};
            singer.Albums.value = "";
        }

        if (!singer.BirthPlaces) {
            singer.BirthPlaces = {};
            singer.BirthPlaces.value = "";
        }

        if (!singer.StartYearString) {
            singer.StartYearString = {};
            singer.StartYearString.value = "";
        }


        return (
            <div className={"page"}>
                <div className="panel">
                    {this.state.singer ?
                        <>
                            <div className="titlebar">
                                <h1>{singer.Name.value}</h1>
                                <h2>{singer.BirthName.value}</h2>
                            </div>
                            <div className="topbar">
                                <div>
                                    <strong>Description</strong>
                                    <p>{singer.Description.value !== "" ? singer.Description.value : "No description"}</p>
                                </div>
                            </div>
                            <div className="main-infos">
                                <div><strong>Albums : </strong>
                                    <br/>
                                    {this.affichageAlbum(singer)}
                                </div>
                                <img className="imgSinger" src={this.state.medias.picture} alt={""}/>
                            </div>
                            <div>
                                <strong>Gender : </strong>
                                {
                                    singer.Gender.value !== "" ? singer.Gender.value : "Unknown"
                                }
                            </div>
                            <br/>
                            <br/>
                            <div>
                                <strong>Birth Date : </strong>
                                {
                                    singer.BirthDate.value !== "" ? singer.BirthDate.value : "Unknown"
                                }
                            </div>
                            <br/>
                            <div>
                                <strong>Birth Place : </strong>
                                {
                                    this.affichageBirthPlaces(singer)
                                }
                            </div>
                            <br/>
                            <div>
                                <strong>Start Year : </strong>
                                {
                                    singer.StartYearString.value !== "" ? singer.StartYearString.value : "Unknown"
                                }
                            </div>
                            <br/>
                            <div>
                                <strong>Quote : </strong>
                                {
                                    singer.Quote.value !== "" ? singer.Quote.value : "Unknown"
                                }
                            </div>
                            <br/>
                            <div>
                                <strong>Homepages : </strong>
                                {
                                    this.affichageHomepages(singer)
                                }
                            </div>
                            {this.affichageTopSongs()}
                            <div>
                                <strong>Biography : </strong>
                                {
                                    this.state.medias.biography
                                }
                            </div>
                            {this.affichageDeezer()}
                        </> : <CircularProgress className={"loading"}/>
                    }

                </div>
            </div>
        );
    };
}

