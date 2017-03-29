import React, { Component } from 'react'
import { assign } from 'lodash'
import { reduxForm } from 'redux-form'

import TextInput from './input/TextInput'
import Checkbox from './input/Checkbox'
import Combo from './input/Combo'
import RadioCombo from './input/RadioCombo'
import PortList from './input/PortList'
import Password from './input/Password'
import MonitorTable from './input/MonitorTable'
import AdvancedForm from './input/AdvancedForm'
import MatchIgnore from './input/MatchIgnore'
import GlobalIgnore from './input/GlobalIgnore'
import MTable from './input/MTable'
import ParamEditModal from './input/ParamEditModal'
import ParamList from './input/ParamList'
import {wizardConfig} from './WizardConfig'
import {util} from './WizardUtil'
// import { Provider } from 'react-redux'
// import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
// import { store } from 'shared/GetStore'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import LinearProgress from 'material-ui/LinearProgress'
import { DeviceWizardView } from 'components/modal'
import { primeColor } from 'style/materialStyles'

class DeviceWizard extends Component {
  static childContextTypes = {
    muiTheme: React.PropTypes.object
  }

  constructor (props) {
    super(props)

    let config = wizardConfig[this.props.deviceType]
    console.log(`Device type: ${this.props.deviceType}`)
    console.log(props)

    this.state = {
      current: 1,
      steps: config.steps.length,
      currentDevice: config,
      monitors: props.monitors || []
    }

    this.mapping = {
      'text': this.buildText.bind(this),
      'check': this.buildCheck.bind(this),
      'monitors': this.buildMonitors.bind(this),
      'portlist': this.buildPortList.bind(this),
      'paramlist': this.buildParamList.bind(this),
      'row': this.buildRow.bind(this)
    }
  }

  getChildContext () {
    return {
      muiTheme: getMuiTheme()
    }
  }

  componentWillMount () {
    const hasMonitors = this.state.currentDevice.steps.filter(s =>
        s.items.filter(i => i.type === 'monitors').length > 0
    ).length > 0

    if (hasMonitors) {
      this.props.fetchMonitorTemplates()
    }
  }

  handleFormSubmit (formProps) {
    const { extraParams, onFinish, editParams } = this.props
    const { monitors, currentDevice } = this.state
    let params = {}
    if (editParams) {
      editParams.forEach(p => {
        params[p.key] = p.value
      })
    }

    let props = assign(
      {},
      formProps,
      currentDevice.server.params || {},
      extraParams, {
        monitors: monitors.map(m => assign({}, m, {id: null})),
        params
      }
    )
    console.log(props)
    this.closeModal(true)
    onFinish && onFinish(null, props, currentDevice.server.url)
  }

  buildProgressBar () {
    if (this.state.steps <= 1) return null

    let markers = []
    for (let i = 1; i <= this.state.steps; i++) {
      markers.push(
        <div className={`marker ${i <= this.state.current ? 'marker-checked' : ''}`}
          style={{left: `${100 / this.state.steps * (i - 0.5)}%`}}
          key={i}>
            <div className="marker-label">{i}</div>
        </div>
      )
    }
    let value = 100 * this.state.current / this.state.steps
    // <div className="progress-bar" style={{width: `${100 * this.state.current / this.state.steps}%`}} />

    return (
      <div className="wizard-progress">
        {markers}
        <div className="progress progress-striped progress-xs" style={{margin: '10px 0'}}>
          <LinearProgress mode="determinate" value={value} color={primeColor}/>
        </div>
      </div>
    )
  }

  buildContent () {
    let tabs = []

    for (let i = 0; i < this.state.steps; i++) {
      let tab = this.buildStep(i)
      tabs.push(tab)
    }

    return (
      <div className="tab-content">
          {tabs}
      </div>
    )
  }

  buildStep (index) {
    const currentDevice = this.state.currentDevice
    const stepConfig = currentDevice.steps[index]

    let items = []

    stepConfig.items.forEach(itemConfig => {
      let inputs = this.buildInput(itemConfig, this.props.values)
      if (!inputs) return true

      items = items.concat(inputs)
    })

    return (
      <div key={index} className={`${(index === (this.state.current - 1)) ? ' active' : 'hidden'}`}>
          {items}
      </div>
    )
  }

  buildInput (config, values) {
    let items = []

    if (this.props.hideNames && config.name) {
      let found = this.props.hideNames.indexOf(config.name) >= 0
      if (found) return items
    }

    config.type = config.type || ''
    let func = this.mapping[config.type.toLowerCase()]

    if (typeof func !== 'undefined') {
      items = func(config, values || {})
    } else {

    }

    return items
  }

  buildText (config, values) {
    return (<TextInput key={config.name}
      config={config}
      values={values}
      buildLabel={this.buildLabel.bind(this)}/>)
  }

  buildCombo (config, values) {
    return (<Combo config={config}
      values={values}
      buildLabel={this.buildLabel.bind(this)}/>)
  }

  buildRadioGroup (config, values) {
    return null
  }

