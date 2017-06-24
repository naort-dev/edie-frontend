import React from 'react'

import SavedSearchModalView from './SavedSearchModalView'
import {showAlert} from 'components/common/Alert'

export default class SavedSearchModal extends React.Component {
  componentWillMount () {
    this.props.fetchSysSearchOptions()
    this.props.selectSearch(null)
  }
  componentWillUpdate (props) {
    const {shareSearchResult} = this.props
    if (props.shareSearchResult && shareSearchResult !== props.shareSearchResult) {
      if (props.shareSearchResult === 'OK') showAlert('Shared successfully!')
      else showAlert('Share failed!')
    }
  }
  onClickClose () {
    this.props.showSavedSearch(false)
  }
  onClickOK () {
    const {selectedSearch} = this.props
    if (!selectedSearch) return null
    this.props.onChangeSearchOption(selectedSearch)
    this.onClickClose()
  }
  onClickRow (p) {
    this.props.selectSearch(p)
  }
  onClickShare (p) {
    const props = {
      name: p.name,
      data: p.data,
      description: '',
      origin: 'USER'
    }
    this.props.shareSavedSearch(props)
  }
  render () {
    return (
      <SavedSearchModalView
        {...this.props}
        onClickRow={this.onClickRow.bind(this)}
        onClickOK={this.onClickOK.bind(this)}
        onClickClose={this.onClickClose.bind(this)}
        onClickShare={this.onClickShare.bind(this)}
      />
    )
  }
}
