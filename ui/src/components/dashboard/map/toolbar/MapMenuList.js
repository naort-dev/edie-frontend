import React from 'react'
import IconButton from 'material-ui/IconButton'
import Menu, {MenuItem} from 'material-ui/Menu'
import SettingsIcon from 'material-ui-icons/Settings'

const buttonStyle = {
  padding: '4px',
  width: 40,
  height: 40
}

const MapMenuList = ({ onAdd, onRename, onDelete, onSave, onImport }) => (
  <div className="inline-block">
    <IconButton style={buttonStyle} >
      <SettingsIcon nativeColor="#545454"/>
    </IconButton>
    <Menu open={false}>
      {onAdd && <MenuItem onTouchTap={onAdd}>Add Map</MenuItem>}
      {onRename && <MenuItem onTouchTap={onRename}>Rename Map</MenuItem>}
      {onDelete && <MenuItem onTouchTap={onDelete}>Delete Map</MenuItem>}
      <MenuItem onTouchTap={onSave}>Export Map</MenuItem>
      <MenuItem onTouchTap={onImport}>Import Map</MenuItem>
    </Menu>
  </div>
)

export default MapMenuList
