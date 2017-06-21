import React from 'react'
import SearchResult from './SearchResult'

const Search = (props) => {
  const clear = () => {
    document.getElementById('search').value = ''
    props.search()
  }
  const addTrack = (track) => {
    props.addTrack(track)
    clear()
  }
  return (
    <div className={props.searching ? "search active" : "search"}>
      <div className="container">
        <input type="search" placeholder="Search" onChange={props.search} id="search" autoComplete="off"/>
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
