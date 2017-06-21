import React from 'react'
import Track from './Track'

const TracksList = (props) => (
  <div>
   {props.trackList.map((track, i) => <Track key={i} index={i} track={track} />)}
  </div>
)

export default TracksList
