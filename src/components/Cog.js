import React from 'react'
import { FaCog } from 'react-icons/lib/fa'

const Cog = (props) => (
  <div className="cog" onClick={props.onCog}><FaCog/></div>
)

export default Cog
