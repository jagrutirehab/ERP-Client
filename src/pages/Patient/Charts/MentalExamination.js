import React from "react";
import { Col } from "reactstrap";
import Divider from "../../../Components/Common/Divider";


const MentalExamination = ({ data }) => {
    if (!data) return null;

    function convertCamelCaseToTitleCase(str) {
        return (
            str
                // Split the string at each uppercase letter
                .split(/(?=[A-Z])/)
                // Capitalize the first letter of each word
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                // Join the words with a space
                .join(" ")
        );
    }


    const singleFieldSections = ["judgment", "remarks", "perception"];

    return (
        <>
            {Object.entries(data).map(([groupKey, groupValue], i) => {
                const blockedKeys = ["_id", "__v"];
                if (blockedKeys.includes(groupKey)) return null;
                const isObject =
                    typeof groupValue === "object" && groupValue !== null;

                // ⭐ CASE 1: GROUP SECTION (appearance, speech, mood…)  
                if (isObject) {
                    return (
                        <Col xs={12} key={i}>
                            <h6 className="mt-3 mb-2 fs-xs-12 fs-md-14 display-7">
                                {convertCamelCaseToTitleCase(groupKey)}
                            </h6>

                            {Object.entries(groupValue).map(([subKey, subValue], j) => (
                                <div className="mt-1 mb-1" key={j}>
                                    <p className="fs-xs-9 fs-md-11 mb-0">
                                        <span className="display-6 font-semi-bold fs-xs-10 fs-md-14 me-3">
                                            {convertCamelCaseToTitleCase(subKey)}:-
                                        </span>
                                        {subValue || ""}
                                    </p>
                                </div>
                            ))}
                        </Col>
                    );
                }

                // ⭐ CASE 2: SINGLE FIELD SECTIONS (judgment, remarks)
                if (singleFieldSections.includes(groupKey)) {
                    return (
                        <Col xs={12} key={i}>
                            <h6 className="mt-3 mb-2 fs-xs-12 fs-md-14 display-7">
                                {convertCamelCaseToTitleCase(groupKey)}
                            </h6>

                            <div className="mt-1 mb-1">
                                <p className="fs-xs-9 fs-md-11 mb-0">{groupValue || ""}</p>
                            </div>
                        </Col>
                    );
                }

                // ⭐ CASE 3: fallback (should not be common)
                return (
                    <Col xs={12} key={i}>
                        <div className="mt-1 mb-1">
                            <p className="fs-xs-9 fs-md-11 mb-0">
                                <span className="display-6 font-semi-bold fs-xs-10 fs-md-14 me-3">
                                    {convertCamelCaseToTitleCase(groupKey)}:
                                </span>
                                {groupValue}
                            </p>
                        </div>
                    </Col>
                );
            })}

            <Divider />
        </>
    );
};

export default MentalExamination;
