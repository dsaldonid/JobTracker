import React from "react";
import logo from "./logo.svg";
import { inject, observer } from "mobx-react";
import "./App.css";
import Login from "./components/dashboard/Login";
import Dashboard from "./components/dashboard/Dashboard";
import AppContainer from "./components/app/AppContainer";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <div className="dashboard">
      <AppContainer />
    </div>
  );
}
