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
    this.suggestions = ["acousticness", "danceability", "duration_ms",
                      "energy", "instrumentalness", "key", "liveness",
                      "loudness", "mode", "popularity", "speechiness",
                      "tempo", "time_signature", "valence"]
                      .map((feature) => {
                        return {id: feature, text: feature};
                      });

    const params = this.getHashParams();
    const token = params.access_token;
    if (token) {
      spotifyApi.setAccessToken(token);
    }
    this.state = {
      loggedIn: token ? true : false,
      features: [],
    }

    this.handleFeatureDelete = this.handleFeatureDelete.bind(this);
    this.handleFeatureAddition = this.handleFeatureAddition.bind(this);
    this.handleFeatureDrag = this.handleFeatureDrag.bind(this);
    this.getRecommendations = this.getRecommendations.bind(this);
  }

  handleFeatureDelete(i) {
    const { features } = this.state;
    this.setState({
     features: features.filter((feature, index) => index !== i),
    });
  }

  handleFeatureAddition(feature) {
      this.setState(state => ({ features: [...state.features, feature] }));
  }

  handleFeatureDrag(feature, currPos, newPos) {
      const features = [...this.state.features];
      const newFeatures = features.slice();

      newFeatures.splice(currPos, 1);
      newFeatures.splice(newPos, 0, feature);

      // re-render
      this.setState({ features: newFeatures });
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
    spotifyApi.getRecommendations({seed_genres: "classical"})
      .then(
        function(res){
          console.log("res");
          console.log(res);
        },function(err){
          console.log("err");
          console.log(err);
        }
      );
  }

  render() {
    //console.log(suggestions);
    let features = this.state.features; 

    let sliders = this.state.features.map((feature) => {
      return (
        <div>
          <input type="range" min="1" max="100" className="slider" id={feature.id}>
          </input>
          {feature.text}
        </div>
        );
    });

    return (
      <div className="App">
        <a href='
  http://localhost:8888' > Login to Spotify </a>
        { this.state.loggedIn &&
          <div>
            <div>
                  {sliders}
                  <ReactTags features={features}
                      suggestions={this.suggestions}
                      handleDelete={this.handleFeatureDelete}
                      handleAddition={this.handleFeatureAddition}
                      handleDrag={this.handleFeatureDrag}
                      delimiters={delimiters} />
            </div>
            <div>
              <button onClick={this.getRecommendations}>Get Recommendations</button>
            </div>
          </div>
        }
      </div>
    );
  }
}

