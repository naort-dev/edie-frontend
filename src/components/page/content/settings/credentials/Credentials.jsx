import React from 'react'
import {
    ButtonGroup,
    Button,
    DropdownButton,
    MenuItem
} from 'react-bootstrap'
import { connect } from 'react-redux'

import { ResponsiveInfiniteTable } from 'components/shared/InfiniteTable.jsx'
import { appendComponent, removeComponent } from 'util/Component.jsx'
import { showAlert, showConfirm } from 'components/shared/Alert.jsx'

import CredentialModal from './CredentialModal.jsx'

import SettingTabs from '../SettingTabs'
import TabPage from 'components/shared/TabPage'
import TabPageBody from 'components/shared/TabPageBody'
import TabPageHeader from 'components/shared/TabPageHeader'

import { fetchCredentials, openCredentialsModal, removeCredentials } from 'actions/index'

class Credentials extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            filter: '',
        }

        this.cells = [{
            "displayName": "Name",
            "columnName": "name",
        }, {
            "displayName": "Description",
            "columnName": "description"
        }, {
            "displayName": "User Name",
            "columnName": "username",
        }]

        // this.listeners = {
        //     [EVENTS.CREDENTIALS_ADD_CLICKED]: this.onAddCred.bind(this),
        //     [EVENTS.CREDENTIALS_EDIT_CLICKED]: this.onEditCred.bind(this),
        //     [EVENTS.CREDENTIALS_REMOVE_CLICKED]: this.onRemoveCred.bind(this),
        //
        //     [EVENTS.CREDENTIALS_KEYWORD_CHANGED]: this.onKeywordChanged.bind(this),
        // }
    }

    componentWillMount() {
        this.props.fetchCredentials()
    }

    render() {
        return (
            <TabPage>
                <TabPageHeader title="Settings">
                    <div className="text-center margin-md-top">
                        <div className="pull-right">
                            <ButtonGroup>

                                <Button onClick={this.onAddCred.bind(this)}>Add</Button>
                                <Button onClick={this.onEditCred.bind(this)}>Edit</Button>
                                <Button onClick={this.onRemoveCred.bind(this)}>Remove</Button>

                            </ButtonGroup>
                        </div>

                        <div className="inline">
                            <input type="text" placeholder="Search" className="form-control"
                                   style={{width: "220px", paddingLeft: "35px"}}
                                   onKeyUp={this.onSearchKeyUp.bind(this)}/>
                            <a className="btn" href="javascript:;"
                               style={{position: "absolute", left: 0, top: 0}}>
                                <i className="fa fa-search"></i>
                            </a>
                        </div>
                    </div>
                </TabPageHeader>

                <TabPageBody tabs={SettingTabs} tab={6}>
                    {this.renderContent()}
                    {this.renderCredentialsModal()}
                </TabPageBody>
            </TabPage>
        )
    }

    renderContent() {
        return (
            <ResponsiveInfiniteTable
                cells={this.cells}
                ref="credentials"
                rowMetadata={{"key": "id"}}
                selectable={true}
                onRowDblClick={this.onEditCred.bind(this)}

                useExternal={false}
                data={this.props.credentials}
            />
        )
    }

    renderContent2() {
        return (
            <InfiniteTable
                url="/devices/getCredentials"
                params={{filter: this.state.filter}}
                cells={this.cells}
                rowMetadata={{"key": "id"}}
                selectable={true}
                bodyHeight={this.props.containerHeight}
                ref="credentials"

                onRowDblClick={this.onEditCred.bind(this)}
            />
        )
    }

    renderCredentialsModal() {
        if (!this.props.credentialsModalVisible) return null
        return (
            <CredentialModal />
        )
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    getTable() {
        return this.refs.credentials.refs.wrappedInstance
    }

    onKeywordChanged(filter) {
        this.setState({ filter })
    }

    onAddCred() {
        this.props.openCredentialsModal()
    }

    onEditCred() {
        let selected = this.getTable().getSelected()
        if (!selected) return showAlert("Please choose credentials.")

        this.props.openCredentialsModal(selected)
    }

    onRemoveCred() {
        let selected = this.getTable().getSelected()
        if (!selected) return showAlert("Please choose credentials.")

        showConfirm("Are you sure? Click OK to remove.", (btn) => {
            if (btn != 'ok') return;


            this.props.removeCredentials(selected)
        })
    }

    onSearchKeyUp(e) {
        clearTimeout(this.searchTimer)
        const value = e.target.value
        this.searchTimer = setTimeout(() => {
            emit(EVENTS.CREDENTIALS_KEYWORD_CHANGED, value)
        }, 200)
    }
}

Credentials.defaultProps = {}

function mapStateToProps(state) {
    return {
        credentials: state.settings.credentials,
        credentialsModalVisible: state.settings.credentialsModalVisible,
    }
}

const actions = {
    fetchCredentials,
    openCredentialsModal,
    removeCredentials
}

export default connect(mapStateToProps, actions)(Credentials)