import React from 'react';
import { connect } from 'react-redux';
import { searchCampaigns } from '../actions/campaign'
import CampaignSearchForm from '../components/CampaignEditor/CampaignSearchForm.react';
import CampaignSearchResult from '../components/CampaignEditor/CampaignSearchResult.react';
import {push} from 'redux-router';

@connect(
    state => ({ campaignData: state.campaign }),
    (dispatch) => {
        return {
            handleSearchCampaigns: () => {dispatch(searchCampaigns())},
            handleCreate: () => {dispatch(push({pathname: '/create'}))}
        }
    }
)
export default class CampaignSearch extends React.Component {
    componentDidMount() {
        this.props.handleSearchCampaigns();
    }

    render() {
        console.log(this.props.campaignData);
        return (
            <div>
                <CampaignSearchForm onSearch={this.props.handleSearchCampaigns} onCreate={this.props.handleCreate}/>
                <CampaignSearchResult campaigns={this.props.campaignData.campaigns}/>
            </div>
        );
    }
}