import React, { Component } from 'react'
import moment from 'moment'
import { findIndex } from 'lodash'
import {
  RaisedButton,
  MenuItem,
  Menu,
  Popover,
  SelectField,
  TextField
} from 'material-ui'
import TimeAgo from 'react-timeago'
import ReactTooltip from 'react-tooltip'
import ArrowBack from 'material-ui/svg-icons/navigation/arrow-back'

import DateRangePicker from '../../../../../shared/DateRangePicker2'
import InfiniteTable from '../../../../../shared/InfiniteTable'
import AddIncidentModal from './AddIncidentModal'
import AddExceptionModal from './AddExceptionModal'
import CommentsModal from '../../../../../shared/incident/CommentsModal'

import { showAlert, showConfirm } from '../../../../../shared/Alert'
import { getSeverityIcon } from '../../../../../../shared/Global'
const encodeUrlParams = getSeverityIcon
import MainTabs from '../MainTabs'
import TabPage from '../../../../../shared/TabPage'
import TabPageBody from '../../../../../shared/TabPageBody'
import TabPageHeader from '../../../../../shared/TabPageHeader'
import {
  showIncidentDetail,
  showIncidentRaw
} from '../../../../../shared/incident/Incident'
import { errorStyle, underlineFocusStyle, inputStyle, selectedItemStyle, underlineStyle } from 'style/materialStyles'

export default class MainIncidents extends Component {
  constructor (props) {
    super(props)

    this.state = {

      severities: [
        { label: 'High', value: 'HIGH' },
        { label: 'Medium', value: 'MEDIUM' },
        { label: 'Low', value: 'LOW' },
        { label: 'Audit', value: 'AUDIT' },
        { label: 'Ignore', value: 'IGNORE' }
      ],

      selectedSeverity: ['HIGH', 'MEDIUM'],

      selectedIndex: -1,
      fixed: 'false',
      text: '',
      afterStartTimestamp: moment().startOf('year').valueOf(),
      beforeStartTimestamp: moment().endOf('year').valueOf(),

      currentSortCol: 'startTimestamp',
      currentSortDir: 'desc',

      openExceptionModal: false,
      commentModalVisible: false,
      params: {}
    }

    this.cells = [{
      'displayName': 'Severity',
      'columnName': 'severity',
      'cssClassName': 'text-center width-80',
      'customHeaderComponent': this.renderColHeader.bind(this),
      'customComponent': (props) => {
        return getSeverityIcon(props.data)
      }
    }, {
      'displayName': 'Date/Time',
      'columnName': 'startTimestamp',
      'cssClassName': 'nowrap text-center width-140',
      'customHeaderComponent': this.renderColHeader.bind(this),
      'customComponent': (props) => {
        const {data} = props
        if (!data) return <span/>
        return (
          <span data-tip={moment(new Date(data)).format('YYYY-MM-DD HH:mm:ss')}>
            <TimeAgo date={data}/>
          </span>
        )
      }
    }, {
      'displayName': 'Description',
      'columnName': 'description',
      'customComponent': (props) => {
        let str = props.data
        if (props.rowData.lastcomment) {
          str += `<br/><b>Reason:</b> ${props.rowData.lastcomment}`
        }

        return <span dangerouslySetInnerHTML={{ __html: str }} /> // eslint-disable-line react/no-danger
      }
    }, {
      'displayName': 'Actions',
      'columnName': 'actions',
      'cssClassName': 'nowrap width-200',
      'customComponent': (p) => {
        const row = p.rowData
        setTimeout(() => {
          ReactTooltip.rebuild()
        }, 1)
        return (
          <div>
            <a href="javascript:;" onClick={showIncidentDetail.bind(null, row)}>
              <img style={{height: '30px'}} title="Detail" src="/images/openicon.png" />
            </a>
            &nbsp;

            <a href="javascript:;" onClick={() => { props.ackIncident(row) }}>
              <img style={{height: '30px'}} title="Acknowledge" src={`/images/${row.acknowledged ? 'ack.png' : 'noack.png'}`} />
            </a>
            &nbsp;

            <a href="javascript:;" onClick={() => { props.fixIncident(row) }}>
              <img style={{height: '30px'}} title="Acknowledge" src={`/images/${row.fixed ? 'ok.png' : 'notok.png'}`} />
            </a>
            &nbsp;

            <button className="btn btn-primary btn-xs" onClick={showIncidentRaw.bind(null, row)}>Raw</button>
            &nbsp;

            {
              (row.fixed & !row.whathappened)
                ? <a href="javascript:;" onClick={this.showIncidentComments.bind(this, row)}>
                <img style={{height: '25px'}} title="Reason" src={`/images/${row.lastcomment ? 'reason-icon.png' : 'reason-x.png'}`} />
              </a>
                : null
            }

          </div>
        )
      }
    }]

    // ///////////////////////////////////////

    this.onFilterChange = this.onFilterChange.bind(this)
  }

