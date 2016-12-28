import {
  API_ERROR,
  UPDATE_DEVICE_ERROR,
  AUTH_ERROR
} from './types'

export const apiError = (dispatch, error) => {
  dispatch({
    type: API_ERROR,
    msg: error
  })
}

export const updateDeviceError = () => {

}

export const authError = (dispatch) => {
  dispatch({
    type: AUTH_ERROR,
    msg: 'Wrong credentials.'
  })
}
