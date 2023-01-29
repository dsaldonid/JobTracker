import React from 'react'
import Dashboard from '../dashboard/Dashboard'
import SignInPage from '../authentication/SignInPage'
import { AppContext } from './../../index'
import AppStore from './AppStore'
import { AppPageState } from './types'
import {observer} from 'mobx-react-lite'
import SignUpPage from '../authentication/SignUpPage'

const AppContainer: React.FC= observer(()=> {
    const store: AppStore = React.useContext(AppContext)

    const renderContent = () => {
        switch(store.pageState) {
            case AppPageState.LOGIN_PAGE:
                return (<SignInPage />);
            case AppPageState.SIGN_UP_PAGE:
                return (<SignUpPage />);
            default:
                return (<Dashboard />)
        }
    }

    return (
        <>
            {renderContent()}
        </>
    );
});

export default AppContainer;