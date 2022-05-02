const getTrackMedias = async(artistName, trackName) => {
    const youtubeVideoStartLink = 'http://www.youtube.com/watch?v=';
    let picture = '';
    let video = '';
    let deezer = '';
    try {
        const res = await fetch(
            `https://theaudiodb.com/api/v1/json/1/searchtrack.php?s=${artistName}&t=${trackName}`
        );
        const jsonResponse = await res.json();
        if (jsonResponse && jsonResponse.track && jsonResponse.track.length) {
            const track = jsonResponse.track[0];
            picture = track.strTrackThumb;
            const trackVideo = track.strMusicVid;
            if (trackVideo && trackVideo.startsWith(youtubeVideoStartLink)) {
                video = trackVideo.substring(
                    youtubeVideoStartLink.length,
                    trackVideo.length
                );
            }
        }

        const deezerRes = await fetch(`https://cors-anywhere.herokuapp.com/https://api.deezer.com/search?q=artist:"${artistName}"track:"${trackName}"`);
        const jsonDeezer = await deezerRes.json();
        if (jsonDeezer && jsonDeezer.data && jsonDeezer.data.length) {
            deezer = jsonDeezer.data[0].id;
        }
    } catch (error) {
        console.error(error);
    }
    return {
        picture,
        video,
        deezer,
    };
};

const getSingerMedias = async(singerName) => {
    let picture = '';
    let topSongs = '';
    let biography = '';
    let deezer = '';
    try {
        const res = await fetch(
            `https://theaudiodb.com/api/v1/json/1/search.php?s=${singerName}`
        );
        const jsonResponse = await res.json();
        if (jsonResponse && jsonResponse.artists && jsonResponse.artists.length) {
            const singer = jsonResponse.artists[0];
            picture = singer.strArtistThumb || '';
            topSongs = singer.strLastFMChart;
            biography = singer.strBiographyEN || '';
        }

        const deezerRes = await fetch(`https://cors-anywhere.herokuapp.com/https://api.deezer.com/search/artist?q=artist:"${singerName}"`);
        const jsonDeezer = await deezerRes.json();
        if (jsonDeezer && jsonDeezer.data && jsonDeezer.data.length) {
            deezer = jsonDeezer.data[0].id;
        }
    } catch (error) {
        console.error(error);
    }
    return {
        picture,
        topSongs,
        biography,
        deezer,
    };
};

const getAlbumMedias = async (artistName, albumName) => {
    let albumPic = '';
    let deezerId = '';
    try {
        const res = await fetch(`https://theaudiodb.com/api/v1/json/1/searchalbum.php?s=${artistName}&a=${albumName}`);
        const jsonResponse = await res.json();
        if (jsonResponse && jsonResponse.album && jsonResponse.album.length) {
            const album = jsonResponse.album[0];
            albumPic = album.strAlbumThumb || '';
        }
        const deezerRes = await fetch(`https://cors-anywhere.herokuapp.com/https://api.deezer.com/search/album?q=album:"${albumName}"artist:"${artistName}"`);
        const jsonDeezer = await deezerRes.json();
        if (jsonDeezer && jsonDeezer.data && jsonDeezer.data.length) {
            deezerId = jsonDeezer.data[0].id || '';
        }
    } catch (error) {
        console.error(error);
    }
    return {
        picture: albumPic,
        deezer: deezerId,
    };
}

const exp = {
    getTrackMedias,
    getSingerMedias,
    getAlbumMedias,
}

export default exp;