  componentDidMount () {
    this.onFilterChange()
  }

  renderColHeader (col) {
    const {columnName, displayName} = col
    const { currentSortCol, currentSortDir } = this.state
    let caretEl = null

    if (columnName === currentSortCol) {
      const cls = currentSortDir === 'asc' ? 'fa-caret-up' : 'fa-caret-down'
      caretEl = <i className={`margin-sm-left fa ${cls}`} />
    }

    return (
      <a href="javascript:;" className="text-black" onClick={this.onClickColHeader.bind(this, col)}>
        <span className="nowrap">{displayName}{caretEl}</span>
      </a>
    )
  }

  renderTable () {
    const params = this.getParams()

    return (
      <InfiniteTable
        cells={this.cells}
        ref="table"
        rowMetadata={{'key': 'id'}}
        selectable
        onRowDblClick={this.onRowDblClick.bind(this)}

        url="/incident/search/findBy"
        params={params}
      />
    )
  }

  onClickColHeader (col) {
    const {
      columnName
    } = col
    let { currentSortCol, currentSortDir } = this.state

    if (columnName === currentSortCol) {
      currentSortDir = currentSortDir === 'asc' ? 'desc' : 'asc'
    } else {
      currentSortCol = columnName
      currentSortDir = 'asc'
    }
    this.setState({ currentSortCol, currentSortDir }, this.onFilterChange)
  }

  onClickOpen () {
    const selected = this.getTable().getSelected()
    if (selected) {
      showIncidentDetail(selected)
    } else {
      showAlert('Please select incident.')
    }
  }

  onRowDblClick (sel) {
    showIncidentDetail(sel)
  }

  onClickFixAll () {
    showConfirm('Click OK to fix all device incidents.', btn => {
      if (btn !== 'ok') return
      this.props.fixAllDeviceIncidents(this.props.device)
    })
  }

  onClickAddIncident () {
    this.props.openAddDeviceIncident()
  }

  onClickAddException () {
    const selected = this.getTable().getSelected()
    if (selected) {
      this.setState({
        selectedIndex: findIndex(this.props.incidents, {id: selected.id}),
        openExceptionModal: true
      })
    } else {
      showAlert('Please select incident.')
    }
  }

  onCloseExceptionModal (success) {
    this.setState({
      openExceptionModal: false
    })
  }

  onClickPDF () {
    const params = this.getParams()
    let url = `/pdfIncidents?${
      encodeUrlParams(params)}`
    window.open(url, '_blank')
  }

  onChangeSeverity (e, index, values) {
    console.log(arguments)
    this.setState({
      selectedSeverity: values
    }, this.onFilterChange)
  }

  onFilterChange () {
    this.setState({
      params: this.getParams()
    })
  }

  onFixedChange (e, index, value) {
    this.setState({
      fixed: value
    }, () => {
      this.onFilterChange()
    })
  }

  onChangeText (e, text) {
    this.setState({
      text
    }, () => this.onFilterChange())
  }

  onChangeDateRange ({startDate, endDate}) {
    this.setState({
      afterStartTimestamp: startDate.valueOf(),
      beforeStartTimestamp: endDate.valueOf()
    }, () => {
      this.onFilterChange()
    })
  }

  getParams () {
    const { currentSortCol, currentSortDir, selectedSeverity, fixed, afterStartTimestamp, beforeStartTimestamp, text } = this.state

    let params = {
      description: text || '""',
      severity: selectedSeverity,
      afterStartTimestamp,
      beforeStartTimestamp,
      deviceid: this.props.device.id,
      sort: `${currentSortCol},${currentSortDir}`
    }
    if (fixed) params.fixed = fixed

    return params
  }

  showIncidentComments (incident) {
    this.setState({
      selectedIndex: findIndex(this.props.incidents, {id: incident.id}),
      commentModalVisible: true
    })
  }

  getTable () {
    return this.refs.table
  }

  handleTouchTap (event) {
    this.setState({
      open: true,
      anchorEl: event.currentTarget
    })
  }

  handleRequestClose () {
    this.setState({open: false})
  }

  renderDateLabel (label) {
    return (
      <RaisedButton label={label}/>
    )
  }

