import React from 'react';
import { ContextComponent } from '../common';
import { Campaigns } from '../../api';
import PropTypes from 'prop-types';
import translations from './i18n';

class TotalSummaryWidget extends ContextComponent
{
    static propTypes = {
        customerId : PropTypes.string.isRequired
    }

    static statuses = ['started', 'bounced', 'read', 'loaded', 'registered', 'serviceConfig', 'onboarded', 'connected'];

    constructor(props)
    {
        super(props);

        this.state = {
            campaigns : [ ]
        }

        this.campaignsApi = new Campaigns();
    }

    componentWillMount()
    {
        this.context.i18n.register('TotalSummaryWidget', translations);
    }

    componentDidMount()
    {
        return this.reload();
    }

    componentWillReceiveProps(nextProps, nextContext)
    {
        if(nextContext.locale != this.context.locale)
        {
            this.context.i18n.register('TotalSummaryWidget', translations);
            return this.reload();
        }
    }

    reload()
    {
        return this.campaignsApi.getCampaignStats(this.props.customerId).then(stats =>
        {
            const results = { };
            stats.forEach(item => results[item.status] = (results[item.status] || 0) + item.statusCount);

            return results;
        })
        .then(stats => this.setState({ stats }))
        .catch(e => this.context.showNotification(e.message, 'error', 10));
    }

    render()
    {
        const { i18n } = this.context;
        const { stats } = this.state;

        return(
            <div className="panel panel-success">
                <div className="panel-heading">
                    {i18n.getMessage('TotalSummaryWidget.title')}
                </div>
                <div className="panel-body">
                    {
                        stats && TotalSummaryWidget.statuses.map(status =>
                        {
                            return(
                                <div key={status} className="col-xs-4 TotalSummary-panel">
                                    <div className="panel panel-default">
                                        <div className="panel-heading">
                                            {i18n.getMessage(`TotalSummaryWidget.label.${status}`)}
                                        </div>
                                        <div className="panel-body">
                                            {stats[status] || '-'}
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        )
    }
}

export default TotalSummaryWidget;
