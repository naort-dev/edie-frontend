import React from 'react'
import moment from 'moment'
import {findIndex} from 'lodash'
import axios from 'axios'

import { ROOT_URL } from 'actions/config'
import { severities, queryDateFormat, collections, encodeUrlParams } from 'shared/Global'

import FlipView from './FlipView'
import LineChart from './display/LineChart'
import GEditView from './GEditView'

import {showAlert} from 'components/common/Alert'
import {getRanges} from 'components/common/DateRangePicker'

import {buildServiceParams} from 'util/Query'

const sampleData = []

const chartOptions = {
  maintainAspectRatio: false,
  legend: {
    display: false
  },
  elements: {
    line: {
      tension: 0
    }
  },
  scales: {
    xAxes: [{
      display: false
    }],
    yAxes: [{
      display: true,
      ticks: {
        min: 0,
        fontColor: '#9e9e9e',
        callback: function(value, index, values) {
          if (Math.floor(value) === value) return value
        }
      },
      gridLines: {
        display: true,
        drawBorder: false
      }
    }]
  }
}

const connectorChartOptions = {
  maintainAspectRatio: false,
  legend: {
    display: false
  },
  elements: {
    line: {
      tension: 0
    }
  },
  scales: {
    xAxes: [{
      display: true,
      // ticks: {
      //   autoSkip: true,
      //   maxTicksLimit: 4
      // }
    }],
    yAxes: [{
      display: true,
      ticks: {
        min: 0,
        fontColor: '#9e9e9e',
        callback: function(value, index, values) {
          if (Math.floor(value) === value) return value
        }
      },
      gridLines: {
        display: true,
        drawBorder: false
      }
    }]
  }
}

const monitorChartOptions = {
  maintainAspectRatio: false,
  legend: {
    display: false
  },
  elements: {
    line: {
      tension: 0,
      pointRadius: 0
    }
  },
  scales: {
    xAxes: [{
      display: false
    }],
    yAxes: [{
      display: true,
      ticks: {
        min: 0,
        fontColor: '#9e9e9e',
        callback: function(value, index, values) {
          if (Math.floor(value) === value) return value === 0 ? 'Down' : 'Up'
        }
      },
      gridLines: {
        display: true,
        drawBorder: false
      }
    }]
  },
  tooltips: {
    mode: 'label',
    callbacks: {
      label: function(tooltipItem, data) {
        const indice = tooltipItem.index;
        return data.datasets[0].data[indice] === 0 ? 'Down' : 'Up'
      }
    }
  }
}

export default class GLineChart extends React.Component {
  constructor (props) {
    super (props)
    this.state = {
      loading: true,
      searchRecordCounts: [],
      needRefresh: false
    }
    this.renderBackView = this.renderBackView.bind(this)
    this.renderFrontView = this.renderFrontView.bind(this)
  }

  componentWillMount () {
    this.fetchRecordCount(this.props)
  }

  componentWillUpdate (nextProps, nextState) {
    const {gauge, searchList} = nextProps
    const {needRefresh} = nextState
    if (gauge && JSON.stringify(this.props.gauge) !== JSON.stringify(gauge)) {
      this.fetchRecordCount(nextProps)
    } else if (searchList && JSON.stringify(this.props.searchList) !== JSON.stringify(searchList)) {
      this.fetchRecordCount(nextProps)
    } else if (needRefresh && !this.state.needRefresh) {
      this.fetchRecordCount(nextProps)
    }
  }

  getParams () {
    const {gauge, searchList} = this.props
    const {savedSearchId, monitorId, resource, workflowId, workflowIds, userConnectorId} = gauge

    if (resource === 'monitor') {
      return {
        query: `monitorid=${monitorId}`
      }
    } else if (resource === 'incident'){
      return {
        query: '',
        workflow: [workflowId, ...workflowIds].join(','),
        collections: 'incident',
        severity: severities.map(p => p.value).join(','),
        tag: '',
        monitorTypes: ''
      }
    } else if (resource === 'userconnector') {
      return {
        query: `userConnectorId=${userConnectorId}`
      }
    } else {
      const index = findIndex(searchList, {id: savedSearchId})
      if (index < 0) {
        console.log('Saved search not found.')
        return null
      }
      const searchParams = JSON.parse(searchList[index].data)

      return searchParams
    }
  }

