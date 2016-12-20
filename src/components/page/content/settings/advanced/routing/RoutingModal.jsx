import React from 'react'
import Modal from 'react-bootstrap-modal'
import {
    Button,
} from 'react-bootstrap'
import { findIndex } from 'lodash'

import { showAlert } from 'components/shared/Alert.jsx'
import { appendComponent, removeComponent } from 'util/Component.jsx'

import UsersModal from './UsersModal.jsx'
import GroupsModal from './GroupsModal.jsx'

class RoutingModal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            open: true,

            targets: props.routing ? props.routing.targets.slice(0): [],
            selected: null,
        }
    }

    render() {

        const { routing } = this.props

        return (
            <Modal show={this.state.open} onHide={this.onHide.bind(this)}
                   aria-labelledby="ModalHeader" className="bootstrap-dialog type-primary">

                <div className="modal-header">
                    <h4 className="modal-title bootstrap-dialog-title">
                        Routing
                    </h4>
                    <div className="bootstrap-dialog-close-button">
                        <button className="close"
                                onClick={this.onClickClose.bind(this)}>×</button>
                    </div>
                </div>

                <div className="modal-body bootstrap-dialog-message">

                    <div className="row margin-md-bottom">
                        <label className="col-md-3 control-label">Device IP</label>
                        <div className="col-md-9">
                            <select className="form-control" ref="filterType"
                                    defaultValue={routing? routing.filterType: ''}>
                                <option value="ip">Device IP</option>
                                <option value="text">Text</option>
                            </select>
                        </div>
                    </div>
                    <div className="row margin-md-bottom">
                        <label className="col-md-3 control-label">Value</label>
                        <div className="col-md-9">
                            <input type="text" className="form-control" ref="value"
                                   defaultValue={routing? routing.value: ''}/>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-12">
                            <a className="margin-sm-right" onClick={this.onClickAddGroup.bind(this)}>
                                <i className="fa fa-lg fa-users" title="Add Group"></i>
                            </a>
                            <a className="margin-sm-right" onClick={this.onClickAddUser.bind(this)}>
                                <i className="fa fa-lg fa-user" title="Add User"></i>
                            </a>

                            <a className="margin-sm-right" onClick={this.onClickRemove.bind(this)}>
                                <i className="fa fa-lg fa-trash-o" title="Remove"></i>
                            </a>
                        </div>
                    </div>

                    <div className="margin-md-bottom" style={{height: "250px"}}>
                        <table className="table table-hover" ref="targets">
                            <thead>
                            <tr>
                                <th>Groups and Users</th>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                this.state.targets.map((item, i) =>
                                    <tr key={i} onClick={() => {this.setState({selected: item})}}
                                        className={this.state.selected == item ? "selected" : ""}>
                                        <td>{item.targetName}</td>
                                    </tr>
                                )
                            }
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="text-right">
                        <Button className="btn-primary btn-sm"
                                onClick={this.onClickSave.bind(this)}>Save</Button>
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
        this.setState({ open: false }, () => {
            this.props.onClose &&
            this.props.onClose(this, data)
        })
    }

    onClickClose() {
        this.closeModal()
    }

    onClickSave() {
        let params = {
            filterType: this.refs.filterType.value,
            value: this.refs.value.value,
        };

        if (!params.filterType || !params.value) {
            return showAlert("Please input filter type and value.")
        }

        const { targets } = this.state
        const { routing } = this.props

        //////////////////////////////////////////////////////

        let addlist = []
        let modifylist = []
        let removelist = []

        targets.forEach(item => {
            const client = {
                targetId: item.targetId,
                targetType: item.targetType,
            }

            const found = routing && findIndex(routing.targets, client) >= 0

            if (!found) addlist.push(client);
        })


        if (routing) {
            params.id = routing.id

            routing.targets.forEach(client => {
                const found = findIndex(targets, client) >= 0
                if (found) return

                removelist.push({
                    id: client.id
                })
            })
        }

        //////////////////////////////////////////////////////

        this.callSaveRoutingAPI(params, (obj) => {
            var calls = [];

            //Call Services
            addlist.forEach(item => {
                item.routingId = obj.id

                calls.push($.get(Api.routing.addTarget, item).done(res => {
                    if (!res.success) {
                        console.log("Add routing target failed!")
                        return false
                    }
                }).fail(res => {
                    console.log(res.statusText);
                }))
            })

            removelist.forEach(item => {
                calls.push($.get(Api.routing.removeTarget, item).done((res) => {
                    if (!res.success) {
                        console.log("Remove routing target failed!")
                        return false
                    }
                }).fail(function(res){
                    console.log(res.statusText);
                }))
            })


            $.when(...calls).done(() => {
                this.closeModal(obj)
            }).fail(() => {
                showAlert("Save failed!")
            })
        })
    }

    callSaveRoutingAPI(params, callback) {
        const url = this.props.routing ?
            (Api.routing.modifyRouting) :
            (Api.routing.addRouting);

        return $.get(url, params).done(function(res){
            if (!res.success) return showAlert("Save failed!")

            callback && callback(res.object);
        }).fail((res) => {

            showAlert(res.statusText);
        })
    }

    ///////////////////////////////////////

    onClickAddGroup() {
        appendComponent(
            <GroupsModal onClose={(modal, group) => {
                removeComponent(modal)
                if (!group) return

                let { targets } = this.state

                targets.push({
					targetType: 'group',
					targetName: group.name,
					targetId: group.id,
				});

				this.setState({ targets })

            }}/>
        )
    }

    onClickAddUser() {
        appendComponent(
            <UsersModal onClose={(modal, user) => {
                removeComponent(modal)
                if (!user) return

                let { targets } = this.state
                targets.push({
					targetType: 'user',
					targetName: user.username,
					targetId: user.id,
				});

				this.setState({ targets })

            }}/>
        )
    }

    onClickRemove() {
        let {selected, targets} = this.state
        if (!selected) return showAlert("Please select target.")


        const index = targets.indexOf(selected)
        if (index < 0) return showAlert("Please select target.")

        targets.splice(index, 1)

        this.setState({
            selected: null,
            targets: targets
        })
    }
}

RoutingModal.defaultProps = {
    onClose: null,
    routing: null,
}

export default RoutingModal