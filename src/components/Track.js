import React from 'react'
import Provider from './Provider'

const Track = (props) => (
  <div className={props.index === 0 ? "track nowplaying" : "track"}>
    <div className="art">
      {props.track.album.images[0] ? <img src={props.track.album.images[0]} alt={props.track.name}/> : null}
    </div>
    <div>
      <h3>{props.track.name}</h3>
      <p>{props.track.artists.map((artist, index) => artist.name).join(', ')}</p>
      <Provider uri={props.track.uri} />
    </div>
  </div>
)

export default Track
