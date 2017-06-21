import React from 'react'
import SearchResult from './SearchResult'

const Search = (props) => {
  const clear = () => {
    document.getElementById('search').value = ''
  }
  const addTrack = (track) => {
    props.addTrack(track)
    clear()
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

export default Search
