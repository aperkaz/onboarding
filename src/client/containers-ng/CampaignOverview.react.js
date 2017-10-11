import React from 'react';
import PropTypes from 'prop-types';
import { ContextComponent, ModalDialog } from '../components-ng/common';
import { TemplatePreview } from '../components-ng/TemplateEditor';
import { Campaigns, Contacts } from '../api';
import translations from './i18n';
import extend from 'extend';

class CampaignOverview extends ContextComponent
{
    static propTypes = {
        campaignId : PropTypes.string.isRequired,
        customerId : PropTypes.string.isRequired
    }

    constructor(props)
    {
        super(props);

        this.state = extend(false, { contacts : [ ] }, props);

        this.campaignsApi = new Campaigns();
        this.contactsApi = new Contacts();
        this.launchModal = null;
    }

    componentDidMount()
    {
        this.context.i18n.register('CampaignOverview', translations);
        this.reload();
    }

    componentWillReceiveProps(nextProps, nextContext)
    {
        const nextState = { };

        for(let key in nextProps)
        {
            if(this.props[key] != nextProps[key])
                nextState[key] = nextProps[key];
        }

        return this.updateContactList().then(() => this.setState(nextState))
            .then(() => this.campaignsApi.getCampaign(this.state.campaignId))
            .then(campaign => this.setState({ campaign }));
    }

    reload()
    {
        return Promise.all([
            this.updateContactList(),
            this.campaignsApi.getCampaign(this.state.campaignId).then(campaign => this.setState({ campaign }))
        ])
        .then(() =>
        {
            this.emailTemplatePreview.reload();
            this.landingpageTemplatePreview.reload();
        });
    }

    updateContactList()
    {
        return this.contactsApi.getContacts(this.state.campaignId).then(contacts =>
        {
            this.setState({
                contacts,
                emailSendCount : this.calculateEmailSendCount(contacts)
            });
        })
        .catch(e => this.context.showNotification(e.message, 'error'));
    }

    calculateEmailSendCount(contacts)
    {
        let counter = 0;

        for(let key in contacts)
        {
            const contact = contacts[key];

            if(contact.email && contact.status === 'new')
                counter++;
        }

        return counter;
    }

    launchCampaign()
    {
        return new Promise((resolve, reject) =>
        {
            const { i18n, showNotification, router } = this.context;
            const { campaignId, emailSendCount } = this.state;

            const buttons= {
                'yes' : i18n.getMessage('System.yes'),
                'no' : i18n.getMessage('System.no')
            }

            const title = i18n.getMessage('CampaignOverview.modal.launchCampaign.title');
            let text = null;

            if(emailSendCount)
                text = i18n.getMessage('CampaignOverview.modal.launchCampaign.text.withEmails', { campaignId, emailSendCount });
            else
                text = i18n.getMessage('CampaignOverview.modal.launchCampaign.text.noEmails');

            const onButtonClick = (button) =>
            {
                if(button === 'yes')
                {
                    return this.campaignsApi.startCampaign(this.state.campaignId).then(() =>
                    {
                        showNotification(i18n.getMessage('CampaignOverview.notification.campaignLaunched'), 'success');
                        resolve(true);
                    })
                    .catch(e =>
                    {
                        this.context.showNotification(e.message, 'error');
                        resolve(false);
                    });
                }
                else
                {
                    resolve(false);
                }
            }

            this.launchModal.show(title, text, onButtonClick, buttons);
        });
    }

    render()
    {
        const { i18n } = this.context;
        const { campaignId, customerId, emailSendCount, campaign } = this.state;

        return(
            <div className="overview">
                  {
                      campaign &&
                      <div className="row">
                          <div className="col-xs-12 col-sm-6 col-md-4 template-preview">
                              <h3>{i18n.getMessage('CampaignOverview.title.email')}</h3>
                              <TemplatePreview
                                  ref={node => this.emailTemplatePreview = node}
                                  templateId={parseInt(campaign.emailTemplate)}
                                  customerId={customerId}
                                  allowFullPreview={true}
                                  previewScale={0.5} />
                          </div>
                          <div className="col-xs-12 col-sm-6 col-md-4 template-preview">
                              <h3>{i18n.getMessage('CampaignOverview.title.landingpage')}</h3>
                              <TemplatePreview
                                  ref={node => this.landingpageTemplatePreview = node}
                                  templateId={parseInt(campaign.landingpageTemplate)}
                                  customerId={customerId}
                                  allowFullPreview={true}
                                  previewScale={0.5} />
                          </div>
                          <div className="col-xs-12 col-sm-6 col-md-4">
                              <h3>{i18n.getMessage('CampaignOverview.title.emailCount')}</h3>
                              <div className={emailSendCount ? 'alert alert-info' : 'alert alert-warning'}>
                                  <strong>{emailSendCount}</strong>
                              </div>
                          </div>
                      </div>
                  }

                  <ModalDialog ref={node => this.launchModal = node} />
            </div>
        );
    }
}

export default CampaignOverview;
