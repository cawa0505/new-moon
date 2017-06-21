import React from 'react'
import { FaSpotify, FaSoundcloud, FaYoutubePlay } from 'react-icons/lib/fa'

const Provider = (props) => {
  if (props.uri.startsWith('spotify:')) {
    return <FaSpotify/>
  }
  else if (props.uri.startsWith('soundcloud:')) {
    return <FaSoundcloud/>
  }
  else if (props.uri.startsWith('youtube:')) {
    return <FaYoutubePlay/>
  }
  else {
    return null
  }
}

export default Provider
