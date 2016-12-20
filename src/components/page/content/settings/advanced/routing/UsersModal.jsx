import React from 'react'
import Modal from 'react-bootstrap-modal'
import {
    Button,
} from 'react-bootstrap'

import InfiniteTable from 'components/shared/InfiniteTable.jsx'
import { showAlert } from 'components/shared/Alert.jsx'


class UsersModal extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            open: true,
        }

        this.cells=[{
            "displayName": "Name",
            "columnName": "username",
        }, {
            "displayName": "Email",
            "columnName": "email"
        }]
    }

    render() {
        return (
            <Modal show={this.state.open} onHide={this.onHide.bind(this)}
                   aria-labelledby="ModalHeader" className="bootstrap-dialog type-primary">

                <div className="modal-header">
                    <h4 className="modal-title bootstrap-dialog-title">
                        Users
                    </h4>
                    <div className="bootstrap-dialog-close-button">
                        <button className="close"
                                onClick={this.onClickClose.bind(this)}>×</button>
                    </div>
                </div>

                <div className="modal-body bootstrap-dialog-message">

                    <InfiniteTable
                        url="/user/getUsers?gid="
                        params={{}}
                        cells={this.cells}
                        rowMetadata={{"key": "id"}}
                        selectable={true}
                        bodyHeight={400}
                        ref="users"
                    />

                    <div className="text-right">
                        <Button className="btn-primary btn-sm"
                                onClick={this.onClickSave.bind(this)}>OK</Button>
                        <Button className="btn-sm margin-sm-left"
                                onClick={this.onClickClose.bind(this)}>Cancel</Button>
                    </div>
                </div>
            </Modal>
        )
    }

    onHide() {
        this.onClickClose()
    }

    closeModal(data) {
        this.setState({ open: false}, () => {
            this.props.onClose &&
            this.props.onClose(this, data)
        })
    }

    onClickClose() {
        this.closeModal()
    }

    onClickSave() {
        let selected = this.refs.users.getSelected()
        if (!selected) return showAlert("Please select user.")

        this.closeModal(selected)
    }


}

UsersModal.defaultProps = {
    onClose: null,
}

export default UsersModal