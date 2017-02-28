import React from 'react'
import Modal from 'react-bootstrap-modal'
import {showAlert} from 'components/shared/Alert'

class ActivationModal extends React.Component {
  componentWillUpdate (nextProps, nextState) {
    const {activationMsg} = this.props
    if (nextProps.activationMsg && activationMsg !== nextProps.activationMsg) {
      showAlert(nextProps.activationMsg)
    }
  }

  onClickSignup () {
    const params = {
      email: this.refs.email.value,
      license: this.refs.license.value
    }

    if (!params.email) return window.alert('Email can\'t be blank.')
    if (!params.license) return window.alert('License can\'t be blank.')
    this.props.activateUser(params)
  }

  onHide () {

  }

  onClickClose () {

  }

  render () {
    return (
      <Modal
        show
        onHide={this.onHide.bind(this)}
        className="bootstrap-dialog type-primary modal-w-wrap">
        <div>
          <div className="text-center padding-sm">
            <h3 className="text-center">License Activation</h3>
          </div>
          <div style={{background: '#d9d9dc', minWidth: '300px'}} className="padding-md">
            <div>
              <input type="text" className="form-control" autoComplete="off" placeholder="Email" ref="email"/>
            </div>

            <div>
              <input type="text" className="form-control" autoComplete="off" placeholder="License" ref="license"/>
            </div>

            <div className="text-center margin-md-top">
              <a href="javascript:;" className="btn signup-btn" onClick={this.onClickSignup.bind(this)}
                style={{background: '#52B6CF', borderRadius: '20px', color: 'white', minWidth: '180px', fontSize: '1.2em'}}>
                Activate
              </a>
            </div>
          </div>
        </div>
      </Modal>
    )
  }
}

export default ActivationModal
