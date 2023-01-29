import React from 'react';
import logo from './logo.svg';
import { inject, observer } from "mobx-react";
import './App.css';
import Dashboard from './components/dashboard/Dashboard';
import AppContainer from './components/app/AppContainer'


export default function App() {
  return (
    <div className="dashboard">
      <AppContainer />
    </div>
  );
}
