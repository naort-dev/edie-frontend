import React from 'react'

import { Modal } from 'components/modal/parts'
import AppletCard from 'components/common/AppletCard'
import { extImageBaseUrl, appletColors as colors } from 'shared/Global'

export default class MonitorPickModalView extends React.Component {
  renderTpl (tpl, i) {
    return (
      <AppletCard
        key={tpl.id}
        color={colors[i % colors.length]}
        name={tpl.name}
        desc={tpl.description}
        img={`${extImageBaseUrl}${tpl.image}`}
      />
    )
  }

  render () {
    const {onHide} = this.props
    return (
      <Modal title="Monitors" onRequestClose={onHide} contentStyle={{width: 818, maxWidth: 'initial'}}>
        <ul className="web-applet-cards" style={{marginTop: 40}}>
          {this.props.templates.map(this.renderTpl.bind(this))}
        </ul>
      </Modal>
    )
  }
}
