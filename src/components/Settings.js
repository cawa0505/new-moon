import React, { Component } from 'react'
import { FaCog } from 'react-icons/lib/fa'

class Settings extends Component {
  constructor(props) {
    super(props)
    this.state = {
      url: ''
    }
  }

  render() {
    return (
      <div className="settings">
        <div className="container">
          <div className="top">
            <div className="cog" onClick={this.props.onCog}><FaCog /></div>
          </div>
          <h2>Settings</h2>
          <input placeholder="IP address" id="ip"/>
        </div>
      </div>
    )
  }
}

export default Settings
