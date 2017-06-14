import React, { Component } from 'react'
import Mopidy from 'mopidy'
import axios from 'axios'
import { FaSpotify, FaSoundcloud, FaYoutubePlay, FaCog , FaPlay, FaPause } from 'react-icons/lib/fa'

import Settings from './Settings'
let throttle

const mopidyConfig = {
  autoConnect: true,
  backoffDelayMin: 4000,
  backoffDelayMax: 64000,
  webSocketUrl: 'ws://localhost:6680/mopidy/ws/',
  callingConvention: 'by-position-or-name'
}

const mopidy = new Mopidy(mopidyConfig)

const Cog = (props) => (
  <div className="cog" onClick={props.onCog}><FaCog /></div>
)

const PlayControls = (props) => (
  <div className="play">
    {props.status === 'playing' ? (
      <div onClick={props.pause}>
        <FaPause/>
      </div>
    ) : (
      <div onClick={props.play}>
        <FaPlay/>
      </div>
    )}
  </div>
)

const Search = (props) => {
  const addTrack = (track) => {
    props.addTrack(track)
    clear()
  }
  const clear = () => {
    document.getElementById('search').value = ''
  }
  return (
    <div className={props.searching ? "search active" : "search"}>
      <div className="container">
        <input placeholder="Search" onChange={props.search} id="search"/>
        {!props.searching ? (
          null
        ) : (
          <div className="results">
            {props.results.tracks.map((track, index) => <SearchResult key={index} track={track} addTrack={() => addTrack(track)}/> )}
          </div>
        )}
      </div>
    </div>
  )
}

const SearchResult = (props) => (
  <div onClick={props.addTrack} className="result">
    <h3>{props.track.name}</h3>
    <p>{props.track.artists[0].name}</p>
    <Provider uri={props.track.uri} />
  </div>
)

const TracksList = (props) => (
  <div>
   {props.trackList.map((track, i) => <Track key={i} index={i} track={track} />)}
  </div>
)

const Track = (props) => (
  <div className={props.index === 0 ? "track nowplaying" : "track"}>
    <div className="art">
      {props.track.album.images[0] ? <img src={props.track.album.images[0]}/> : null}
    </div>
    <div>
      <h3>{props.track.name}</h3>
      <p>{props.track.artists[0].name}</p>
      <Provider uri={props.track.uri} />
    </div>
  </div>
)

const Provider = (props) => {
  if (props.uri.startsWith('spotify:')) {
    return <FaSpotify />
  }
  else if (props.uri.startsWith('soundcloud:')) {
    return <FaSoundcloud />
  }
  else if (props.uri.startsWith('youtube:')) {
    return <FaYoutubePlay />
  }
  else {
    return null
  }
}

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
      showSettings: false,
      trackList: [],
      results: {
        tracks: [],
      }
    }
    this.getTracks = this.getTracks.bind(this)
    this.search = this.search.bind(this)
    this.add = this.add.bind(this)
    this.play = this.play.bind(this)
    this.pause = this.pause.bind(this)
    this.handleCogClick = this.handleCogClick.bind(this)
  }

  componentDidMount() {
    // mopidy.on(console.log.bind(console))
    mopidy.on('state:online', () => {
      this.getTracks()
      mopidy.playback.getState().then((data) => {
        this.setState({ playbackState: data })
      })
    })

    mopidy.on('event:tracklistChanged', () => {
      // Check play status and change page title to using document.title = '▶' + track.name
      this.getTracks()
    })

    mopidy.on('event:trackPlaybackStarted', () => {
      this.getTracks()
    })

    mopidy.on('event:playbackStateChanged', (data) => {
      this.setState({ playbackState: data.new_state })
    })
  }

  search(event) {
    const term = event.target.value
    if (term !== '') {
      clearTimeout(throttle)
      throttle = setTimeout(() => {
        this.setState({ searching: true })
        mopidy.library.search({'any': [term]}).then((data) => {
          let results = {
            'tracks': [],
          }
          data.forEach((key, index) => {
            if (key.tracks) {
              Array.prototype.push.apply(results.tracks, key.tracks)
            }
          })
          this.setState({ results })
        })
      }, 400)

    } else {
      this.setState({ results: {
        'tracks': [],
      }, searching: false })
    }
  }

  add(track) {
    mopidy.tracklist.add([track]).then((data) => {
      this.setState({searching: false})
    })
    .catch((error) => {
      console.error(error)
    })
  }

  getTracks() {
    mopidy.tracklist.getTlTracks().then((tracks) => {
      if (tracks.length > 0) {
        mopidy.playback.getCurrentTlTrack().then((currentTrack) => {
          mopidy.tracklist.index(currentTrack).then((trackIndex) => {
            mopidy.tracklist.getLength().then((trackListLength) => {
              mopidy.tracklist.slice(trackIndex, trackListLength).then((tracks) => {
                tracks = tracks.map(this.getArt) //get artwork
                Promise.all(tracks)
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
    return new Promise((resolve, reject) => {
      mopidy.library.getImages([track.track.uri]).then((response) => {
        track.track.album.images = [response[Object.keys(response)[0]][0].uri]
        resolve(track.track)
      }).catch((error) => {
        console.error(error)
      })
    })
  }

  handleCogClick() {
    this.setState({showSettings: !this.state.showSettings})
  }

  play() {
    if (this.state.playbackState === 'paused') {
      mopidy.playback.resume()
    }
    else {
      mopidy.playback.play()
    }
  }

  pause() {
    mopidy.playback.pause()
  }

  render() {
    return (
      <div className="container">
        <div className="top">
          <PlayControls status={this.state.playbackState} play={this.play} pause={this.pause}/>
          <Cog onCog={this.handleCogClick}/>
        </div>
        { this.state.showSettings ? <Settings onCog={this.handleCogClick} /> : null}
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
