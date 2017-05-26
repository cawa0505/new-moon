import React, { Component } from 'react'
import Mopidy from 'mopidy'
import axios from 'axios'

const mopidyConfig = {
  autoConnect: true,
  backoffDelayMin: 4000,
  backoffDelayMax: 64000,
  webSocketUrl: 'ws://localhost:6680/mopidy/ws/',
  callingConvention: 'by-position-or-name'
}

const mopidy = new Mopidy(mopidyConfig)

const Search = (props) => (
  <div className={props.searching ? "search active" : "search"}>
    <div className="container">
      <input placeholder="Search" onChange={props.search} />
      {!props.searching ? (
        null
      ) : (
        <div className="results">
          {props.results.tracks.map((track, index) => <SearchResult key={index} track={track} addTrack={() => props.addTrack(track)}/> )}
        </div>
      )}
    </div>
  </div>
)

const SearchResult = (props) => (
  <div onClick={props.addTrack} className="result">
    <h3>{props.track.name}</h3>
    <p>{props.track.artists[0].name}</p>
  </div>
)

const TracksList = (props) => (
  <div>
   {props.trackList.map((track, i) => <Track key={i} index={i} track={track.track} />)}
  </div>
)

const Track = (props) => (
  <div className={props.index === 0 ? "track nowplaying" : "track"}>
    <img className="art" src={props.track.album.art}/>
    <div>
      <h3>{props.track.name}</h3>
      <p>{props.track.artists[0].name}</p>
    </div>
  </div>
)

const Playback = (props) => (
  <div>
    <button onClick={props.play}>Play</button>
    <button onClick={props.stop}>Stop</button>
  </div>
)

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      trackList: [],
      results: {
        tracks: [],
        artists: [],
        albums: []
      }
    }
    this.getTracks = this.getTracks.bind(this)
    this.search = this.search.bind(this)
    this.add = this.add.bind(this)
  }

  componentDidMount() {
    // mopidy.on(console.log.bind(console))
    mopidy.on('state:online', () => {
      this.getTracks()
    })

    mopidy.on('event:tracklistChanged', () => {
      this.getTracks()
    })

    mopidy.on('event:trackPlaybackStarted', () => {
      this.getTracks()
    })

  }

  search(event) {
    if (event.target.value !== '') {
      this.setState({ searching: true })
      mopidy.library.search({'any': [event.target.value]}, ['spotify:']).then((data) => {
        let results = {
            'tracks': [],
            'artists': [],
            'albums': []
        }
        for (var i = 0; i < data.length; i++) {
          Object.keys(results).forEach((key, index) => {
            if (data[i][key] && data[i][key].length) {
              results[key] = results[key].concat(data[i][key])
            }
          })
        }
        this.setState({ results })
      })
    } else {
      this.setState({ results: {}, searching: false })
    }
  }

  add(track) {
    mopidy.tracklist.add([track]).then((data) => {
      this.setState({searching: false})
    })
  }

  getTracks() {
    mopidy.tracklist.getTlTracks().then((tracks) => {
      if (tracks.length > 0) {
        mopidy.playback.getCurrentTlTrack().then((currentTrack) => {
          mopidy.tracklist.index(currentTrack).then((trackIndex) => {
            mopidy.tracklist.getLength().then((trackListLength) => {
              mopidy.tracklist.slice(trackIndex, trackListLength).then((trackList) => {
                let tracks = trackList.map(this.getArt)
                let results = Promise.all(tracks)
                  .then(tracks => {
                    this.setState({ trackList: tracks })
                  })
              })
            })
          })
        })
      }
    })
  }

  getArt(track) {
    if (track.track.uri.startsWith('spotify:track:')) {
      return new Promise((resolve, reject) => {
        axios.get('//api.spotify.com/v1/tracks/' + track.track.uri.slice('spotify:track:'.length))
          .then((response) => {
            track.track.album.art = response.data.album.images[0].url
            resolve(track)
          })
          .catch((error) => {
            console.error(error)
          })
      })
    }
  }

  play() {
    mopidy.playback.play()
  }

  stop() {
    mopidy.playback.stop()
  }
  // <Playback play={this.play} stop={this.stop}/>

  render() {
    return (
      <div className="container">
        <Search search={this.search} searching={this.state.searching} results={this.state.results} addTrack={this.add}/>
        {this.state.trackList.length === 0 ? (
          <p>No tracks are queued</p>
        ) : (
          <TracksList trackList={this.state.trackList}/>
        )}
      </div>
    )
  }
}

export default App
