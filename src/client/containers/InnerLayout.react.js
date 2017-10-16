import React from 'react';
import { ConditionalRenderComponent } from '../components/common';
import { MainMenu } from '../components/MainMenu';

class InnerLayout extends ConditionalRenderComponent
{
    render()
    {
        return(
            <div>
                <MainMenu
                    ref={node => this.mainMenu = node}
                    onLanguageChange={locale => this.context.setLocale(locale)} />

            {this.props.children}
            </div>
        )
    }
}

export default InnerLayout;
