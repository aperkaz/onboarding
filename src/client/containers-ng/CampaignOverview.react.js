import React from 'react';
import PropTypes from 'prop-types';
import { ContextComponent, ModalDialog } from '../components-ng/common';
import { TemplatePreview } from '../components-ng/TemplateEditor';
import { Campaigns, Contacts } from '../api';
import extend from 'extend';

class CampaignProcess extends ContextComponent
{
    static propTypes = {
        campaignId : PropTypes.string.isRequired,
        customerId : PropTypes.string.isRequired,
        prevViewLink : PropTypes.string.isRequired,
        nextViewLink : PropTypes.string.isRequired
    }

    constructor(props)
    {
        super(props);

        this.state = extend(false, { contacts : [ ] }, this.props);

        this.campaignsApi = new Campaigns();
        this.contactsApi = new Contacts();
    }

    componentDidMount()
    {
        return this.updateContactList();
    }

    componentWillReceiveProps(nextProps, nextContext)
    {
        const nextState = { };
        let updateState = false;

        for(let key in nextPops)
        {
            if(this.props[key] != nextPops[key])
            {
                nextState[key] = nextPops[key];
                updateState = true;
            }
        }

        if(updateState)
            return this.updateContactList().then(() => this.setState(nextState));
    }

    updateContactList()
    {
        return this.contactsApi.getContacts().then(contacts =>
        {
            this.setState({
                contacts,
                contactCount : this.calculateContactCount(contacts)
            });
        })
        .catch(e => this.context.showNotification(e.message, 'error'));
    }

    calculateContactCount(contacts)
    {
        const counter = 0;

        for(let key in contacts)
        {
            const contact = contacts[key];

            if(contact.email && contact.status === 'new')
                counter++;
        }

        counter;
    }

    launchCampaign()
    {
        const { i18n, showNotification } = this.context;

        return this.campaignsApi.startCampaign(this.state.campaignId).then(() =>
        {
            showNotification(i18n.getMessage('CampaignOverview.notification.campaignLaunched'), 'success');
        })
        .catch(e => this.context.showNotification(e.message, 'error'));
    }

    handleBack(e)
    {
        e.preventDefault();

        this.context.router.push(this.state.prevViewLink);
    }

    handleLaunch(e)
    {
        e.preventDefault();

        const { i18n, showModalDialog } = this.context;
        const { campaignId, contactCount } = this.state;

        const title = i18n.getMessage('CampaignOverview.modal.launchCampaign.title');
        const message = i18n.getMessage('CampaignOverview.modal.launchCampaign.text', { campaignId, contactCount });
        const buttons = { 'yes' : 'yes', 'no' : 'no' };
        const onButtonClick = (button) =>
        {
            this.context.hideModalDialog();

            if(button === 'yes')
                this.launchCampaign();
        }

        this.context.showModalDialog(title, message, buttons, onButtonClick);
    }

    render()
    {
        const { i18n } = this.context;
        const { contactCount } = this.state;

        return(
            <div>
                  <div className='row'>
                      <div className="col-xs-12 col-sm-6 col-md-4">
                          <h3>{i18n.getMessage('CampaignOverview.title.email')}</h3>
                          <TemplatePreview
                              templateId={1}
                              customerId={this.state.customerId}
                              allowFullPreview={true}
                              previewScale={0.5} />
                      </div>
                      <div className="col-xs-12 col-sm-6 col-md-4">
                          <h3>{i18n.getMessage('CampaignOverview.title.landingpage')}</h3>
                          <TemplatePreview
                              templateId={2}
                              customerId={this.state.customerId}
                              allowFullPreview={true}
                              previewScale={0.5} />
                      </div>
                      <div className="col-xs-12 col-sm-6 col-md-4">
                          <h3>{i18n.getMessage('CampaignOverview.title.emailCount')}</h3>
                          <div>{contactCount}</div>
                      </div>
                  </div>
                  <div className="row">
                      <div className="col-xs-12">
                          <div className="form-submit text-right">
                              <button className="btn btn-link" onClick={e => this.handleBack(e)}>{i18n.getMessage('CampaignOverview.button.previous')}</button>
                              <button className="btn btn-primary" onClick={e => this.handleLaunch(e)}>{i18n.getMessage('CampaignOverview.button.launchCampaign')}</button>
                          </div>
                      </div>
                  </div>
            </div>
        );
    }
}

export default CampaignProcess;
