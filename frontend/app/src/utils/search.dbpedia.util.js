function toTitleCase(str) { //cf : https://www.w3docs.com/snippets/javascript/how-to-convert-string-to-title-case-with-javascript.html
    return str.toLowerCase().split(' ').map(function(word) {
        return (word.charAt(0).toUpperCase() + word.slice(1));
    }).join(' ');
}

const searchAlbum = async (keyword) => {
  // ! TODO fix the problem here I think ArtistName should be GROUP_CONCAT
    const res = await fetch(
      `http://dbpedia.org/sparql?query=SELECT DISTINCT ?AlbumName ?Album
      (GROUP_CONCAT(DISTINCT ?ArtistName; SEPARATOR=", ") AS ?ArtistsNames)
        WHERE {
          ?Album a schema:MusicAlbum;
          foaf:name ?AlbumName;
          dbo:artist ?Artist.

          ?Artist rdfs:label ?ArtistName.
          
          FILTER(regex(lcase(str(?AlbumName)),   ".*${keyword}.*")).
          FILTER(langMatches(lang(?AlbumName), "en")). 
          FILTER(langMatches(lang(?ArtistName),"en")).
          } LIMIT 50`, {
          method: "GET",
          headers: {
              Accept: "application/json",
          },
      }
    );
    return (await res.json()).results.bindings;
}

const searchSinger = async (keyword) => {
    keyword = toTitleCase(keyword);
    const queryString = "select ?Name ?Id where { ?Singer rdf:type dbo:MusicalArtist. ?Singer dbo:wikiPageID ?Id. ?Singer rdfs:label ?Name. ?Singer dbo:activeYearsStartYear ?StartYear.  FILTER(regex(?Name, \".*" + keyword + ".*\") && langMatches(lang(?Name),\"EN\")). } LIMIT 20"; //StartYear pour vérifier que ce soit bien un artiste
    const formData = new FormData();
    formData.append('query', queryString)
    const res = await fetch("http://dbpedia.org/sparql", {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
        },
        body: formData
    });
    return (await res.json()).results.bindings;
}

const searchTrack = async (keyword) => {
    const res = await fetch(
      `http://dbpedia.org/sparql?query=SELECT DISTINCT ?Name ?Desc ?Track
    (GROUP_CONCAT(DISTINCT ?Artists; SEPARATOR="||") AS ?Artists)
WHERE {
    ?Track rdf:type dbo:Single.
    ?Track   foaf:name   ?Name. 
    ?Track dbo:musicalArtist ?ArtistsLinks.
    OPTIONAL {
        ?Track dbo:abstract ?Desc.
        FILTER(langMatches(lang(?Desc), "en")).
    }
    ?ArtistsLinks rdfs:label ?Artists.
    FILTER(regex(lcase(str(?Name)),   ".*${keyword}.*")).
    FILTER(langMatches(lang(?Name), "en")).
    FILTER(langMatches(lang(?Artists), "en")).
    
} GROUP BY ?Name ?Desc ?Track LIMIT 20`, {
          method: "GET",
          headers: {
              Accept: "application/json",
          },
      }
    )
    return (await res.json()).results.bindings;
}

const searchGroup = async (keyword) => {
  keyword = toTitleCase(keyword);
  const queryString = "select ?Id ?Name where { ?group rdf:type dbo:Group. ?group dbo:wikiPageID ?Id. ?group rdfs:label ?Name. ?group dbo:activeYearsStartYear ?StartYear. FILTER(regex(?Name, \".*" + keyword + ".*\") && langMatches(lang(?Name),\"EN\") ).} LIMIT 20";

  const formData = new FormData();
  formData.append('query', queryString)
  const res = await fetch("http://dbpedia.org/sparql", {
    method: 'POST',
    headers: {
      'Accept': 'application/json'
    },
    body: formData
  });
  return (await res.json()).results.bindings;
}

const exp = {
  searchAlbum,
  searchSinger,
  searchTrack,
  searchGroup,
}

export default exp;