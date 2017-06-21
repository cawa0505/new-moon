import React from 'react'
import Provider from './Provider'

const SearchResult = (props) => (
  <div onClick={props.addTrack} className="result">
    <h3>{props.track.name}</h3>
    <p>{props.track.artists.map((artist, index) => artist.name).join(', ')}</p>
    <Provider uri={props.track.uri} />
  </div>
)

export default SearchResult
