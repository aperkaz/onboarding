import React from 'react';
import PropTypes from 'prop-types';
import { ContextComponent } from '../components-ng/common';
import serviceComponent from '@opuscapita/react-loaders/lib/serviceComponent';
import { TotalSummaryWidget } from '../components-ng/TotalSummaryWidget';
import translations from './i18n';

class CampaignDashboard extends ContextComponent
{
    constructor(props)
    {
        super(props);

        const serviceRegistry = (service) => ({ url: '/onboarding' });

        this.FunnelChart = serviceComponent({ serviceRegistry, serviceName: 'onboarding' , moduleName: 'funnelChart', jsFileName: 'funnelChart' });
        this.RecentCampaigns = serviceComponent({ serviceRegistry, serviceName: 'onboarding' , moduleName: 'recentCampaigns', jsFileName: 'recentCampaigns' });
        this.ConnectedSuppliers = serviceComponent({
            serviceRegistry : () => ({ url: '/einvoice-send' }),
            serviceName : 'einvoice-send',
            moduleName: 'connect-supplier-widget'
        });
    }

    render()
    {
        if(this.context.userData)
        {
            const { locale } = this.context;
            const customerId = this.context.userData.customerid;

            return(
                <div className="row">
                    <div className="col-xs-12 col-md-6">
                        <this.ConnectedSuppliers customerId={customerId} locale={locale} actionUrl="" />
                        <this.FunnelChart customerId={customerId} />
                    </div>
                    <div className="col-xs-12 col-md-6">
                        <this.RecentCampaigns customerId={customerId} />
                        <TotalSummaryWidget customerId={customerId} />
                    </div>
                </div>
            );
        }
        else
        {
            return(<div></div>);
        }
    }
}

export default CampaignDashboard;
