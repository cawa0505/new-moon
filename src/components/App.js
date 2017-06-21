import React, { Component } from 'react'
import Mopidy from 'mopidy'
import { NotificationStack } from 'react-notification'

import PlayControls from './PlayControls'
import Settings from './Settings'
import TracksList from './TracksList'
import Search from './Search'
import Empty from './Empty'
import Cog from './Cog'

let throttle

const mopidyConfig = {
  autoConnect: true,
  backoffDelayMin: 4000,
  backoffDelayMax: 64000,
  webSocketUrl: 'ws://localhost:6680/mopidy/ws/',
  callingConvention: 'by-position-or-name'
}

const mopidy = new Mopidy(mopidyConfig)

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showSettings: false,
      notifications: [],
      count: 0,
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

  search(event = {target: {value: ''}}) {
    const term = event.target.value
    if (term !== '') {
      clearTimeout(throttle)
      this.setState({ searching: true })
      throttle = setTimeout(() => {
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

  addNotification(message) {
    const { notifications, count } = this.state
    const id = notifications.size + 1
    const newCount = count + 1
    return this.setState({
      count: newCount,
      notifications: [
        {
          message: message,
          key: newCount,
          action: 'Dismiss',
          dismissAfter: 2000,
          onClick: () => this.removeNotification(newCount)
        },
        ...notifications
      ]
    })
  }

  removeNotification(count) {
    const { notifications } = this.state
    this.setState({
      notifications: notifications.filter(n => n.key !== count)
    })
  }

  add(track) {
    mopidy.tracklist.add([track]).then((data) => {
      this.setState({searching: false})
      this.addNotification('Track added')
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
        <NotificationStack
          notifications={this.state.notifications}
          onDismiss={notification => this.setState({
            notifications: this.state.notifications.delete(notification)
          })}
        />
        <div className="top">
          <PlayControls status={this.state.playbackState} play={this.play} pause={this.pause}/>
          <Cog onCog={this.handleCogClick}/>
        </div>
        { this.state.showSettings ? <Settings onCog={this.handleCogClick} /> : null}
        <Search search={this.search} searching={this.state.searching} results={this.state.results} addTrack={this.add}/>
        {this.state.trackList.length === 0 ? (
          <Empty/>
        ) : (
          <TracksList trackList={this.state.trackList}/>
        )}
      </div>
    )
  }
}

export default App
