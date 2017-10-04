import React, { Component } from 'react';
import ajax from 'superagent-bluebird-promise';
import { Tabs, Tab } from 'react-bootstrap';
import translations from './i18n';
import { TemplateForm, TemplateList, FileManager } from '../components-ng/TemplateEditor';
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
        this.fileManager = null;
    }

    handleListOnCreate()
    {
        this.templateForm.clearForm();
        this.setState({ activeTab : 2, tabMode : 'create' });
        $('[href="#TemplateManager_Tab1"]').tab('show');
    }

    handleListOnEdit(item)
    {
        return this.templateForm.loadTemplate(item.id).then(() =>
        {
            this.setState({
                activeTab : 2,
                tabMode : 'edit',
                filesDirectory : this.templateForm.getFilesDirectory()
            });
        });
    }

    handleCancelTemplateForm(e)
    {
        e.preventDefault();
        this.setState({ activeTab :  1 });
    }

    handleSaveTemplateForm(e)
    {
        e.preventDefault();

        return this.templateForm.saveForm().then(success =>
        {
            if(success)
            {
                this.templateList.reload();

                if(this.state.tabMode === 'create')
                    this.setState({ tabMode : 'edit', filesDirectory : this.templateForm.getFilesDirectory() });
            }
        })
    }

    handleSelectTab(key)
    {
        if(this.templateForm.formChanged)
        {
            const i18n = this.context.i18n;
            const title = i18n.getMessage('TemplateList.formChanged.modal.title');
            const text = i18n.getMessage('TemplateList.formChanged.modal.message');
            const buttons = { 'yes' : i18n.getMessage('System.yes'), 'no' : i18n.getMessage('System.no') };
            const onButtonClick = (button) =>
            {
                if(button === 'yes')
                {
                    this.templateForm.clearForm();
                    this.setState({ activeTab : key, tabMode : 'create' });
                }

                this.context.hideModalDialog();
            }

            this.context.showModalDialog(title, text, onButtonClick, buttons);
        }
        else
        {
            this.templateForm.clearForm();
            this.setState({ activeTab : key, tabMode : 'create' });
        }
    }

    handleDeleteItems(e)
    {
        e.preventDefault();

        return this.fileManager.deleteSelectedItems();
    }

    handleUploadFile(e)
    {
        e.preventDefault();

        this.fileManager.showUploadFileDialog();
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
                                      onCreate={() => this.handleListOnCreate()}
                                      onEdit={(item) => this.handleListOnEdit(item)}>
                                  </TemplateList>
                              </div>
                          </div>
                        </Tab>
                        <Tab eventKey={2} title={i18n.getMessage(`TemplateList.tabs.title.${this.state.tabMode}`)}>
                          <div className="row">
                              <div className="col-md-12" style={ { paddingTop : '10px' } }>
                                  <ul className="nav nav-tabs template-form">
                                      <li className="active"><a data-toggle="tab" href="#TemplateManager_Tab1">{i18n.getMessage('TemplateManager.title.template')}</a></li>
                                      <li className={this.state.filesDirectory ? '' : 'disabled'}><a data-toggle="tab" href="#TemplateManager_Tab2">{i18n.getMessage('TemplateManager.title.files')}</a></li>
                                  </ul>
                                  <div className="tab-content">
                                        <div id="TemplateManager_Tab1" className="tab-pane fade in active">
                                            <div className="row">
                                                <div className="col-xs-12">
                                                    <TemplateForm
                                                        ref={node => this.templateForm = node}
                                                        customerId={customerId}
                                                        templateFileDirectory={templateFileDirectory} />
                                                </div>
                                                <div className="col-xs-12">
                                                    <div className="form-submit text-right">
                                                        <button type="submit" className="btn btn-default" onClick={e => this.handleCancelTemplateForm(e)}>{i18n.getMessage('System.cancel')}</button>
                                                        {
                                                            (this.state.tabMode === 'edit'
                                                                && <button type="submit" className="btn btn-primary" onClick={e => this.handleSaveTemplateForm(e)}>{i18n.getMessage('System.update')}</button>)
                                                                || <button type="submit" className="btn btn-primary" onClick={e => this.handleSaveTemplateForm(e)}>{i18n.getMessage('System.create')}</button>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div id="TemplateManager_Tab2" className="tab-pane fade">
                                            <div className="row">
                                                <div className="col-xs-12">
                                                    {
                                                        this.state.filesDirectory && this.state.filesDirectory.length &&
                                                            <div className="col-md-12">
                                                                <FileManager
                                                                    ref={node => this.fileManager = node}
                                                                    tenantId={'c_' + customerId}
                                                                    onUpload={() => this.templateForm.reload()}
                                                                    onDelete={() => this.templateForm.reload()}
                                                                    filesDirectory={this.state.filesDirectory} />
                                                            </div>
                                                    }
                                                </div>
                                                <div className="col-xs-12">
                                                    <div className="form-submit text-right">
                                                        <button type="button" className="btn btn-default" onClick={e => this.handleDeleteItems(e)}>{i18n.getMessage('System.delete')}</button>
                                                        <button type="button" className="btn btn-primary" onClick={e => this.handleUploadFile(e)}>{i18n.getMessage('System.upload')}</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                  </div>
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
