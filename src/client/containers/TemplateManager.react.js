import React, { Component } from 'react';
import ajax from 'superagent-bluebird-promise';
import translations from './i18n';
import { TemplateForm, TemplateList, FileManager } from '../components/TemplateEditor';
import { ContextComponent } from '../components/common';

class TemplateManager extends ContextComponent
{
    constructor(props, context)
    {
        super(props);

        context.i18n.register('TemplateManager', translations);

        this.state = {
            tabMode : 'create'
        }

        this.templateList = null;
        this.templateForm = null;
        this.fileManager = null;
    }

    setActiveMainTab(tabNo)
    {
        $(`[href="#TemplateManager_MainTab${tabNo}"]`).tab('show');
    }

    handleListOnCreate()
    {
        this.templateForm.clearForm();
        this.setState({ tabMode : 'create' });
        this.setActiveMainTab(2);
    }

    handleListOnEdit(item)
    {
        this.setActiveMainTab(2);

        return this.templateForm.loadTemplate(item.id).then(() =>
        {
            this.setState({
                tabMode : 'edit',
                filesDirectory : this.templateForm.getFilesDirectory()
            });
        });
    }

    handleCancelTemplateForm(e)
    {
        e.preventDefault();
        this.setActiveMainTab(1);
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

    handleSelectMainTab(key)
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
                    this.setState({ tabMode : 'create' });
                    this.setActiveMainTab(key);
                }

                this.context.hideModalDialog();
            }

            this.context.showModalDialog(title, text, onButtonClick, buttons);
        }
        else
        {
            this.templateForm.clearForm();
            this.setState({ tabMode : 'create' });
            this.setActiveMainTab(key);
            console.log(this.state.tabMode);
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

        const customerId = this.context.userData && this.context.userData.customerid;
        const templateFileDirectory = `/public/c_${customerId}/onboarding/campaigns/eInvoiceSupplierOnboarding/`;

        return(
            customerId ?
                <div className="template-manager">
                    <h1>{i18n.getMessage('TemplateManager.title')}</h1>
                    <ul className="nav nav-tabs template-form">
                        <li className="active"><a data-toggle="tab" href="#TemplateManager_MainTab1" onClick={() => this.handleSelectMainTab(1)}>{i18n.getMessage('TemplateList.tabs.title.list')}</a></li>
                        <li><a data-toggle="tab" href="#TemplateManager_MainTab2">{i18n.getMessage(`TemplateList.tabs.title.${this.state.tabMode}`)}</a></li>
                    </ul>

                    <div className="tab-content">
                        <div id="TemplateManager_MainTab1" className="tab-pane fade in active">
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
                        </div>
                        <div id="TemplateManager_MainTab2" className="tab-pane fade in">
                            <div className="row">
                                <div className="col-md-12" style={{ paddingTop : '10px' }}>
                                    <ul className="nav nav-tabs template-form">
                                        <li className="active"><a data-toggle="tab" href="#TemplateManager_InnerTab1">{i18n.getMessage('TemplateManager.title.template')}</a></li>
                                        <li className={this.state.filesDirectory ? '' : 'disabled'}><a data-toggle="tab" href="#TemplateManager_InnerTab2">{i18n.getMessage('TemplateManager.title.files')}</a></li>
                                    </ul>
                                    <div className="tab-content" style={{ marginTop : '25px' }}>
                                          <div id="TemplateManager_InnerTab1" className="tab-pane fade in active">
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
                                          <div id="TemplateManager_InnerTab2" className="tab-pane fade">
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
                        </div>
                    </div>
                </div>
            : <div></div>
        );
    }
}

export default TemplateManager;
