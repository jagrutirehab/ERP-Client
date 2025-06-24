import React from "react";

import Body from "../../../Charts/ClinicalNote/Body";
import ChartHeader from "../ChartHeader";


const ClinicalNote = ({ chart, center, patient }) => {
    return (
        <React.Fragment>
            <ChartHeader chart={chart} />
            <Body chart={chart.clinicalNote} />
        </React.Fragment>
    );
};

export default ClinicalNote;
