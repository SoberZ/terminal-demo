import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import UserService from "./services/UserService";
import HttpService from "./services/HttpService";
import AppContext from "./utils/AppContext";

import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./index.scss";

UserService.initKeycloak().then(() => {
    HttpService.configure();
    ReactDOM.createRoot(document.getElementById("root")).render(
        <AppContext>
            <App />
        </AppContext>
    );
});
