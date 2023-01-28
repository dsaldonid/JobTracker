import {observable, action} from 'mobx'
import { AppPageState } from './types'

export default class AppStore {
    @observable pageState : AppPageState = AppPageState.LOGIN_PAGE;
    
    @action setPageState(newState: AppPageState) { 
        this.pageState = newState;
    }
}