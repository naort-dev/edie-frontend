import React, { Component } from 'react'
import Signin from 'components/auth/Signin'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { signUser } from 'actions'

@connect(
  state => ({ errorMessage: state.auth.error }),
  dispatch => ({
    signUser: bindActionCreators(signUser, dispatch)
  })
)
export default class SigninContainer extends Component {
  render () {
    return (
      <Signin {...this.props} />
    )
  }
}