  fetchRecordCount (props) {
    const {gauge, searchList, workflows, devices, allDevices} = props
    const {savedSearchId, monitorId, resource, duration, durationUnit,
      splitBy, splitUnit, workflowId, workflowIds, userConnectorId} = gauge

    this.setState({
      loading: true
    })

    let inc = 1
    if (durationUnit === 'month' && splitUnit === 'day') inc = 0
    const dateFrom = moment().add(-duration + inc, `${durationUnit}s`)
      .startOf(durationUnit === 'hour' || duration === 1 ? durationUnit : 'day')
    const dateTo = moment().endOf(durationUnit === 'hour' ? durationUnit : 'day')

    if (resource === 'monitor') {
      axios.get(`${ROOT_URL}/event/search/findByDate`, {
        params: {
          dateFrom: dateFrom.valueOf(),
          dateTo: dateTo.valueOf(),
          monitorId,
          sort: 'timestamp'
        }
      }).then(res => {
        this.setState({
          searchRecordCounts: res.data._embedded.events.map(p => ({
            date: moment(p.timestamp).format('YYYY-MM-DD HH:mm:ss'),
            count: p.eventType === 'AGENT' || (p.lastResult && p.lastResult.status === 'UP') ? 1 : 0
          })),
          loading: false,
          needRefresh: false
        })
      }).catch(() => {
        setTimeout(() => {
          this.setState({needRefresh: true})
        }, 5000)
      })
    } else if (resource === 'incident'){
      const params = {
        q: [
          `(workflowids:${[workflowId || '', ...(workflowIds || [])].filter(p => !!p).join(' OR ')})`,
          `(severity:${severities.map(p => p.value).join(' OR ')})`
        ].join(' AND '),
        splitBy,
        splitUnit,
        from: dateFrom.valueOf(),
        to: dateTo.valueOf(),
        types: 'incident'
      }
      axios.get(`${ROOT_URL}/search/getRecordCount`, {params}).then(res => {
        this.setState({
          searchRecordCounts: res.data,
          loading: false,
          needRefresh: false
        })
      }).catch(() => {
        setTimeout(() => {
          this.setState({needRefresh: true})
        }, 5000)
      })
    } else if (resource === 'userconnector'){
      axios.get(`${ROOT_URL}/event/search/findByUserConnector`, {
        params: {
          dateFrom: dateFrom.valueOf(),
          dateTo: dateTo.valueOf(),
          userConnectorId,
          sort: 'timestamp',
          size: 1000
        }
      }).then(res => {
        this.setState({
          searchRecordCounts: res.data._embedded.events.map(p => ({
            date: moment(p.timestamp).format('MM-DD HH:mm'),
            count: parseFloat(p.lastResultData)
          })),
          loading: false,
          needRefresh: false
        })
      }).catch(() => {
        setTimeout(() => {
          this.setState({needRefresh: true})
        }, 5000)
      })
    } else {
      const index = findIndex(searchList, {id: savedSearchId})
      if (index < 0) {
        console.log('Saved search not found.')
        return
      }
      const searchParams = buildServiceParams(JSON.parse(searchList[index].data), {
        dateRanges: getRanges(),
        collections, severities, workflows,
        allDevices: devices || allDevices,
        queryDateFormat
      })

      const params = {
        q: searchParams.q,
        splitBy,
        splitUnit,
        from: dateFrom.valueOf(),
        to: dateTo.valueOf()
      }
      axios.get(`${ROOT_URL}/search/getRecordCount?${encodeUrlParams(params)}`).then(res => {
        this.setState({
          searchRecordCounts: res.data,
          loading: false,
          needRefresh: false
        })
      }).catch(() => {
        setTimeout(() => {
          this.setState({needRefresh: true})
        }, 5000)
      })
    }
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

  onClickPoint (e, elements) {
    if (!elements.length) return
    const el = elements[0]

    const record = this.state.searchRecordCounts[el._index]
    if (!record) {
      console.log('Record not found')
      return
    }
    const params = this.getParams()
    if (record.dateFrom) params.dateFrom = record.dateFrom
    if (record.dateTo) params.dateTo = record.dateTo

    setTimeout(() => {
      this.props.history.push('/search')
      this.props.loadSearch(params, this.props.history)
    }, 1)
  }
  getTitle () {
    const {gauge} = this.props
    if (gauge.resource !== 'monitor') return null
    const devices = this.props.allDevices || this.props.devices
    const index = findIndex(devices, {id: gauge.deviceId})
    if (index < 0) return gauge.name
    return `[${devices[index].name}] ${gauge.name}`
  }
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  renderFrontView () {
    const {gauge} = this.props
    const {searchRecordCounts} = this.state

    const chartData = {
      labels: (searchRecordCounts || sampleData).map(p => p.date),
      datasets: [{
        data: (searchRecordCounts || sampleData).map(p => p.count),
        borderWidth: 2,
        borderColor: '#0288d1',
        fill: false,
        pointRadius: 0,
        pointHitRadius: 20
      }]
    }

    let options
    if (gauge.resource === 'monitor') {
      options = monitorChartOptions
    } else if (gauge.resource === 'userconnector') {
      options = connectorChartOptions
    } else {
      options = {
        ...chartOptions,
        onClick: this.onClickPoint.bind(this)
      }
    }

    return (
      <div className="flex-1" style={{overflow: 'hidden'}}>
        <LineChart chartData={chartData} chartOptions={options} />
      </div>
    )
  }
  renderBackView (options) {
    return (
      <div>
        <GEditView
          {...this.props}
          onSubmit={this.onSubmit.bind(this, options)}
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
        title={this.getTitle()}

        loading={this.state.loading}
        renderFrontView={this.renderFrontView}
        renderBackView={this.renderBackView}

        onClickDelete={this.onClickDelete.bind(this)}
      />
    )
  }
}
