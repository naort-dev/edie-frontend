import React from 'react'
import {Dialog, Card, CardText, RaisedButton, RadioButton} from 'material-ui'
import {Field} from 'redux-form'
import {RadioButtonGroup} from 'redux-form-material-ui'

import {FormInput, FormCheckbox, FormSelect, CardLegend, CloseIconButton} from 'components/modal/parts'

const dialogStyle = {
  background: '#efefef',
  padding: '8px 48px 48px',
  overflowY: 'auto'
}
const titleStyle = {
  background: '#324454',
  color: 'white',
  fontSize: 14,
  paddingTop: 12,
  paddingBottom: 12
}

const paramLabels = {
  'checkinterval': 'Interval (seconds)',
  'timeout': 'Timeout (seconds)'
}

const durationOptions = [1,2,3,5,10,15,20,25].map(p => ({
  label: `${p}`, value: `${p}`
}))

const durationUnits = 'days months years'.split(' ').map(p => ({
  label: p, value: p
}))

export default class MonitorWizardView extends React.Component {
  render () {
    const {header, onSubmit, onHide, paramEditModal, tagsView, credPicker, paramsView,
      requiredParamKeys,
      credentials,
      showAgentType, collectors, agent,
      isEdit
    } = this.props

    const collectorOptions = collectors.map(p => ({
      label: p.name, value: p.id
    }))

    let agentLabel = 'Agent'
    if (!agent) {
      agentLabel = (
        <div >
          <div className="inline-block" style={{width: 100}}>Agent</div>
          <div className="inline-block" style={{textDecoration: 'underline', color: 'rgba(0, 0, 0, 0.87)'}}>Install Agent</div>
        </div>
      )
    }

    const collectorLabel = (
      <div style={{width: 100}} className="inline-block">Collector</div>
    )

    return (
      <Dialog open title={header} bodyStyle={dialogStyle} titleStyle={titleStyle} onRequestClose={onHide}>
        <CloseIconButton onClick={onHide} color="white"/>
        <form onSubmit={onSubmit}>
          <CardLegend>Configuration</CardLegend>
          <Card>
            <CardText>
              <Field name="name" floatingLabel="Name" component={FormInput} className="margin-sm-left margin-sm-right"/>
              {requiredParamKeys.map(k =>
                <Field key={k} name={k} floatingLabel={paramLabels[k] || k} component={FormInput} className="margin-sm-left margin-sm-right"/>
              )}

              <div>
                <div className="inline-block valign-middle" style={{fontSize: '16px', paddingLeft: 7}}>Add remove events after</div>
                <Field
                  name="remove_after" component={FormSelect} options={durationOptions}
                  style={{width: 80, paddingLeft: 15}} className="valign-middle"/>
                <Field
                  name="remove_after_unit" component={FormSelect} options={durationUnits}
                  style={{width: 120}} className="valign-middle"/>
              </div>

              <div className={showAgentType ? '' : 'hidden'}>
                <Field name="agentType" component={RadioButtonGroup} className="margin-md-top">
                  <RadioButton value="agent" label={agentLabel} className="pull-left" disabled={!agent}/>
                  <RadioButton value="collector" label={collectorLabel} className="pull-left" style={{width: 120, marginTop: 14}}/>
                </Field>
                <Field name="collectorId" label="Collector" component={FormSelect} className="pull-left" options={collectorOptions}/>
              </div>
            </CardText>
          </Card>

          <CardLegend>Credentials</CardLegend>
          <Card>
            <CardText>
              <Field name="credentialId" component={FormSelect} className="margin-sm-left margin-sm-right" options={credentials}/>
            </CardText>
          </Card>

          {paramsView}
          {tagsView}

          <Field name="enabled" component={FormCheckbox} type="checkbox" label="Enabled" className="margin-md-top margin-sm-bottom"/>

          <div className="form-buttons">
            <RaisedButton type="submit" label={isEdit ? 'Save' : 'Add'}/>
          </div>
        </form>
        {paramEditModal}
        {credPicker}
      </Dialog>
    )
  }
}
