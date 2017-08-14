import React, { Component } from 'react';
import ajax from 'superagent-bluebird-promise';
import { Tabs, Tab } from 'react-bootstrap';
import TemplateForm from '../components/TemplateEditor/TemplateForm.react';
import FileManager from '../components/TemplateEditor/FileManager.react';
import TemplateList from '../components/TemplateEditor/TemplateList.react';

class TemplateManager extends Component
{
    static contextTypes = {
        showNotification: React.PropTypes.func.isRequired
    }

    constructor(props)
    {
        super(props);

        this.state = {
            activeTab : 1,
            customerId : 'ncc',
            tenantId : 'c_ncc',
            filesDirectory : '/public/onboarding/eInvoiceSupplierOnboarding/onboardingTemplates/generic'
        }

        this.templateList = null;
    }

    hanldeOnCancel = () =>
    {
        this.setState({ activeTab :  1 });
    }

    handleOnCreate = () =>
    {
        this.templateList.updateList();
    }

    handleOnUpdate = () =>
    {
        this.templateList.updateList();
    }

    render()
    {
        return(
            <div>
                <h1>Manage custom tempates</h1>
                <Tabs defaultActiveKey={this.state.activeTab} id="templateTabs">
                    <Tab eventKey={1} title="List">
                      <div className="row">
                          <div className="col-md-12">
                              <TemplateList
                                  ref={node => this.templateList = node}
                                  customerId={this.state.customerId}>
                              </TemplateList>
                          </div>
                      </div>
                    </Tab>
                    <Tab eventKey={2} title="Edit">
                      <div className="row">
                          <div className="col-md-12" style={ { paddingTop : '10px' } }>
                              <TemplateForm
                                  customerId={this.state.customerId}
                                  filesDirectory={this.state.filesDirectory}
                                  onCancel={() => this.hanldeOnCancel()}
                                  onCreate={() => this.handleOnCreate()}
                                  onUpdate={() => this.handleOnUpdate()}>
                              </TemplateForm>
                          </div>
                      </div>
                    </Tab>
                    <Tab eventKey={3} title="File manager">
                      <div className="row">
                          <div className="col-md-12" style={ { paddingTop : '10px' } }>
                              <FileManager
                                  tenantId={this.state.tenantId}
                                  filesDirectory={this.state.filesDirectory}>
                              </FileManager>
                          </div>
                      </div>
                    </Tab>
                </Tabs>
            </div>
        );
    }
}

export default TemplateManager;