  buildRadioCombo (config, values) {
    return (<RadioCombo config={config}
      values={values}
      buildLabel={this.buildLabel.bind(this)}
      buildInput={this.buildInput.bind(this)}/>)
  }

  buildCheck (config, values) {
    return (<Checkbox key={config.name}
      config={config}
      values={values}
      buildLabel={this.buildLabel.bind(this)}/>)
  }

  buildPortList (config, values) {
    return (<PortList config={config}
      change={this.props.change}
      values={values}
      name="portList"
      buildInput={this.buildInput.bind(this)}/>)
  }

  buildPassword (config, values) {
    let text = []
    let width = util.calcWidth(config.width) // eslint-disable-line no-unused-vars

    if (config.label !== null) {
      if (config.label.type === 'place') {

      } else {
        text.push(this.buildLabel(config.label))
        width = util.calcWidth(config.width) - util.calcWidth(config.label.width)
      }
    }

    text.push(
      <div className={`col-md-${util.calcWidth(config.width)}`} style={util.convertStyle(config.style)}>
          <Password config={config} values={values}/>
      </div>
    )
    return text
  }

  // className={`col-md-${util.calcWidth(config.width)}`}

  buildLabel (config) {
    return (
      <div style={util.convertStyle(config.style)}>
          <label className={`control-label ${config.cls || ''}`}
            dangerouslySetInnerHTML={{__html: config.html || config.text || ''}} // eslint-disable-line react/no-danger
          />
      </div>
    )
  }

  buildAdvanced (config, values) {
    return (<AdvancedForm config={config}
      values={values}
      name="advanced"
      buildInput={this.buildInput.bind(this)}
      buildLabel={this.buildLabel.bind(this)}/>)
  }

  buildForm (config, values) {
    return null
  }

  buildMatchIgnore (config, values) {
    return (<MatchIgnore name="matchIgnore"
      values={values}
      config={config}/>)
  }

  buildGlobalIgnore (config, values) {
    return (<GlobalIgnore name="globalIgnore"
      values={values}
      config={config}/>)
  }

  buildMonitors (config, values) {
    return (<MonitorTable key="monitors"
      name="monitorList"
      monitors={this.state.monitors}
      templates={this.props.monitorTemplates}
      onChanged={monitors => { this.setState({ monitors }) }}
      values={values}
      config={config}
      openDeviceMonitorWizard={this.props.openDeviceMonitorWizard}
    />)
  }

  buildMTable (config, values) {
    return (<MTable name="mTable"
      values={values}
      config={config}/>)
  }

  buildParamList (config, values) {
    return (
      <ParamList
        key="paramList"
        config={config}
        values={values}
        editParams={this.props.editParams}
        openParamEditModal={this.props.openParamEditModal}
        closeParamsModal={this.props.closeParamsModal}
        removeParam={this.props.removeParam}
        updateMonitorParams={this.props.updateMonitorParams}
      />
    )
  }

  buildRow (config, values) {
    let children = []
    let items = config.items || []
    items.forEach(item => {
      let inputs = this.buildInput(item, values)
      children = children.concat(inputs)
    })

    return (
      <div className="row margin-md-bottom">
        {children}
      </div>
    )
  }

  closeModal (data) {
    this.props.onClose && this.props.onClose(this, data)
  }

  onClickPrevious () {
    let current = this.state.current

    if (current > 1) {
      current--
      this.setState({current})
    } else {
      this.closeModal()
      this.props.onStep0 && this.props.onStep0()
    }
  }

  onClickNext () {
    let current = this.state.current

    current++
    this.setState({ current })
  }

  renderParamEditModal () {
    if (!this.props.paramEditModalOpen) return null
    return (
      <ParamEditModal/>
    )
  }

  render () {
    const { handleSubmit } = this.props
    const { current, steps } = this.state
    /* let cssPrevious = ''
    if (current < 2) cssPrevious = onStep0 ? '' : 'hidden' */
    let header = this.props.title || this.state.currentDevice.title || ''
    let progressBar = this.buildProgressBar()
    let content = this.buildContent()
    let paramEditModal = this.renderParamEditModal()
    return (
        <DeviceWizardView
          header={header}
          content={content}
          progressBar={progressBar}
          current={current}
          steps={steps}
          paramEditModal={paramEditModal}
          onHide={this.closeModal.bind(this)}
          onPrev={this.onClickPrevious.bind(this)}
          onNext={this.onClickNext.bind(this)}
          onSubmit={handleSubmit(this.handleFormSubmit.bind(this))}
        />
    )
  }
}

DeviceWizard.defaultProps = {
  title: '',
  deviceType: '',
  extraParams: {},
  configParams: {},
  hideNames: [],
  monitors: [],
  values: {},
  onStep0: null,
  onFinish: null
}

export const MonitorWizard = reduxForm({
  form: 'monitorWizardForm'
})(DeviceWizard)

export default reduxForm({
  form: 'deviceForm'
})(DeviceWizard)
