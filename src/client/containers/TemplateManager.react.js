import React, { Component } from 'react';
import ajax from 'superagent-bluebird-promise';
import { Tabs, Tab } from 'react-bootstrap';
import TemplateForm from '../components/TemplateEditor/TemplateForm.react';
import FileManager from '../components/TemplateEditor/FileManager.react';

class TemplateManager extends Component
{
    static contextTypes = {
        showNotification: React.PropTypes.func.isRequired
    }

    constructor(props)
    {
        super(props);

        this.state = {
            activeTab : 2,
            template : {
                path : `/public/onboarding/${this.props.campaignType}/${this.props.templateType}`
            }
        }
    }

    hanldeOnCancel = () =>
    {}

    handleOnCreate = () =>
    {}

    handleOnUpdate = () =>
    {}

    render()
    {
        return(
            <div>
                <h1>Manage custom tempates</h1>
                <Tabs defaultActiveKey={this.state.activeTab} id="templateTabs">
                  <Tab eventKey={1} title="List">
                      <div className="row">
                          <div className="col-md-12">
                          </div>
                      </div>
                  </Tab>
                  <Tab eventKey={2} title="Edit">
                      <div className="row">
                          <div className="col-md-12" style={ { paddingTop : '15px' } }>
                              <TemplateForm
                                  tenantId="c_ncc"
                                  template={this.state.template}
                                  onCancel={this.hanldeOnCancel}
                                  onCreat={this.handleOnCreate}
                                  onUpdate={this.handleOnUpdate}>
                              </TemplateForm>
                          </div>
                          <div className="col-md-4" style={ { paddingTop : '10px' } }>
                          </div>
                      </div>
                  </Tab>
                  <Tab eventKey={3} title="File manager">
                      <div className="row">
                          <div className="col-md-12" style={ { paddingTop : '15px' } }>
                              <FileManager
                                  tenantId="c_ncc"
                                  filesDirectory='/public' />
                          </div>
                      </div>
                  </Tab>
                </Tabs>
            </div>
        );
    }
}

export default TemplateManager;
