import React from 'react';
import PropTypes from 'prop-types';
import { ContextComponent } from '../common';
import { ResetTimer } from '../../system';
import { Menu, MenuIcon, MenuDropdownGrid, Notifications, Notification, MenuAccount, MenuSelect } from '@opuscapita/react-navigation';
import translations from './i18n';
import navItems from './navItems';

class MainMenu extends ContextComponent
{
    static propTypes = {
        onLanguageChange : PropTypes.func.isRequired,
        onSearch : PropTypes.func.isRequired
    }

    static defaultProps = {
        onLanguageChange : (locale) => null,
        onSearch : (term) => null
    }

    static lvl1Mappings = [ '/bnp', '/onboarding' ]

    constructor(props, context)
    {
        super(props);

        this.state = {
            newNotifications : [ ],
            recentNotifications : [ ],
            activeMenuItem : 0
        }

        context.i18n.register('MainMenu', translations);

        this.logoImage = 'data:image/svg+xml,' + encodeURIComponent(require('!!raw-loader!./img/oc-logo-white.svg'));
        this.searchTimer = new ResetTimer();
    }

    componentDidMount()
    {
        const { router } = this.context;

        this.switchMenuItemByPath(router.location.basename);
        router.listen(item => this.switchMenuItemByPath(item.basename));
    }

    switchMenuItemByPath(basename)
    {
        const activeMenuItem = MainMenu.lvl1Mappings.indexOf(basename);
        this.setState({ activeMenuItem });
    }

    handleSearch(e)
    {
        const value = e.target.value;
        this.searchTimer.reset(() => this.props.onSearch(value), 500);
    }

    handleClick(path)
    {
        const { router } = this.context;
        const location = router.location;

        if(path.startsWith(location.basename))
            router.push(path.substr(location.basename.length));
        else
            document.location.replace(path);
    }

    handleLogout()
    {
        const { i18n } = this.context;

        const title = i18n.getMessage('MainMenu.logoutDialog.title');
        const message = i18n.getMessage('MainMenu.logoutDialog.message');
        const buttons = { 'no' : i18n.getMessage('System.no'), 'yes' : i18n.getMessage('System.yes'), };
        const onButtonClick = (button) =>
        {
            if(button === 'yes')
                document.location.replace('/auth/logout');
        }

        this.context.showModalDialog(title, message, onButtonClick, buttons);
    }

    handleManualClick(e)
    {
        e.preventDefault();

        const manualName = this.context.i18n.getMessage('MainMenu.manualName');
        const url = '/blob/public/api/opuscapita/files/public/docs/' + manualName;

        document.location.replace(url);
    }

    handleLanguageChange(e)
    {
        this.props.onLanguageChange(e.target.value);
    }

    getIcon(icon)
    {
        return require(`!!raw-loader!@opuscapita/svg-icons/lib/${icon}.svg`);
    }

    getNavItems()
    {
        const { supplierid, customerid, roles } = this.context.userData;
        const { locale } = this.context;

        let items = [ ];

        if(supplierid)
            items = navItems['supplier'][locale];
        else if(customerid)
            items = navItems['customer'][locale];
        else if(roles.indexOf('admin') > -1)
            items = navItems['admin'][locale];

        const mapItem = (item) =>
        {
            const result = { children : item.label };

            if(item.link)
                result['onClick'] = () => this.handleClick(item.link);
            else if(item.children)
                result['subItems'] = item.children.map(mapItem);

            return result;
        }

        return items.map(mapItem);
    }

