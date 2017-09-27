import React from 'react';
import PropTypes from 'prop-types';
import { ContextComponent, ModalDialog } from '../components-ng/common';
import { CampaignEditForm } from '../components-ng/CampaignEditor';
import { CampaignContactList, CampaignContactImporter } from '../components-ng/CampaignContactEditor';
import CampaignTemplateSelection from './CampaignTemplateSelection.react';
import CampaignOverview from './CampaignOverview.react';
import translations from './i18n';
import extend from 'extend';

class Campaign extends ContextComponent
{
    constructor(props)
    {
        super(props);

        this.state = {
            currentPosition : 0
        };

        this.tabs = null;
        this.campaignEditForm = null;
        this.campaignContactList = null;
        this.emailTemplateSelection = null;
        this.landingpageTemplateSelection = null;
        this.campaignOverview = null;
    }

    componentWillMount()
    {
        this.context.getUserData().then(userData => this.setState({ customerId : userData.customerid }));

        this.context.i18n.register('Campaign', translations);

        if(this.context.router.params.campaignId)
            this.setState({ campaignId : this.context.router.params.campaignId });
    }

    componentWillReceiveProps(nextPops, nextContext)
    {
        nextContext.i18n.register('Campaign', translations);

        const oldCampaignId = this.context.router.params.campaignId;
        const newCampaignId = nextContext.router.params.campaignId;

        if(oldCampaignId != newCampaignId)
            this.setState({ campaignId : newCampaignId });
    }

    compareStepPosition(stepPosition)
    {
        const { currentPosition } = this.state;
        return stepPosition < currentPosition ? -1 : (stepPosition > currentPosition ? 1 : 0);
    }

    showTab(key)
    {
        $(this.tabs).find(`[href="#${key}"]`).tab('show');
    }

    getTabClass(stepPosition)
    {
        const position = this.compareStepPosition(stepPosition);

        if(position === 0)
            return 'active';
        else if(position > 0)
            return 'disabled';
        else
            return '';
    }

    getStepClass(stepPosition)
    {
        return this.compareStepPosition(stepPosition) === 0 ? 'tab-pane fade in active' : 'tab-pane fade in';
    }

    handleNextStep(e, currentStep)
    {
        e.preventDefault();
        let nextPosition = currentStep;

        const { i18n, showNotification, router } = this.context;

        if(currentStep === 0)
        {
            this.campaignEditForm.saveCampaign().then(campaignId =>
            {
                if(campaignId)
                {
                    showNotification(i18n.getMessage('Campaign.Step0.notification.success'), 'success');
                    this.setState({ campaignId, currentPosition : currentStep + 1 });
                    this.showTab('contacts');
                }
                else
                {
                    showNotification(i18n.getMessage('Campaign.Step0.notification.failure', { error : '' }), 'error');
                }
            })
            .catch(e =>
            {
                showNotification(i18n.getMessage('Campaign.Step0.notification.failure', { error : e.message }), 'error');
            });
        }
        else if(currentStep === 1)
        {
            this.showTab('emailTemplate');
            this.setState({ currentPosition : currentStep + 1 });
        }
        else if(currentStep === 2)
        {
            this.emailTemplateSelection.saveTemplateSelection()
                .then(() => this.showTab('landingpageTemplate'))
                .then(() => this.setState({ currentPosition : currentStep + 1 }))
        }
        else if(currentStep === 3)
        {
            this.landingpageTemplateSelection.saveTemplateSelection()
                .then(() => this.showTab('overview'))
                .then(() => this.setState({ currentPosition : currentStep + 1 }))
        }
        else if(currentStep === 4)
        {
            this.campaignOverview.launchCampaign().then(success =>
            {
                if(success)
                    setTimeout(() => router.push('/'), 2000);
            });
        }
    }

    handlePrevStep(e, currentStep)
    {
        e.preventDefault();

        switch(currentStep)
        {
            case 1:
                this.showTab('campaign');
                break;
            case 2:
                this.showTab('contacts');
                break;
            case 3:
                this.showTab('emailTemplate');
                break;
            case 4:
                this.showTab('landingpageTemplate');
                break;
        }
    }

    handleCreateTemplate(e, type)
    {
        e.preventDefault();

        if(type === 'email')
            this.emailTemplateSelection.showCreateTemplateModal();
        else if(type === 'landingpage')
            this.landingpageTemplateSelection.showCreateTemplateModal();
    }

    handleTabClick(e, tabPosition)
    {
        switch(tabPosition)
        {
            case 0:
                this.campaignEditForm.reload();
                break;
            case 2:
                this.emailTemplateSelection.reload();
                break;
            case 3:
                this.landingpageTemplateSelection.reload();
                break;
            case 4:
                this.campaignOverview.reload();
                break;
        }
    }

