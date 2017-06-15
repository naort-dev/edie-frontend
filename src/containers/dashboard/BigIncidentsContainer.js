import React, { Component } from 'react'
import BigIncidents from 'components/dashboard/main_incidents_table/BigIncidents'
import {connect} from 'react-redux'
import { withRouter } from 'react-router'

import { fetchBigIncidents, updateBigIncidentParams } from 'actions'

@connect(
  state => ({
    incidents: state.dashboard.bigIncidents,
    bigIncidentParams: state.dashboard.bigIncidentParams
  }), {
    fetchBigIncidents,
    updateBigIncidentParams
  }
)
@withRouter
export default class BigIncidentsContainer extends Component {
  render () {
    return (
      <BigIncidents {...this.props} />
    )
  }
}