    render()
    {
        const { i18n, userData } = this.context;
        const { activeMenuItem, newNotifications, recentNotifications } = this.state;

        const applicationItems = [{
            label : 'Business Network',
            svg : this.getIcon('app_business_network_portal'),
            onClick : () => this.handleClick('/bnp')
        }];
        /*const applicationItems = [{
            label : 'Analytics',
            svg : this.getIcon('link')
        }, {
            label : 'Business Network Portal',
            svg : this.getIcon('app_business_network_portal')
        }, {
            label : 'Catalog Portal',
            svg : this.getIcon('app_catalog_portal')
        }, {
            label : 'Contracts',
            svg : this.getIcon('app_contracts')
        }];*/

        return(
            <Menu
                appName="Business Network"
                activeItem={activeMenuItem}
                alwaysAtTop={true}
                className="oc-menu--opuscapita-dark-theme"
                logoSrc={this.logoImage}
                logoTitle="OpusCapita"
                logoHref="http://www.opuscapita.com"
                showSearch={true}
                searchProps={{
                    placeholder : i18n.getMessage('MainMenu.search'),
                    onChange : (e) => this.handleSearch(e)
                }}
                navigationItems={this.getNavItems()}
                iconsBarItems={[(
                    <MenuIcon
                        svg={this.getIcon('apps')}
                        title="Applications"
                        hideDropdownArrow={true}>
                        <MenuDropdownGrid
                            activeItem={0}
                            items={applicationItems}/>
                    </MenuIcon>
                ), (
                    <MenuIcon
                        onClick={() => console.log('click!')}
                        svg={this.getIcon('notifications')}
                        supTitle={newNotifications.length}
                        title="Notifications"
                        hideDropdownArrow={true}>
                        <Notifications>
                            <div className="oc-notifications__header">{i18n.getMessage('MainMenu.newNotifications')}</div>
                            {
                                newNotifications && newNotifications.length ?
                                <Notification
                                    svg={this.getIcon('info')}
                                    svgClassName="fill-info"
                                    message={<span>Your password will expire in 14 days. <a href="#">Change it now</a></span>}
                                    dateTime="20/02/2017"/>
                                :
                                <div className="oc-notification">
                                    <div className="oc-notification__text-contaniner">
                                        <div className="oc-notification__message">
                                            <span>{i18n.getMessage('MainMenu.noNewNotifications')}</span>
                                        </div>
                                    </div>
                                </div>
                            }
                            {
                                recentNotifications && recentNotifications.length ?
                                <div>
                                    <hr className="oc-notifications__divider" />
                                    <div className="oc-notifications__header">{i18n.getMessage('MainMenu.recentNotifications')}</div>
                                </div>
                                :
                                <div></div>
                            }
                            {/*<Notification
                                svg={this.getIcon('info')}
                                svgClassName="fill-info"
                                message={<span>Your password will expire in 14 days. <a href="#">Change it now</a></span>}
                                dateTime="20/02/2017"/>
                            <Notification
                                svg={this.getIcon('warning')}
                                svgClassName="fill-error"
                                message={<span>Automatic currnency rate update failed. <a href="#">Try manual update</a></span>}
                                dateTime="20/02/2017"/>*/}
                            {/*<Notification
                                svg={this.getIcon('check')}
                                svgClassName="fill-success"
                                message={<span>Full report for Neon Lights Oy you requester is ready. <a href="#">See full results</a></span>}
                                dateTime="20/02/2017"/>*/}
                            {/*<div className="oc-notifications__more-container">
                                <a href="#" className="oc-notifications__more">
                                    View more
                                </a>
                            </div>*/}
                        </Notifications>
                    </MenuIcon>
                ), (
                    <MenuIcon label={userData.firstname}>
                        <MenuAccount
                        firstName={userData.firstname}
                        lastName={userData.lastname}
                        userName={userData.id}
                        avatarSrc="./static/avatar.jpg"
                        actions={[{
                            label : i18n.getMessage('MainMenu.logout'),
                            onClick : () => this.handleLogout()
                        }]}
                        bottomElement={(
                            <div>
                                <div className="oc-menu-account__select-item">
                                    <span><strong>{i18n.getMessage('MainMenu.support')}:</strong> +49 231 3967 350<br /><a href="mailto:customerservice.de@opuscapita.com">customerservice.de@opuscapita.com</a></span>
                                </div>
                                <div className="oc-menu-account__select-item">
                                    <span><strong>{i18n.getMessage('MainMenu.manual')}:</strong> <a href="#" onClick={e => this.handleManualClick(e)}>{i18n.getMessage('MainMenu.download')}</a></span>
                                </div>

                                <div className="oc-menu-account__select-item">
                                    <span className="oc-menu-account__select-item-label">{i18n.getMessage('MainMenu.language')}</span>
                                    <MenuSelect className="oc-menu-account__select-item-select" defaultValue={userData.languageid} onChange={e => this.handleLanguageChange(e)}>
                                        <option value="en">{i18n.getMessage('MainMenu.laguage.english')}</option>
                                        <option value="de">{i18n.getMessage('MainMenu.laguage.german')}</option>
                                    </MenuSelect>
                                </div>
                            </div>
                        )}/>
                    </MenuIcon>
                )]}/>
        )
    }
}

export default MainMenu;
