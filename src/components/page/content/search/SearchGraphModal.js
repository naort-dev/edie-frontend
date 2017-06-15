import React from 'react'

import {SearchGraphModalView} from 'components/modal'

const sampleData = [{
  'date': '2017-05-16',
  'count': 156971
}, {
  'date': '2017-05-17',
  'count': 90002
}, {
  'date': '2017-05-18',
  'count': 107455
}, {
  'date': '2017-05-19',
  'count': 499531
}, {
  'date': '2017-05-20',
  'count': 495102
}, {
  'date': '2017-05-21',
  'count': 281301
}, {
  'date': '2017-05-22',
  'count': 99063
}]
export default class SearchGraphModal extends React.Component {
  componentWillMount () {
    const {params, fetchSearchRecordCount} = this.props
    fetchSearchRecordCount(params)
  }
  onClickClose () {
    this.props.showSearchGraphModal(false)
  }
  onClickMax () {
    this.props.maximizeSearchGraph(!this.props.graphMaximized)
  }
  render () {
    const {searchRecordCounts, queryChips, params, graphMaximized} = this.props
    const chartData = {
      labels: (searchRecordCounts || sampleData).map(p => p.date),
      datasets: [{
        data: (searchRecordCounts || sampleData).map(p => p.count),
        borderWidth: 1,
        borderColor: '#269C8B',
        fill: false
      }]
    }
    const chartOptions = {
      legend: {
        display: false
      },
      elements: {
        line: {
          tension: 0
        }
      }
    }
    return (
      <SearchGraphModalView
        params={params}
        queryChips={queryChips}
        loading={!searchRecordCounts}
        chartData={chartData}
        chartOptions={chartOptions}
        onHide={this.onClickClose.bind(this)}

        graphMaximized={graphMaximized}
        onMaximize={this.onClickMax.bind(this)}
      />
    )
  }
}