  renderHeaderOptions () {
    const {device} = this.props
    if (!device.groupid) return null
    return (
      <div>
        <IconButton><ArrowBack /></IconButton>
      </div>
    )
  }

  render () {
    const {device, incidents} = this.props
    const {selectedIndex, selectedSeverity, severities, afterStartTimestamp, beforeStartTimestamp, text} = this.state

    let selectedIncident = selectedIndex < 0 ? null : incidents[selectedIndex]

    return (
      <TabPage>
        <TabPageHeader title={device.name} headerOptions={this.renderHeaderOptions()}>
          <div className="text-center margin-md-top">
            <div className="pull-left">
              <div className="text-left form-mui-inline">
                <SelectField
                  errorStyle={errorStyle}
                  underlineStyle={underlineFocusStyle}
                  selectedMenuItemStyle={selectedItemStyle}
                  menuItemStyle={inputStyle}
                  labelStyle={inputStyle}
                  multiple
                  hintText="Select severities"
                  onChange={this.onChangeSeverity.bind(this)}
                  value={selectedSeverity}
                >
                  {severities.map(option =>
                    <MenuItem
                      key={option.value}
                      insetChildren
                      checked={selectedSeverity && selectedSeverity.includes(option.value)}
                      value={option.value}
                      primaryText={option.label}
                    />
                  )}
                </SelectField>

                <SelectField
                  onChange={this.onFixedChange.bind(this)}
                  value={this.state.fixed}
                  className="margin-md-left"
                  errorStyle={errorStyle}
                  underlineStyle={underlineFocusStyle}
                  selectedMenuItemStyle={selectedItemStyle}
                  menuItemStyle={inputStyle}
                  labelStyle={inputStyle}>
                  <MenuItem primaryText="Any" value=""/>
                  <MenuItem primaryText="Unfixed" value="false"/>
                  <MenuItem primaryText="Fixed" value="true"/>
                </SelectField>

                <DateRangePicker
                  startDate={moment(afterStartTimestamp)}
                  endDate={moment(beforeStartTimestamp)}
                  onApply={this.onChangeDateRange.bind(this)}
                  renderer={this.renderDateLabel.bind(this)}/>

                <a href="javascript:;" title="Export" style={{display: 'none'}}><img
                  width="26" src="/images/btn-export.jpg"/></a>
              </div>
            </div>

            <div className="pull-right">
              <RaisedButton label="Open" onTouchTap={this.onClickOpen.bind(this)}/>&nbsp;
              <RaisedButton label="Fix All" onTouchTap={this.onClickFixAll.bind(this)}/>&nbsp;
              <RaisedButton label="More" primary onTouchTap={this.handleTouchTap.bind(this)}/>&nbsp;
              <Popover
                open={this.state.open}
                anchorEl={this.state.anchorEl}
                anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                targetOrigin={{horizontal: 'left', vertical: 'top'}}
                onRequestClose={this.handleRequestClose.bind(this)}
              >
                <Menu>
                  <MenuItem primaryText="Add Incident" onTouchTap={this.onClickAddIncident.bind(this)}/>
                  <MenuItem primaryText="Add Exception" onTouchTap={this.onClickAddException.bind(this)}/>
                  <MenuItem primaryText="Export PDF" onTouchTap={this.onClickPDF.bind(this)}/>
                </Menu>
              </Popover>
            </div>

            <div style={{margin: '0 auto', position: 'relative', display: 'inline-block', textAlign: 'center'}}>
              <div className="inline-block" style={{position: 'relative'}}>
                <TextField
                  hintText="Search"
                  errorStyle={errorStyle}
                  inputStyle={inputStyle}
                  underlineFocusStyle={underlineStyle}
                  onChange={this.onChangeText.bind(this)}
                  value={text}
                />
              </div>
            </div>
          </div>
        </TabPageHeader>

        <TabPageBody tabs={MainTabs(device.id)} tab={0}>
          {this.renderTable()}
          {this.props.addIncidentModalVisible &&
          <AddIncidentModal {...this.props} open device={this.props.device}/>}
          {this.state.openExceptionModal &&
          <AddExceptionModal
            open incident={selectedIncident}
            onClose={this.onCloseExceptionModal.bind(this)}/>}

          {this.state.commentModalVisible &&
          <CommentsModal
            incident={selectedIncident}
            onClose={() => {
              this.setState({commentModalVisible: false})
            }}/>}

          <ReactTooltip />
        </TabPageBody>
      </TabPage>
    )
  }
}
