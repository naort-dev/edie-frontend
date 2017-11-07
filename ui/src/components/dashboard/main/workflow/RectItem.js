import React from 'react'
import {findIndex} from 'lodash'
import axios from 'axios'
import moment from 'moment'

import { ROOT_URL } from 'actions/config'
import {buildServiceParams} from 'util/Query'
import {getRanges} from 'components/common/DateRangePicker'
import { severities, queryDateFormat, collections, encodeUrlParams } from 'shared/Global'

export default class RectItem extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      good: 0,
      bad: 0,
      fetched: false
    }
  }
  componentWillMount () {
    this.fetchResult()
    this.startTimer()
  }

  // componentDidUpdate (prevProps, prevState) {
  //   const {searchList} = prevProps
  //   const {rect, paramName, paramValue} = this.props
  //
  //   if (prevProps.rect.interval !== rect.interval || prevProps.rect.intervalUnit !== rect.intervalUnit) {
  //     this.stopTimer()
  //     this.startTimer()
  //   }
  //   if (JSON.stringify(prevProps.rect) !== JSON.stringify(this.props.rect)) {
  //     this.fetchResult()
  //   } else if (!this.state.fetched && searchList && JSON.stringify(this.props.searchList) !== JSON.stringify(searchList)) {
  //     this.fetchResult()
  //   } else if (prevProps.paramName !== paramName || prevProps.paramValue !== paramValue) {
  //     if (paramName || prevProps.paramName) this.debFetchResult()
  //   }
  // }

  componentWillUnmount () {
    this.stopTimer()
  }

  getSearch (id) {
    const {searchList} = this.props
    if (!searchList) return null
    const index = findIndex(searchList, {id})
    if (index < 0) return null
    return searchList[index]
  }

  getSearchResult (search, cb) {
    if (!search) return true
    const {workflows, devices, allDevices, paramName, paramValue, rect} = this.props

    const data = JSON.parse(search.data)
    const searchParams = buildServiceParams(data, {
      dateRanges: getRanges(),
      collections, severities, workflows,
      allDevices: devices || allDevices,
      queryDateFormat
    })

    const params = {
      ...searchParams,
      page: 0,
      size: 1,
      draw: 1
    }

    params.to = new Date().getTime()
    params.from = moment().subtract(rect.interval, rect.intervalUnit).valueOf()

    if (paramName) {
      params.q = params.q.replace(
        new RegExp(`\\$${paramName}`, 'i'), paramValue)
    }

    return axios.get(`${ROOT_URL}/search/query?${encodeUrlParams(params)}`)
  }

  fetchResult () {
    const {goodId, badId} = this.props.rect

    const goodSearch = goodId ? this.getSearch(goodId) : null
    const badSearch = badId ? this.getSearch(badId) : null

    if (!goodSearch || !badSearch) return

    axios.all([
      this.getSearchResult(badSearch),
      this.getSearchResult(goodSearch)
    ]).then(axios.spread((res1, res2) => {
      const bad = res1.data ? res1.data.page.totalElements : 0
      const good = res2.data ? res2.data.page.totalElements : 0

      this.setState({bad, good}, this.notifyUpdate.bind(this))
    }))

    this.setState({fetched: true})
  }

  ////////////////////////////////////////////////////////////

  startTimer () {
    if (document.location.hostname === 'localhost') return
    this.timer = setInterval(this.fetchResult.bind(this, true), 3000)
  }

  stopTimer () {
    clearInterval(this.timer)
  }

  ////////////////////////////////////////////////////////////

  getColor () {
    const {good, bad} = this.state
    const color = bad ? '#D1282C' : (good ?
      '#3cba54' :
      'gray')
    return color
  }

  notifyUpdate () {
    const {good, bad} = this.state
    const {onUpdateColor, rect} = this.props
    onUpdateColor && onUpdateColor(rect.uid, good, bad)
  }

  render () {
    return null
    // const {rect, onClick, onClickDelete} = this.props
    // const {good, bad} = this.state
    // const color = bad ? '#D1282C' : (good ?
    //   '#3cba54' :
    //   'gray')
    // return (
    //   <AppletCard
    //     color={color}
    //     desc={rect.name}
    //     img="/resources/images/dashboard/workflow.png"
    //     onClick={onClick}
    //     onClickDelete={onClickDelete}
    //   />
    // )
  }
}
