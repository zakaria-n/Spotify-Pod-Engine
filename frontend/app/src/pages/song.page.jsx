import React from "react";
import {CircularProgress} from "@material-ui/core";
import mediasUtil from '../utils/medias.util';

export default class SongPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            notFound: false,
            medias: {
                picture: '',
                video: '',
                deezer: '',
            }
        }
    }

    componentDidMount() {
        this.fetchData();
    }

    fetchData = async () => {
        const request = `
            SELECT DISTINCT ?Name ?Desc
                (GROUP_CONCAT(DISTINCT ?Artists; SEPARATOR="||") AS ?Artists)
                (GROUP_CONCAT(DISTINCT ?Genres; SEPARATOR="||") AS ?Genres)  
                (GROUP_CONCAT(DISTINCT ?Albums; SEPARATOR="||") AS ?Albums) 
                (GROUP_CONCAT(DISTINCT ?AlbumsLinks; SEPARATOR="||") AS ?AlbumsLinks)
                (GROUP_CONCAT(DISTINCT ?ReleaseDates; SEPARATOR="||") AS ?ReleaseDates) 
                (GROUP_CONCAT(DISTINCT ?Producers; SEPARATOR="||") AS ?Producers) 
                (GROUP_CONCAT(DISTINCT ?RecordLabels; SEPARATOR="||") AS ?RecordLabels) 
                (GROUP_CONCAT(DISTINCT ?Writers; SEPARATOR="||") AS ?Writers) 
                (GROUP_CONCAT(DISTINCT ?ArtistIds; SEPARATOR="||") AS ?ArtistIds)
                (GROUP_CONCAT(DISTINCT ?Bands; SEPARATOR="||") AS ?Bands)
            WHERE { 
                ?Track rdf:type dbo:Single.
                ?Track foaf:name ?Name.
                ?Track dbo:musicalArtist ?ArtistsLinks. 
                ?Track dbo:album ?AlbumsLinks. 
                OPTIONAL {
                    ?Track dbo:genre ?GenresLinks.
                    ?GenresLinks rdfs:label ?Genres. 
                } 
                ?Track dbo:releaseDate ?ReleaseDates. 
                
                ?AlbumsLinks rdfs:label ?Albums. 
                ?ArtistsLinks rdfs:label ?Artists. 
                
                OPTIONAL { 
                    ?Track dbo:abstract ?Desc. 
                    FILTER(langMatches(lang(?Desc), "en")). 
                } 
                OPTIONAL { 
                    ?Track dbo:producer ?ProducersLink. 
                    ?ProducersLink rdfs:label ?Producers. 
                    FILTER(langMatches(lang(?Producers), "en")). 
                } 
                OPTIONAL { 
                    ?Track dbo:recordLabel ?LabelsLinks. 
                    ?LabelsLinks rdfs:label ?RecordLabels. 
                    FILTER(langMatches(lang(?RecordLabels), "en")). 
                } 
                OPTIONAL { 
                    ?Track dbo:writer ?WritersLinks. 
                    ?WritersLinks rdfs:label ?Writers. 
                    FILTER(langMatches(lang(?Writers), "en")). 
                }
                
                OPTIONAL {
                    ?ArtistsLinks dbo:wikiPageID ?ArtistIds. 
                }
                
                OPTIONAL {
                    ?ArtistsLinks rdf:type dbo:Group.
                    ?ArtistsLinks dbo:wikiPageID ?Bands.
                }
                
                FILTER(str(?Track) = "${this.props.trackId}").
                FILTER(langMatches(lang(?Name), "en")).
                FILTER(langMatches(lang(?Artists), "en")).  
                FILTER(langMatches(lang(?Albums), "en")). 
                FILTER(langMatches(lang(?Genres), "en")).
            } GROUP BY ?Name ?Desc`;
        const formData = new FormData();
        formData.append('query', request);
        const res = await (await fetch(`http://dbpedia.org/sparql`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json'
            },
            body: formData
        })).json();
        if (res.results.bindings.length) {
            this.setState({song: res.results.bindings[0]});
            this.fetchMedias();
        } else {
            this.setState({ notFound: true });
        }

    }

    fetchMedias = async () => {
        const trackData = this.formatTrackData();
        const medias = await mediasUtil.getTrackMedias(trackData.artists[0], trackData.name);
        this.setState({medias: {picture: medias.picture, video: medias.video, deezer: medias.deezer }});
    }

    renderAlbums = (trackData) => {
        const res = [];
        trackData.albums.forEach((album, index) => {
            res.push(<span key={trackData.albumsId[index]} className={"clickable"} onClick={() => this.props.openDetails("album", { albumId: trackData.albumsId[index]})}>{album}</span>);
            if (index < trackData.albums.length - 1) {
                res.push(<span key={index}>, </span>);
            }
        });
        return res;
    }

    renderArtists = (trackData) => {
        const res = [];
        trackData.artists.forEach((artist, index) => {
            res.push(<span key={trackData.artistsId[index]} className={"clickable"} onClick={() => trackData.bands.includes(trackData.artistsId[index]) ? this.props.openDetails('group', { groupId: trackData.artistsId[index] }) : this.props.openDetails('artist', { singerId: trackData.artistsId[index]})}>{artist}</span>);
            if (index < trackData.artists.length - 1) {
                res.push(<span key={index}>, </span>);
            }
        });
        return res;
    }

    render = () => {
        const trackData = this.formatTrackData();
        return (
            <div className={"page"}>
                <div className="panel">
                    {this.state.song ?
                        <>
                            <div className="titlebar">
                                <h1>{trackData.name}</h1>
                                <h2>{this.renderArtists(trackData)}</h2>
                            </div>
                            <div className="topbar">
                                <div>
                                    <strong>Description</strong>
                                    <p>{trackData.desc}</p>
                                </div>
                                <img src={this.state.medias.picture} alt={""}/>
                            </div>
                            <div className="main-infos">
                                <div>
                                    <strong>Album{trackData.albums.length > 1 ? 's' : ''}:</strong> {this.renderAlbums(trackData)}
                                </div>
                                <div><strong>First release:</strong> {trackData.releaseDate[0]}</div>
                            </div>
                            <div className="additional-infos">
                                <div>
                                    <strong>Producers</strong>
                                    {
                                        trackData.producers.length ?
                                            <ul>
                                                {trackData.producers.map(p => (
                                                    <li key={p}>{p}</li>
                                                ))}
                                            </ul> : <span>Unknown</span>
                                    }

                                </div>
                                <div>
                                    <strong>Record labels</strong>
                                    {
                                        trackData.recordLabels.length ?
                                            <ul>
                                                {trackData.recordLabels.map(p => (
                                                    <li key={p}>{p}</li>
                                                ))}
                                            </ul> : <span>Unknown</span>
                                    }
                                </div>
                                <div>
                                    <strong>Writers</strong>
                                    {
                                        trackData.writers.length ?
                                            <ul>
                                                {trackData.writers.map(p => (
                                                    <li key={p}>{p}</li>
                                                ))}
                                            </ul> : <span>Unknown</span>
                                    }
                                </div>
                                <div>
                                    <strong>Genres</strong>
                                    {
                                        trackData.genres.length ?
                                            <ul>
                                                {trackData.genres.map(p => (
                                                    <li key={p}>{p}</li>
                                                ))}
                                            </ul> : <span>Unknown</span>
                                    }
                                </div>
                            </div>
                            <div className="bottombar">
                                <div className="video">
                                    {this.state.medias.video ?

                                        <iframe title={'Youtube video'} width="560" height="315"
                                                src={`https://www.youtube-nocookie.com/embed/${this.state.medias.video}`}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen>
                                        </iframe> : null

                                    }
                                </div>
                                {this.state.medias.deezer ?
                                    <iframe title="Deezer artist" scrolling="yes" frameBorder="0"
                                            src={`https://www.deezer.com/plugins/player?format=classic&autoplay=false&playlist=true&width=700&height=350&color=EF5466&layout=&size=medium&type=tracks&id=${this.state.medias.deezer}&app_id=1`}
                                            width="700" height="100"/>
                                            : null
                                }
                            </div>
                        </>
                        : this.state.notFound ? <span>The information of this song cannot be found in English</span> : <CircularProgress className={"loading"}/>}
                </div>
            </div>
        )
    };

    formatTrackData = () => {
        if (!this.state.song) return null;
        const {Name, Desc, Genres, Artists, Albums, ReleaseDates, Producers, RecordLabels, Writers, AlbumsLinks, ArtistIds, Bands} = this.state.song;
        return {
            name: Name.value,
            desc: Desc.value,
            genres: Genres ? Genres.value.split('||') : [],
            artists: Artists.value.split('||'),
            albums: Albums.value.split('||'),
            releaseDate: ReleaseDates.value.split('||'),
            producers: Producers.value ? Producers.value.split('||') : [],
            recordLabels: RecordLabels ? RecordLabels.value.split('||') : [],
            writers: Writers ? Writers.value.split('||') : [],
            albumsId: AlbumsLinks.value.split('||'),
            artistsId: ArtistIds.value.split('||'),
            bands: Bands.value.split('||'),
        }
    }

}