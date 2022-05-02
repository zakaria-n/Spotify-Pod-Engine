import React from "react";
import {CircularProgress} from '@material-ui/core';
import mediasUtil from '../utils/medias.util';


export default class AlbumPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            albums: [],
            albumName: props.albumName,
            albumArtist: props.artistName,
            medias: {
                picture: '',
                deezer: ''
            }
        };
    }

    fetchData = () => {
        const queryString = `
            SELECT ?AlbumName ?ArtistName ?Description ?ArtistId ?IsArtistGroup COUNT(DISTINCT ?TitleName) AS ?Number_of_titles	
                (GROUP_CONCAT(DISTINCT ?TitleName; SEPARATOR="||") AS ?Titles)	
                (GROUP_CONCAT(DISTINCT ?Title; SEPARATOR="||") AS ?TitlesId)	
                (GROUP_CONCAT(DISTINCT ?Genre_name; SEPARATOR="||") AS ?Genres)	
                (GROUP_CONCAT(DISTINCT ?Award; SEPARATOR="||") AS ?Awards)	
                (GROUP_CONCAT(DISTINCT ?Release_Date; SEPARATOR="||") AS ?Release_Dates) 
            WHERE { 
                ?Album a schema:MusicAlbum; foaf:name ?AlbumName;	dbo:artist ?Artist. 
                ?Artist rdfs:label ?ArtistName. 
                ?Artist dbo:wikiPageID ?ArtistId.
                OPTIONAL { ?Artist rdf:type dbo:Group. ?Artist dbo:wikiPageID ?IsArtistGroup. } 
                OPTIONAL { 
                    { ?Album dbp:title ?Title. ?Title rdfs:label ?TitleName. FILTER(langMatches(lang(?TitleName), "en")). } 
                    UNION { ?Album dbp:title ?TitleName. FILTER(datatype(?TitleName) = rdf:langString).} 
                }
                OPTIONAL {?Album dbp:award ?Award.}	OPTIONAL {?Album dbo:releaseDate ?Release_Date.	} 
                OPTIONAL { ?Album dbo:genre ?Genre. ?Genre rdfs:label ?Genre_name.	FILTER(langMatches(lang(?Genre_name), "en")).	}	
                OPTIONAL {	?Album dbo:abstract ?Description. FILTER(langMatches(lang(?Description), "en")). } 
                FILTER(str(?Album) = "${this.props.albumId}").
                FILTER(langMatches(lang(?ArtistName), "en")).  
            }`;

        const formData = new FormData();
        formData.append('query', queryString)
        fetch("http://dbpedia.org/sparql", {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            headers: {
                'Accept': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData // body data type must match "Content-Type" header
        }).then(response => response.json())
            .then(response => {
                    this.setState({
                        albums: response.results.bindings,
                    });
                    const albums = response.results.bindings;
                    if (albums && albums.length) {
                        this.getMedias(albums[0].ArtistName.value, albums[0].AlbumName.value);
                    }
                }
            ); // parses JSON response into native JavaScript objects
    }

    getMedias = async (artistName, albumName) => {
        const res = await mediasUtil.getAlbumMedias(artistName, albumName);
        this.setState({ medias: { picture: res.picture, deezer: res.deezer}});
    }

    componentDidMount = () => {
        this.fetchData();
    }


    renderDesc() {
        if (this.state.albums.length > 0) {
            if ('Description' in this.state.albums[0]) {
                return (

                    <div className="topbar">
                        <div>
                            <strong>Description</strong>
                            <p>{this.state.albums[0].Description.value}</p>
                        </div>
                        <img src={this.state.medias.picture} alt="" className="imgSinger"/>
                    </div>
                );
            } else {
                return (

                    <div className="topbar">
                        <div>
                            <strong>Description</strong>
                            <p>unknown</p>
                        </div>
                        <img src={this.state.medias.picture} alt="" className="imgSinger"/>
                    </div>
                );
            }

        } else {
            return ("...");
        }
    }

    renderTitleBar() {
        if (this.state.albums.length > 0) {
            const album = this.state.albums[0];
            return (
                <div className="titlebar">
                    <h1>{this.state.albums[0].AlbumName.value}</h1>
                    <h2>By <span className={"clickable"} onClick={() => album.IsArtistGroup ? this.props.openDetails('group', { groupId: album.ArtistId.value }) : this.props.openDetails('artist', { singerId: album.ArtistId.value})}>{this.state.albums[0].ArtistName.value}</span></h2>
                </div>
            );
        }
    }

    renderMainInfos() {
        if (this.state.albums.length > 0) {
            const genres = this.state.albums[0].Genres.value.split('||');
            const releaseDates = this.state.albums[0].Release_Dates.value.split('||');
            if (genres[0].length || releaseDates[0].length) {
                return (
                    <div className="main-infos">
                        {genres[0].length ?
                            <div>
                                <strong>Genre(s):</strong>
                                {
                                    genres.length ?
                                        <ul>
                                            {genres.map(p => (
                                                <li key={p}>{p}</li>
                                            ))}
                                        </ul> : <span>Unknown</span>
                                }
                            </div> : <div></div>
                        }
                        {
                            releaseDates[0].length ?
                                <div>
                                    <strong>Release date(s):</strong>
                                    {

                                        releaseDates.length ?
                                            <ul>
                                                {releaseDates.map(p => (
                                                    <li key={p}>{p}</li>
                                                ))}
                                            </ul> : <span>Unknown</span>

                                    }
                                </div> : <div></div>
                        }

                    </div>
                );
            }

        }
    }


    renderTitles() {
        if (this.state.albums.length > 0) {
            const titles = this.state.albums[0].Titles.value.split('||');
            if (titles[0].length) {
                return (
                    <div className="additional-infos">
                        <div>
                            <strong>Titles ({titles.length ? titles.length : <span>Unknown</span>}):</strong>
                            {
                                titles.length ?
                                    <ul>
                                        {titles.map(p => (
                                            <li key={p}>{p}</li>
                                        ))}
                                    </ul> : <span>Unknown</span>
                            }

                        </div>
                    </div>
                );
            }

        }
    }

    renderAwards() {
        if (this.state.albums.length > 0) {
            const awards = this.state.albums[0].Awards.value.split('||');
            if (awards[0].length) {
                return (
                    <div className="additional-infos">
                        <div>
                            <strong>Awards:</strong>
                            {
                                awards.length ?
                                    <ul>
                                        {awards.map(p => (
                                            <li key={p}>{p}</li>
                                        ))}
                                    </ul> : <span>Unknown</span>
                            }

                        </div>
                    </div>
                );
            }

        }
    }

    renderDeezer = () => {
        if (!this.state.medias.deezer) return null;
        return (
            <div className="bottombar">
                <iframe title="Deezer album" scrolling="yes" frameBorder="0"
                        src={`https://www.deezer.com/plugins/player?format=classic&autoplay=false&playlist=true&width=700&height=350&color=EF5466&layout=&size=medium&type=album&id=${this.state.medias.deezer}&app_id=1`}
                        width="700" height="350"/>
            </div>
        )
    }

    render = () => {
        return (
            <div className={"page"}>
                <div className="panel">
                    {this.state.albums.length ?
                        <>
                            {this.renderTitleBar()}
                            {this.renderDesc()}
                            {this.renderMainInfos()}
                            {this.renderTitles()}
                            {this.renderAwards()}
                            {this.renderDeezer()}
                        </> : <CircularProgress className={"loading"}/>
                    }
                </div>
            </div>
        )
    };

}