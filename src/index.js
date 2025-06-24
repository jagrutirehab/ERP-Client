import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
// import CustomRouter from "./Routes/CustomRouter";
import store from "./store/store"; //{ persistor }
// import { PersistGate } from "redux-persist/integration/react";


//Graph QL Setup
import { ApolloProvider } from '@apollo/client';
import client from './GraphQL/Apollo/client';


import {
  BrowserRouter,
  unstable_HistoryRouter as HistoryRouter,
} from "react-router-dom";
import history from "./Routes/HistoryRoute";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    {/* <PersistGate loading={null} persistor={persistor}> */}
    <React.Fragment>
      {/* <BrowserRouter basename={process.env.PUBLIC_URL}> */}
      <HistoryRouter history={history} basename={process.env.PUBLIC_URL}>

        {/* GraphQL */}
        <ApolloProvider client={client}>
        <App />
        </ApolloProvider>
      </HistoryRouter>
      {/* </BrowserRouter> */}
    </React.Fragment>
    {/* </PersistGate> */}
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