    render()
    {
        const { i18n } = this.context;
        const { campaignId, customerId, currentPosition } = this.state;

        if(!customerId)
            return(<div></div>);

        return(
            <div>
                <div className="wizard">
                    <div className="wizard-inner">
                        <div className="connecting-line"></div>
                        <ul className="nav nav-tabs" role="tablist" ref={node => this.tabs = node}>
                            <li className={this.getTabClass(0)} role="presentation" onClick={e => this.handleTabClick(e, 0)}>
                                <a href={`#campaign`} data-toggle="tab" aria-controls="#campaign" role="tab">
                                    <span className="round-tab">1</span>
                                </a>
                            </li>
                            <li className={this.getTabClass(1)} role="presentation" onClick={e => this.handleTabClick(e, 1)}>
                                <a href={`#contacts`} data-toggle="tab" aria-controls="#contacts" role="tab">
                                    <span className="round-tab">2</span>
                                </a>
                            </li>
                            <li className={this.getTabClass(2)} role="presentation" onClick={e => this.handleTabClick(e, 2)}>
                                <a href={`#emailTemplate`} data-toggle="tab" aria-controls="#emailTemplate" role="tab">
                                    <span className="round-tab">3</span>
                                </a>
                            </li>
                            <li className={this.getTabClass(3)} role="presentation" onClick={e => this.handleTabClick(e, 3)}>
                                <a href={`#landingpageTemplate`} data-toggle="tab" aria-controls="#landingpageTemplate" role="tab">
                                    <span className="round-tab">4</span>
                                </a>
                            </li>
                            <li className={this.getTabClass(4)} role="presentation" onClick={e => this.handleTabClick(e, 4)}>
                                <a href={`#overview`} data-toggle="tab" aria-controls="#overview" role="tab">
                                    <span className="round-tab">5</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="tab-content">
                    <div id="campaign" className={this.getStepClass(0)}>
                        <CampaignEditForm
                            ref={node => this.campaignEditForm = node}
                            campaignId={campaignId}
                            customerId={customerId} />
                        <div className="form-submit text-right">
                            <button className="btn btn-link" onClick={(e) => this.handlePrevStep(e, 0)}>{i18n.getMessage('Campaign.Step0.button.back')}</button>
                            <button className="btn btn-primary" onClick={(e) => this.handleNextStep(e, 0)}>{i18n.getMessage('Campaign.Step0.button.next')}</button>
                        </div>
                    </div>
                    <div id="contacts" className={this.getStepClass(1)}>
                        <div className="tab-content">
                            <ul className="nav nav-tabs" role="tablist">
                                <li className="active" role="presentation" >
                                    <a href={`#contacts_list`} data-toggle="tab" role="tab">
                                        {i18n.getMessage('Campaign.tab.title.contactList')}
                                    </a>
                                </li>
                                <li role="presentation" >
                                    <a href={`#contacts_import`} data-toggle="tab" role="tab">
                                        {i18n.getMessage('Campaign.tab.title.import')}
                                    </a>
                                </li>
                            </ul>

                            <div id="contacts_list" className="tab-pane fade in active">
                                {
                                    campaignId && currentPosition >= 1 &&
                                    <CampaignContactList
                                        ref={node => this.campaignContactList = node}
                                        campaignId={campaignId}
                                        customerId={customerId} />
                                }
                                <div className="form-submit text-right">
                                    <button className="btn btn-link" onClick={(e) => this.handlePrevStep(e, 1)}>{i18n.getMessage('Campaign.Step1.button.back')}</button>
                                    <button className="btn btn-primary" onClick={(e) => this.handleNextStep(e, 1)}>{i18n.getMessage('Campaign.Step1.button.next')}</button>
                                </div>
                            </div>
                            <div id="contacts_import" className="tab-pane fade">
                                {
                                    campaignId && currentPosition >= 1 &&
                                    <CampaignContactImporter
                                        campaignId={campaignId}
                                        customerId={customerId}
                                        onResult={(err, res) => !err && this.campaignContactList.reload()}/>
                                }
                            </div>
                        </div>
                    </div>
                    <div id="emailTemplate" className={this.getStepClass(2)}>
                        {
                            campaignId && currentPosition >= 2 &&
                            <CampaignTemplateSelection
                                ref={node => this.emailTemplateSelection = node}
                                type="email"
                                campaignId={campaignId}
                                customerId={customerId} />
                        }
                        <div className="form-submit text-right">
                            <button className="btn btn-link" onClick={e => this.handlePrevStep(e, 2)}>{i18n.getMessage('Campaign.Step2.button.back')}</button>
                            <button className="btn btn-primary" onClick={e => this.handleCreateTemplate(e, 'email')}>{i18n.getMessage('Campaign.Step2.button.createTemplate')}</button>&nbsp;
                            <button className="btn btn-primary" onClick={e => this.handleNextStep(e, 2)}>{i18n.getMessage('Campaign.Step2.button.next')}</button>
                        </div>
                    </div>
                    <div id="landingpageTemplate" className={this.getStepClass(3)}>
                        {
                            campaignId && currentPosition >= 3 &&
                            <CampaignTemplateSelection
                                ref={node => this.landingpageTemplateSelection = node}
                                type="landingpage"
                                campaignId={campaignId}
                                customerId={customerId} />
                        }
                        <div className="form-submit text-right">
                            <button className="btn btn-link" onClick={e => this.handlePrevStep(e, 3)}>{i18n.getMessage('Campaign.Step3.button.back')}</button>
                            <button className="btn btn-primary" onClick={e => this.handleCreateTemplate(e, 'landingpage')}>{i18n.getMessage('Campaign.Step3.button.createTemplate')}</button>&nbsp;
                            <button className="btn btn-primary" onClick={e => this.handleNextStep(e, 3)}>{i18n.getMessage('Campaign.Step3.button.next')}</button>
                        </div>
                    </div>
                    <div id="overview" className={this.getStepClass(4)}>
                        {
                            campaignId && currentPosition >= 4 &&
                            <CampaignOverview
                                ref={node => this.campaignOverview = node}
                                campaignId={campaignId}
                                customerId={customerId} />
                        }
                        <div className="form-submit text-right">
                            <button className="btn btn-link" onClick={(e) => this.handlePrevStep(e, 4)}>{i18n.getMessage('Campaign.Step4.button.back')}</button>
                            <button className="btn btn-primary" onClick={(e) => this.handleNextStep(e, 4)}>{i18n.getMessage('Campaign.Step4.button.next')}</button>
                        </div>
                    </div>
                </div>
            </div>
        )

    }
}

export default Campaign;
