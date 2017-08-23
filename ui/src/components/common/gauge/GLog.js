import React from 'react'
import moment from 'moment'
// import {IconButton} from 'material-ui'
// import RefreshIcon from 'material-ui/svg-icons/navigation/refresh'

import FlipView from './FlipView'
import GEditView from './GEditView'

import {showAlert} from 'components/common/Alert'

export default class GLog extends React.Component {
  constructor (props) {
    super (props)
    this.state = {
      value: parseInt(Math.random() * 100, 10),
      draw: 1,
      hover: false
    }
    this.renderBackView = this.renderBackView.bind(this)
    this.renderFrontView = this.renderFrontView.bind(this)
    this.onMouseEnter = this.onMouseEnter.bind(this)
    this.onMouseOut = this.onMouseOut.bind(this)
  }

  onSubmit (options, values) {
    console.log(values)

    if (!values.name) {
      showAlert('Please type name.')
      return
    }
    const gauge = {
      ...this.props.gauge,
      ...values
    }

    this.props.updateDeviceGauge(gauge, this.props.device)
    options.onClickFlip()
  }

  onClickDelete () {
    this.props.removeDeviceGauge(this.props.gauge, this.props.device)
  }

  onClickRefresh () {
    this.setState({
      draw: this.state.draw + 1
    })
  }

  onMouseEnter () {
    this.setState({hover: true})
  }

  onMouseOut () {
    this.setState({hover: false})
  }
  getLogMonitors () {
    const {devices, gauge} = this.props

    let monitors = []

    const monitorIds = gauge.monitorIds || []
    devices.forEach(device => {
      monitors = monitors.concat((device.monitors || []).filter(monitor => monitorIds.includes(monitor.uid)))
    })
    return monitors
  }
  onClickLog (monitor) {
    setTimeout(() => {
      this.props.history.push('/search')
      this.props.loadSearch({
        monitorid: monitor.uid
      }, this.props.history)
    }, 1)
  }
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  renderRefresh (data) {
    // const {hover} = this.state
    // if (data.viewFilter !== viewFilters.log.name || !hover) return null
    //
    // return (
    //   <div style={{zIndex: 3}}>
    //     <div style={{position: 'absolute', right: 10, top: 4}}>
    //       <IconButton onTouchTap={this.onClickRefresh.bind(this)}>
    //         <RefreshIcon size={32}/>
    //       </IconButton>
    //     </div>
    //   </div>
    // )
  }
  renderFrontView () {
    return (
      <div className="flex-vertical flex-1" onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseOut}>
        <div className="flex-1" style={{overflow: 'auto'}}>
          <table className="table table-hover">
            <tbody>
            {this.getLogMonitors().map(p =>
              <tr key={p.uid} onClick={this.onClickLog.bind(this, p)}>
                <td>
                  <img src="/resources/images/dashboard/log.png" width="16" className="valign-middle" alt=""/>
                  <div className="valign-middle margin-xs-left inline-block">
                    <span className="text-primary">{p.name}</span>
                    &nbsp;updated&nbsp;
                    {p.lastrun ? moment(p.lastrun).format('MMM DD, YYYY') : ' '} •&nbsp;
                    <span style={{cursor: 'pointer'}} className="text-primary">view change</span>
                  </div>
                </td>
              </tr>
            )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
  renderBackView (options) {
    return (
      <div>
        <GEditView
          {...this.props}
          onSubmit={this.onSubmit.bind(this, options)}
          hideSplit
        />
      </div>
    )
  }
  render () {
    return (
      <FlipView
        {...this.props}

        style={this.props.style}
        className={this.props.className}
        gauge={this.props.gauge}

        loading={this.state.loading}
        renderFrontView={this.renderFrontView}
        renderBackView={this.renderBackView}

        onClickDelete={this.onClickDelete.bind(this)}
      />
    )
  }
}
