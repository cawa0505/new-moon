import React from 'react'
import { MdMusicNote } from 'react-icons/lib/md'

const Empty = () => (
  <div className="empty">
    <MdMusicNote className="icon" size={200}/>
    <h2>No tracks are queued</h2>
    <p>Add some using the search box above.</p>
  </div>
)

export default Empty
