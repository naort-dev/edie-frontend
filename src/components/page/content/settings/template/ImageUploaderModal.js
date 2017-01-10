import React from 'react'
import Modal from 'react-bootstrap-modal'
import { concat } from 'lodash'

export default class ImageUploaderModal extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      open: true,

      icons: [],
      currentIcon: props.selected
    }
  }

  componentWillMount () {
    this.setState({
      icons: [
        { url: '/images/window.png', filename: 'window.png' },
        { url: '/images/linux.png', filename: 'linux.png' },
        { url: '/images/inticon.png', filename: 'inticon.png' },
        { url: '/images/pcs.png', filename: 'pcs.png' },
        { url: '/images/db2.png', filename: 'db2.png' },
        { url: '/images/antivirus.png', filename: 'antivirus.png' },
        { url: '/images/nac.png', filename: 'nac.png' },
        { url: '/images/usb.png', filename: 'usb.png' }
      ]
    })

    this.props.fetchImages()
  }

  onHide () {
    this.onClickClose()
  }

  onClickClose () {
    this.closeModal()
  }

  onClickSave () {
    this.closeModal(this.state.currentIcon)
  }

  closeModal (data) {
    this.props.closeTplImageModal(data)
  }

  onClickItem (item, e) {
    let currentIcon = item
    this.setState({currentIcon})
  }

  onChangeFile (e) {
    let formData = new FormData() // eslint-disable-line no-undef
    let input = e.target

    if (!input.value) return

    let filename = input.value.split(/(\\|\/)/g).pop()
    let file = input.files[0]

    formData.append('file', file, filename)

    this.props.uploadImage(formData)
  }

  render () {
    const {currentIcon} = this.state

    const images = concat(this.state.icons, this.props.customImages.map(p => {
      return {
        url: `/externalpictures?name=${p.filename}`,
        filename: p.filename
      }
    }))

    return (
      <Modal
        show={this.state.open}
        onHide={this.onHide.bind(this)}
        aria-labelledby="ModalHeader"
        className="bootstrap-dialog type-primary"
      >
        <div className="modal-header">
          <h4 className="modal-title bootstrap-dialog-title">
            Change Image
          </h4>
        </div>
        <div className="modal-body bootstrap-dialog-message">

          <div className="dropdown-image">
            {images.map(item => (
              <div key={item.url}
                className={currentIcon.url === item.url ? 'active' : ''}
                onClick={this.onClickItem.bind(this, item)}
              >
                <img src={item.url}/>
              </div>
            ))}
          </div>

          <div className="text-right mb-none">

            <a href="javascript:;" style={{position: 'relative', cursor: 'pointer'}} className="pull-left">
              Upload File
              <input
                ype="file"
                name="file"
                onChange={this.onChangeFile.bind(this)}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  margin: 0,
                  padding: 0,
                  fontSize: '20px',
                  cursor: 'pointer',
                  opacity: 0
                }}
              />
            </a>

            <a href="javascript:;" className="btn btn-default btn-sm"
              onClick={this.onClickClose.bind(this)}>Cancel</a>
            <a href="javascript:;" className="btn btn-primary btn-sm margin-sm-left"
              onClick={this.onClickSave.bind(this)}>OK</a>
          </div>
        </div>
      </Modal>
    )
  }
}
