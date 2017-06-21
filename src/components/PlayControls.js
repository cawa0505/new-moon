import React from 'react'
import { FaPlay, FaPause } from 'react-icons/lib/fa'

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

export default PlayControls
