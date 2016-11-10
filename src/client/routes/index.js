import { Route } from 'react-router';
import CampaignSearch from '../containers/CampaignSearch.react';
import CampaignEdit from '../containers/CampaignEdit.react';
import Layout from '../containers/Layout.react';

export default (
    <Route component={Layout}>
        <Route path="/" component={CampaignSearch}/>
        <Route path="/create" component={CampaignEdit}/>
    </Route>
);