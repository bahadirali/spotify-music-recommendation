import React from 'react';
import SpotifyWebApi from 'spotify-web-api-js';
import { WithContext as ReactTags } from 'react-tag-input';

import './App.css';

const KeyCodes = {
  comma: 188,
  enter: 13,
};
 
const delimiters = [KeyCodes.comma, KeyCodes.enter];


const spotifyApi = new SpotifyWebApi();

export default class App extends React.Component {
  constructor() {
    super();
    this.available_features = FEATURES.map((feature) => {
                                return {id: feature, text: feature};
                              });

    this.available_genres = GENRES.map((genre) => {
                              return {id: genre, text: genre};
                            });;

    const params = this.getHashParams();
    const token = params.access_token;
    if (token) {
      spotifyApi.setAccessToken(token);
    }
    this.state = {
      loggedIn: token ? true : false,
      features: [],
      valuesOfFeatures: {},
      genres: [],
      recommended_songs: [],
    }

    this.handleFeatureDelete = this.handleFeatureDelete.bind(this);
    this.handleFeatureAddition = this.handleFeatureAddition.bind(this);
    this.handleFeatureDrag = this.handleFeatureDrag.bind(this);

    this.handleGenreDelete = this.handleGenreDelete.bind(this);
    this.handleGenreAddition = this.handleGenreAddition.bind(this);
    this.handleGenreDrag = this.handleFeatureDrag.bind(this);

    this.getRecommendations = this.getRecommendations.bind(this);
  }

  handleFeatureDelete(i) {
    const { features } = this.state;
    this.setState({
     features: features.filter((feature, index) => index !== i),
    });
  }

  handleFeatureAddition(feature) {
    let vof = this.state.valuesOfFeatures;
    vof[feature.text] = 0;
      this.setState(state => ({ 
        features: [...state.features, feature],
        valuesOfFeatures: vof, 
      }));
  }

  handleFeatureDrag(feature, currPos, newPos) {
      const features = [...this.state.features];
      const newFeatures = features.slice();

      newFeatures.splice(currPos, 1);
      newFeatures.splice(newPos, 0, feature);

      // re-render
      this.setState({ features: newFeatures });
  }

  handleGenreDelete(i) {
    const { genres } = this.state;
    this.setState({
     genres: genres.filter((genre, index) => index !== i),
    });
  }

  handleGenreAddition(genre) {
      this.setState(state => ({ 
        genres: [...state.genres, genre],
      }));
  }

  handleGenreDrag(genre, currPos, newPos) {
      const genres = [...this.state.genres];
      const newGenres = genres.slice();

      newGenres.splice(currPos, 1);
      newGenres.splice(newPos, 0, genre);

      // re-render
      this.setState({ genres: newGenres });
  }

  getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    e = r.exec(q)
    while (e) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
       e = r.exec(q);
    }
    return hashParams;
  }

  getRecommendations(){
    let parameters = {seed_genres: "classical"};
    this.state.features.forEach((feature) => {
      parameters[feature.id] = this.state.valuesOfFeatures[feature.id];
    });
    console.log(parameters);
    spotifyApi.getRecommendations(parameters)
      .then(
        (res) => {
          let songs = res.tracks.map((track) => {
            return {song : track.name, 
                    artist : track.artists[0].name, 
                    link : track.external_urls.spotify};
          });
          this.setState({
            recommended_songs: songs,
          });
          console.log(songs);
        })
      .catch((err) => {
          console.log(err);
        });
  }

  handleFeatureValueChange(event, feature){
    let vof = this.state.valuesOfFeatures;
    vof[feature.id] = event.target.value;
    this.setState({
      valuesOfFeatures: vof,
    });
  }

  render() { 
    let feature_sliders = this.state.features.map((feature) => {
      return (
        <div key={feature.id}>
          <input type="range" min="0" max="1" step="0.01" className="slider"
          value={this.state.valuesOfFeatures[feature.id]}
          onChange={(event) => this.handleFeatureValueChange(event, feature)} 
          id={feature.id}>
          </input>
          {feature.text}
        </div>
        );
    });

    let rec_songs = this.state.recommended_songs.map((track, index) => {
      return (
        <tr key={index}>
          <td>
          <a href={track.link}>{track.song}</a>
          </td>
          <td>
            {track.artist}
          </td>
        </tr>
      );
    });

    rec_songs = (
      <table>
        <tbody>
          {rec_songs}
        </tbody>
      </table>
    );

    return (
      <div className="App">
        <a href='
  http://localhost:8888' > Login to Spotify </a>
        { this.state.loggedIn &&
          <div>
            <div>
                  {feature_sliders}
                  Features
                  <ReactTags tags={this.state.features}
                      suggestions={this.available_features}
                      handleDelete={this.handleFeatureDelete}
                      handleAddition={this.handleFeatureAddition}
                      handleDrag={this.handleFeatureDrag}
                      delimiters={delimiters} />
            </div>
            <div>
                  Genres
                  <ReactTags tags={this.state.genres}
                      suggestions={this.available_genres}
                      handleDelete={this.handleGenreDelete}
                      handleAddition={this.handleGenreAddition}
                      handleDrag={this.handleGenreDrag}
                      delimiters={delimiters} />
            </div>
            <div>
              <button onClick={this.getRecommendations}>Get Recommendations</button>
            </div>
            <div>
              {rec_songs}
            </div>
          </div>
        }
      </div>
    );
  }
}

const FEATURES = ["acousticness", "danceability",
"energy", "instrumentalness", "liveness",
"mode", "popularity", "speechiness", "valence"];

const GENRES = [
  "acoustic",
  "afrobeat",
  "alt-rock",
  "alternative",
  "ambient",
  "anime",
  "black-metal",
  "bluegrass",
  "blues",
  "bossanova",
  "brazil",
  "breakbeat",
  "british",
  "cantopop",
  "chicago-house",
  "children",
  "chill",
  "classical",
  "club",
  "comedy",
  "country",
  "dance",
  "dancehall",
  "death-metal",
  "deep-house",
  "detroit-techno",
  "disco",
  "disney",
  "drum-and-bass",
  "dub",
  "dubstep",
  "edm",
  "electro",
  "electronic",
  "emo",
  "folk",
  "forro",
  "french",
  "funk",
  "garage",
  "german",
  "gospel",
  "goth",
  "grindcore",
  "groove",
  "grunge",
  "guitar",
  "happy",
  "hard-rock",
  "hardcore",
  "hardstyle",
  "heavy-metal",
  "hip-hop",
  "holidays",
  "honky-tonk",
  "house",
  "idm",
  "indian",
  "indie",
  "indie-pop",
  "industrial",
  "iranian",
  "j-dance",
  "j-idol",
  "j-pop",
  "j-rock",
  "jazz",
  "k-pop",
  "kids",
  "latin",
  "latino",
  "malay",
  "mandopop",
  "metal",
  "metal-misc",
  "metalcore",
  "minimal-techno",
  "movies",
  "mpb",
  "new-age",
  "new-release",
  "opera",
  "pagode",
  "party",
  "philippines-opm",
  "piano",
  "pop",
  "pop-film",
  "post-dubstep",
  "power-pop",
  "progressive-house",
  "psych-rock",
  "punk",
  "punk-rock",
  "r-n-b",
  "rainy-day",
  "reggae",
  "reggaeton",
  "road-trip",
  "rock",
  "rock-n-roll",
  "rockabilly",
  "romance",
  "sad",
  "salsa",
  "samba",
  "sertanejo",
  "show-tunes",
  "singer-songwriter",
  "ska",
  "sleep",
  "songwriter",
  "soul",
  "soundtracks",
  "spanish",
  "study",
  "summer",
  "swedish",
  "synth-pop",
  "tango",
  "techno",
  "trance",
  "trip-hop",
  "turkish",
  "work-out",
  "world-music"
];