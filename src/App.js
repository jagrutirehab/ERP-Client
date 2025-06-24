import React, { useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';


//import Scss
import "./assets/scss/themes.scss";

//imoprt Route
import Route from "./Routes";
import { addData, getStoreData, initDB } from "./lib/db";
import { connect } from "react-redux";



function App({ patients }) {
  //init indexedDB patients cache
  // useEffect(() => {
  //   const init = async () => {
  //     const indexDB = localStorage.getItem("indexDB");
  //     if (!indexDB && indexDB !== "undefined") {
  //       const initDb = await initDB();
  //       localStorage.setItem("indexDB", initDb);
  //     }
  //   };
  //   init().then();
  // }, [patients]);

  return (
    <React.Fragment>
      <Route />
    </React.Fragment>
  );
}

const mapStateToProps = (state) => ({
  patients: state.Patient.allPatients,
});

export default connect(mapStateToProps)(App);
