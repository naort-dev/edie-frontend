import React from 'react'
import {Dialog} from 'material-ui'
import { Field } from 'redux-form'
import { SubmitBlock, FormInput, FormSelect } from 'components/modal/parts'

import {collectorOSTypes} from 'shared/Global'

export default class CollectorModalView extends React.Component {
  render () {
    const {onHide, onSubmit} = this.props
    return (
      <Dialog open title="Collector" onRequestClose={onHide} contentStyle={{width: 350}}>
        <form onSubmit={onSubmit}>
          <div className="form-column">
            <Field name="name" component={FormInput} label="Name"/>
            <Field name="version" component={FormInput} label="Version"/>
            <Field name="ostype" component={FormSelect} label="Type" options={collectorOSTypes}/>
          </div>
          <SubmitBlock name="Save" onClick={onHide}/>
        </form>
      </Dialog>
    )
  }
}
