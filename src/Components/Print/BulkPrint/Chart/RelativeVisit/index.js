import React from "react";

//components
// import Header from "../Header";
import Body from "../../../Charts/RelativeVisit/Body";
import ChartHeader from "../ChartHeader";
// import Footer from "../Footer";



const RelativeVisit = ({ chart, center, patient }) => {
    return (
        <React.Fragment>
            {/* <Document>
        <Page style={styles.page} size="A4" wrap> */}
            {/* <Header chart={chart} center={center} patient={patient} /> */}
            <ChartHeader chart={chart} />
            <Body chart={chart.relativeVisit} />
            {/* <Footer /> */}
            {/* </Page>
      </Document> */}
        </React.Fragment>
    );
};

export default RelativeVisit;
