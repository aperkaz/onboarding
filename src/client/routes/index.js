import React from 'react';
import { Route } from 'react-router';
import CampaignSearch from '../containers/CampaignSearch.react';
import CampaignCreate from '../containers/CampaignCreate.react';
import CampaignEdit from '../containers/CampaignEdit.react';
import CampaignContacts from '../containers/CampaignContacts.react';
import Layout from '../containers/Layout.react';
import CampaignPage from '../containers/CampaignPage.react';

export default (
  <Route component={Layout}>
    <Route path="/" component={CampaignSearch}/>
    <Route path="/create" component={CampaignCreate}/>
    <Route path="/edit/:campaignId" component={CampaignEdit}/>

    <Route path="/edit/:campaignId/contacts" component={CampaignContacts}/>
    <Route path="/campaignPage/:campaignId/:contactId" component={CampaignPage}/>
  </Route>
);
