import React from 'react';
import { ContextComponent } from '../components/common';
import { MainMenu } from '../components/MainMenu';

class InnerLayout extends ContextComponent
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
