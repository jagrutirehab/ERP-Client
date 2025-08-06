import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import store, { persistor } from "./store/store";
import { PersistGate } from "redux-persist/integration/react";
import { ApolloProvider } from "@apollo/client";
import client from "./GraphQL/Apollo/client";
import { unstable_HistoryRouter as HistoryRouter } from "react-router-dom";
import history from "./Routes/HistoryRoute";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
    <React.Fragment>
      <HistoryRouter history={history} basename={process.env.PUBLIC_URL}>
        <ApolloProvider client={client}>
          <App />
        </ApolloProvider>
      </HistoryRouter>
    </React.Fragment>
    </PersistGate>
  </Provider>
);
reportWebVitals();
