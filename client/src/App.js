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
    const params = this.getHashParams();
    const token = params.access_token;
    if (token) {
      spotifyApi.setAccessToken(token);
    }
    this.state = {
      loggedIn: token ? true : false,
      nowPlaying: { name: 'Not Checked', albumArt: '' },
      genres: [],
      tags: [],
      temp: 15,
    }

    this.getSavedSongs = this.getSavedSongs.bind(this);
    this.handleTagDelete = this.handleTagDelete.bind(this);
    this.handleTagAddition = this.handleTagAddition.bind(this);
    this.handleTagDrag = this.handleTagDrag.bind(this);
    this.tempChange = this.tempChange.bind(this);
  }

  handleTagDelete(i) {
    const { tags } = this.state;
    this.setState({
     tags: tags.filter((tag, index) => index !== i),
    });
  }

  handleTagAddition(tag) {
      this.setState(state => ({ tags: [...state.tags, tag] }));
  }

  handleTagDrag(tag, currPos, newPos) {
      const tags = [...this.state.tags];
      const newTags = tags.slice();

      newTags.splice(currPos, 1);
      newTags.splice(newPos, 0, tag);

      // re-render
      this.setState({ tags: newTags });
  }

  componentDidMount() {
    if(spotifyApi.getAccessToken()){
      spotifyApi.getAvailableGenreSeeds()
        .then((response) => {
          this.setState({
            genres: response.genres.map((genre) => {
              return {id: genre, text: genre};
            }),
          });
        }, (error) => {
          console.log("error");
          console.log(error);
        });
    }
  }

  getNowPlaying(){
    spotifyApi.getMyCurrentPlaybackState()
      .then((response) => {
        this.setState({
          nowPlaying: { 
              name: response.item.name, 
              albumArt: response.item.album.images[0].url
            }
        });
      });
  }

  getSavedSongs(){
    //console.log("here");
    spotifyApi.getMySavedTracks()
      .then((response) => {
        response.items.forEach((track) => (console.log(track.track.name)));
        /*this.setState({

        });*/
      });
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

  tempChange(event){
    this.setState({
      temp: event.target.value,
    });
  }

  render() {
    let suggestions = ["acousticness", "danceability", "duration_ms",
                      "energy", "instrumentalness", "key", "liveness",
                      "loudness", "mode", "popularity", "speechiness",
                      "tempo", "time_signature", "valence"].
                      map((feature) => {
                        return {id: feature, text: feature};
                      });
    //console.log(suggestions);
    let tags = this.state.tags;
    let genres = [];
    genres = this.state.genres.map((genre) => {
      return <option value={genre} key={genre}>{genre}</option>
    });

    return (
      <div className="App">
        <a href='
  http://localhost:8888' > Login to Spotify </a>
        <div>
          <input 
            type="range" min="1" max="100" value={this.state.temp} 
            onChange={this.tempChange} class="slider" id="myRange">
          </input>
          {this.state.temp}
        </div>
        {
          false && this.state.loggedIn && 
          <div>
            <select>
              {genres}
            </select>
          </div>
        }
        {
          this.state.loggedIn &&
          <div>
                <ReactTags tags={tags}
                    suggestions={suggestions}
                    handleDelete={this.handleTagDelete}
                    handleAddition={this.handleTagAddition}
                    handleDrag={this.handleTagDrag}
                    delimiters={delimiters} />
          </div>
        }
        {false && 
          <div>
            <div>
              Now Playing: { this.state.nowPlaying.name }
            </div>
            <div>
              <img src={this.state.nowPlaying.albumArt} style={{ height: 150 }} alt=""/>
            </div>
          </div>
        }
        { this.state.loggedIn && false &&
          <button onClick={() => this.getNowPlaying()}>
            Check Now Playing
          </button>
        }
      </div>
    );
  }
}

