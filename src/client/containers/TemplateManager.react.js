import React, { Component } from 'react';
import ajax from 'superagent-bluebird-promise';
import { Tabs, Tab } from 'react-bootstrap';
import TemplateForm from '../components/TemplateEditor/TemplateForm.react';
import FileManager from '../components/TemplateEditor/FileManager.react';
import TemplateList from '../components/TemplateEditor/TemplateList.react';

class TemplateManager extends Component
{
    static contextTypes = {
        showModalDialog: React.PropTypes.func.isRequired,
        hideModalDialog: React.PropTypes.func.isRequired
    }

    constructor(props)
    {
        super(props);

        this.state = {
            activeTab : 1,
            customerId : 'ncc',
            createEditTitle : 'Create'
        }

        this.templateList = null;
        this.templateForm = null;
        this.templateFileDirectory = `/public/c_${this.state.customerId}/onboarding/campaigns/eInvoiceSupplierOnboarding/`;
    }

    hanldeOnCancel = () =>
    {
        this.setState({ activeTab :  1 });
    }

    handleOnCreate = () =>
    {
        this.setState({ createEditTitle : 'Edit' });
        return this.templateList.updateList();
    }

    handleOnUpdate = () =>
    {
        return this.templateList.updateList();
    }

    handleFormOnCreate = () =>
    {
        this.templateForm.clearForm();
        this.setState({ activeTab : 2 });
    }

    handleFormOnEdit = (item) =>
    {
        this.templateForm.clearForm();
        this.templateForm.loadTemplate(item.id);
        this.setState({ activeTab : 2, createEditTitle : 'Edit' });
    }

    handleSelectTab(key)
    {
        if(this.templateForm.formChanged)
        {
            const title = 'Lose changes';
            const text = 'You modified the template currently on edit. If you proceed, all changes will be lost. Do you really want to switch tabs now?';
            const buttons = ['yes', 'no'];
            const onButtonClick = (button) =>
            {
                if(button === 'yes')
                {
                    this.templateForm.clearForm();
                    this.setState({ activeTab : key, createEditTitle : 'Create' });
                }

                this.context.hideModalDialog();
            }

            this.context.showModalDialog(title, text, buttons, onButtonClick);
        }
        else
        {
            this.templateForm.clearForm();
            this.setState({ activeTab : key, createEditTitle : 'Create' });
        }
    }

    render()
    {
        return(
            <div>
                <h1>Manage custom templates</h1>
                <Tabs activeKey={this.state.activeTab} onSelect={(key) => this.handleSelectTab(key)} id="templateTabs">
                    <Tab eventKey={1} title="List">
                      <div className="row">
                          <div className="col-md-12">
                              <TemplateList
                                  ref={node => this.templateList = node}
                                  customerId={this.state.customerId}
                                  templateFileDirectory={this.templateFileDirectory}
                                  onCreate={() => this.handleFormOnCreate()}
                                  onEdit={(item) => this.handleFormOnEdit(item)}>
                              </TemplateList>
                          </div>
                      </div>
                    </Tab>
                    <Tab eventKey={2} title={this.state.createEditTitle}>
                      <div className="row">
                          <div className="col-md-12" style={ { paddingTop : '10px' } }>
                              <TemplateForm
                                  ref={node => this.templateForm = node}
                                  customerId={this.state.customerId}
                                  templateFileDirectory={this.templateFileDirectory}
                                  onCancel={() => this.hanldeOnCancel()}
                                  onCreate={() => this.handleOnCreate()}
                                  onUpdate={() => this.handleOnUpdate()}>
                              </TemplateForm>
                          </div>
                      </div>
                    </Tab>
                </Tabs>
            </div>
        );
    }
}

export default TemplateManager;
