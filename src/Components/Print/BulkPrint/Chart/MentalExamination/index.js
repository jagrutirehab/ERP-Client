import React from "react";

import ChartHeader from "../ChartHeader";
import MentalExaminationBody from "../../../Charts/MentalExaminationBody";


const MentalExamination = ({ chart, center, patient }) => {
    return (
        <React.Fragment>
            <ChartHeader chart={chart} />
            <MentalExaminationBody chart={chart.mentalExamination}  />
        </React.Fragment>
    );
};

export default MentalExamination;
