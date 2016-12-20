import React from 'react'
import {
    ButtonGroup,
    Button,
    DropdownButton,
    MenuItem
} from 'react-bootstrap'
import { connect } from 'react-redux'

import SettingTabs from '../SettingTabs'
import TabPage from 'components/shared/TabPage'
import TabPageBody from 'components/shared/TabPageBody'
import TabPageHeader from 'components/shared/TabPageHeader'

import { fetchDeviceTemplates, fetchMonitorTemplates,
    openDeviceTplModal,
    deleteDeviceTemplate,
    openMonitorTplModal,
    deleteMonitorTemplate
} from 'actions/index'

import DeviceTplModal from './DeviceTplModal'
import MonitorTplModal from './MonitorTplModal'
import ImageUploaderModal from './ImageUploaderModal'

class Templates extends React.Component {
    constructor(props) {
        super(props)
        this.state = {

        }
    }

    componentWillMount() {
        this.props.fetchDeviceTemplates()
        this.props.fetchMonitorTemplates()
    }

    render() {
        const {tabIndex} = this.state
        return (
            <TabPage>
                <TabPageHeader title="Settings">
                </TabPageHeader>

                <TabPageBody tabs={SettingTabs} tab={7}>
                    <div className="row padding-md">
                        <div className="col-md-3">
                            {this.renderDeviceTemplates()}
                        </div>
                        <div className="col-md-3">
                            {this.renderMonitorTemplates()}
                        </div>
                    </div>


                </TabPageBody>
            </TabPage>
        )
    }

    renderDeviceTemplates() {
        return (
            <div>
                <div className="fa-lg">
                    <span>Device Templates</span>
                    <a href="javascript:;" className="fa fa-plus-square margin-md-left"
                       onClick={this.onClickAddDeviceTpl.bind(this)}></a>
                </div>
                <table className="table table-hover dataTable">
                    <tbody>{
                        this.props.deviceTemplates.map(item =>
                            <tr key={item.id}>
                                <td>{item.name}</td>
                                <td className="text-right fa-lg">
                                    <a href="javascript:;" onClick={this.onClickEditDeviceTpl.bind(this, item)}>
                                        <i className="fa fa-edit"></i></a>
                                    <a href="javascript:;" className="margin-sm-left" onClick={this.onClickDeleteDeviceTpl.bind(this, item)}>
                                        <i className="fa fa-trash-o"></i></a>
                                </td>
                            </tr>
                        )
                    }
                    </tbody>
                </table>

                {this.renderDeviceTplModal()}
                {this.renderTplImageModal()}
            </div>
        )
    }

    renderMonitorTemplates() {
        return (
            <div>
                <div className="fa-lg">
                    <span>Monitor Templates</span>
                    <a href="javascript:;" className="fa fa-plus-square margin-md-left"
                       onClick={this.onClickAddMonitorTpl.bind(this)}></a>
                </div>
                <table className="table table-hover dataTable">
                    <tbody>{
                        this.props.monitorTemplates.map(item =>
                            <tr key={item.id}>
                                <td>{item.name}</td>
                                <td className="text-right fa-lg">
                                    <a href="javascript:;" onClick={this.onClickEditMonitorTpl.bind(this, item)}>
                                        <i className="fa fa-edit"></i></a>
                                    <a href="javascript:;" className="margin-sm-left" onClick={this.onClickDeleteMonitorTpl.bind(this, item)}>
                                        <i className="fa fa-trash-o"></i></a>
                                </td>
                            </tr>
                        )
                    }
                    </tbody>
                </table>

                {this.renderMonitorTplModal()}
            </div>
        )
    }

    renderDeviceTplModal() {
        if (!this.props.deviceTplModalVisible) return null
        return (
            <DeviceTplModal />
        )
    }

    renderMonitorTplModal() {
        if (!this.props.monitorTplModalVisible) return null
        return (
            <MonitorTplModal />
        )
    }

    renderTplImageModal() {
        if (!this.props.tplImageModalVisible) return null
        return (
            <ImageUploaderModal />
        )
    }

    /////////////////////////////////////////////////////////////////////////////

    onClickAddDeviceTpl() {
        this.props.openDeviceTplModal()
    }

    onClickEditDeviceTpl(item) {
        this.props.openDeviceTplModal(item)
    }

    onClickDeleteDeviceTpl(item) {
        this.props.deleteDeviceTemplate(item)
    }

    onClickAddMonitorTpl() {
        this.props.openMonitorTplModal()
    }

    onClickEditMonitorTpl(item) {
        this.props.openMonitorTplModal(item)
    }

    onClickDeleteMonitorTpl(item) {
        this.props.deleteMonitorTemplate(item)
    }
}

function mapStateToProps(state) {
    return {
        monitorTemplates: state.settings.monitorTemplates,
        deviceTemplates: state.settings.deviceTemplates,
        deviceTplModalVisible: state.settings.deviceTplModalVisible,
        monitorTplModalVisible: state.settings.monitorTplModalVisible,
        tplImageModalVisible: state.settings.tplImageModalVisible,
    }
}

const actions = {
    fetchDeviceTemplates, fetchMonitorTemplates,
    openDeviceTplModal,
    deleteDeviceTemplate,
    openMonitorTplModal,
    deleteMonitorTemplate
}
export default connect(mapStateToProps, actions)(Templates)