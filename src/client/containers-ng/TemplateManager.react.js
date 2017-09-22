import React, { Component } from 'react';
import ajax from 'superagent-bluebird-promise';
import { Tabs, Tab } from 'react-bootstrap';
import translations from './i18n';
import { TemplateForm, TemplateList } from '../components-ng/TemplateEditor';
import { ContextComponent } from '../components-ng/common';

class TemplateManager extends ContextComponent
{
    constructor(props)
    {
        super(props);

        this.state = {
            activeTab : 1,
            tabMode : 'create'
        }

        this.templateList = null;
        this.templateForm = null;
    }

    hanldeOnCancel = () =>
    {
        this.setState({ activeTab :  1 });
    }

    handleOnCreate = () =>
    {
        this.setState({ tabMode : 'edit' });
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
        this.setState({ activeTab : 2, tabMode : 'edit' });
    }

    handleSelectTab(key)
    {
        if(this.templateForm.formChanged)
        {
            const i18n = this.context.i18n;
            const title = i18n.getMessage('TemplateList.formChanged.modal.title');
            const text = i18n.getMessage('TemplateList.formChanged.modal.message');
            const buttons = ['yes', 'no'];
            const onButtonClick = (button) =>
            {
                if(button === 'yes')
                {
                    this.templateForm.clearForm();
                    this.setState({ activeTab : key, tabMode : 'create' });
                }

                this.context.hideModalDialog();
            }

            this.context.showModalDialog(title, text, buttons, onButtonClick);
        }
        else
        {
            this.templateForm.clearForm();
            this.setState({ activeTab : key, tabMode : 'create' });
        }
    }

    render()
    {
        const { i18n } = this.context;
        i18n.register('TemplateManager', translations);

        const customerId = this.context.userData && this.context.userData.customerid;
        const templateFileDirectory = `/public/c_${customerId}/onboarding/campaigns/eInvoiceSupplierOnboarding/`;

        return(
            customerId ?
                <div>
                    <h1>{i18n.getMessage('TemplateManager.title')}</h1>
                    <Tabs activeKey={this.state.activeTab} onSelect={(key) => this.handleSelectTab(key)} id="templateTabs">
                        <Tab eventKey={1} title={i18n.getMessage('TemplateList.tabs.title.list')}>
                          <div className="row">
                              <div className="col-md-12">
                                  <TemplateList
                                      ref={node => this.templateList = node}
                                      customerId={customerId}
                                      templateFileDirectory={templateFileDirectory}
                                      onCreate={() => this.handleFormOnCreate()}
                                      onEdit={(item) => this.handleFormOnEdit(item)}>
                                  </TemplateList>
                              </div>
                          </div>
                        </Tab>
                        <Tab eventKey={2} title={i18n.getMessage(`TemplateList.tabs.title.${this.state.tabMode}`)}>
                          <div className="row">
                              <div className="col-md-12" style={ { paddingTop : '10px' } }>
                                  <TemplateForm
                                      ref={node => this.templateForm = node}
                                      customerId={customerId}
                                      templateFileDirectory={templateFileDirectory}
                                      onCancel={() => this.hanldeOnCancel()}
                                      onCreate={() => this.handleOnCreate()}
                                      onUpdate={() => this.handleOnUpdate()}>
                                  </TemplateForm>
                              </div>
                          </div>
                        </Tab>
                    </Tabs>
                </div>
            : <div></div>
        );
    }
}

export default TemplateManager;
