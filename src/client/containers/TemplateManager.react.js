import React, { Component } from 'react';
import ajax from 'superagent-bluebird-promise';
import { Tabs, Tab } from 'react-bootstrap';
import TemplateForm from '../components/TemplateEditor/TemplateForm.react';

class TemplateManager extends Component
{
    static contextTypes = {
        showNotification: React.PropTypes.func.isRequired
    }

    constructor(props)
    {
        super(props);

        this.state = {
            activeTab : 2
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
                          <div className="col-md-8" style={ { paddingTop : '10px' } }>
                              <TemplateForm
                                  tenantId="c"
                                  onCancel={this.hanldeOnCancel}
                                  onCreat={this.handleOnCreate}
                                  onUpdate={this.handleOnUpdate}>
                              </TemplateForm>
                          </div>
                          <div className="col-md-4" style={ { paddingTop : '10px' } }>
                          </div>
                      </div>
                  </Tab>
                </Tabs>
            </div>
        );
    }
}

export default TemplateManager;
