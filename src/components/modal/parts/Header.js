import React from 'react'
import { headerStyle } from '../../../style/materialStyles'

const Header = ({name, onClick}) => (
  <div className="modal-header" style={headerStyle}>
    <h4 className="modal-title">{name}</h4>
    <div className="bootstrap-dialog-close-button">
      <button className="close" onClick={onClick}>×</button>
    </div>
  </div>
)

export default Header
