import { Col } from "reactstrap";
import Divider from "../../../Components/Common/Divider";
import { mentalExaminationV2Fields } from "../../../Components/constants/patient";
import { convertSnakeToTitle } from "../../../utils/convertSnakeToTitle";

const MentalExamination = ({ data }) => {
    if (!data) return null;

    const convertCamelCaseToTitleCase = (str) =>
        str
            .split(/(?=[A-Z])/)
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");

    const fieldLabelMap = {};
    mentalExaminationV2Fields.forEach((f) => {
        if (f.name) fieldLabelMap[f.name] = f.label;
    });

    const mergedAffect = {
        affect: data.mood?.affect || "",
        affectNotes: data.mood?.affectNotes || "",
        ...(data.affectV2 || {}),
    };

    const groupOrder = [
        "chiefComplaints",
        "appearanceAndBehavior",
        "speech",
        "mood",
        "affect",
        "thought",
        "perception",
        "cognition",
        "insight",
        "judgment",
        "remarks",
        "observation",
    ];

    return (
        <>
            {groupOrder.map((groupKey, index) => {
                const groupValue = data[groupKey];
                if (!groupValue) return null;

                const isObject =
                    typeof groupValue === "object" && groupValue !== null;

                // MOOD + AFFECT
                if (groupKey === "mood") {
                    const { affect, affectNotes, ...filteredMood } = groupValue;

                    return (
                        <Col xs={12} key={index}>
                            <h6 className="mt-3 mb-2">Mood</h6>

                            {Object.entries(filteredMood).map(([k, v], j) => (
                                <p key={j} className="mb-1">
                                    <span className="fw-semibold me-2">
                                        {fieldLabelMap[k] ??
                                            convertCamelCaseToTitleCase(k)}
                                        :
                                    </span>
                                    {convertSnakeToTitle(v)}
                                </p>
                            ))}

                            <h6 className="mt-3 mb-2">Affect</h6>

                            {Object.entries(mergedAffect).map(([k, v], j) => (
                                <p key={j} className="mb-1">
                                    <span className="fw-semibold me-2">
                                        {fieldLabelMap[k] ??
                                            convertCamelCaseToTitleCase(k)}
                                        :
                                    </span>
                                    {convertSnakeToTitle(v)}
                                </p>
                            ))}
                        </Col>
                    );
                }

                // PERCEPTION
                if (groupKey === "perception") {
                    const perceptionObj = {};

                    if (data.perception && String(data.perception).trim() !== "") {
                        perceptionObj.perception = data.perception;
                    }

                    if (
                        data.perceptionNotes &&
                        String(data.perceptionNotes).trim() !== ""
                    ) {
                        perceptionObj.perceptionNotes = data.perceptionNotes;
                    }

                    if (Object.keys(perceptionObj).length === 0) return null;

                    return (
                        <Col xs={12} key={index}>
                            <h6 className="mt-3 mb-2">Perception</h6>

                            {Object.entries(perceptionObj).map(([k, v], j) => (
                                <p key={j} className="mb-1">
                                    <span className="fw-semibold me-2">
                                        {fieldLabelMap[k] ??
                                            convertCamelCaseToTitleCase(k)}
                                        :
                                    </span>
                                    {convertSnakeToTitle(v)}
                                </p>
                            ))}
                        </Col>
                    );
                }

                // SIMPLE SINGLE FIELDS
                if (["judgment", "remarks", "chiefComplaints", "observation"].includes(groupKey)) {
                    if (!groupValue || String(groupValue).trim() === "") return null;

                    return (
                        <Col xs={12} key={index}>
                            <h6 className="mt-3 mb-2">
                                {convertCamelCaseToTitleCase(groupKey)}
                            </h6>
                            <p className="mb-1">{convertSnakeToTitle(groupValue)}</p>
                        </Col>
                    );
                }

                //  NORMAL OBJECT GROUP
                if (isObject) {
                    return (
                        <Col xs={12} key={index}>
                            <h6 className="mt-3 mb-2">
                                {convertCamelCaseToTitleCase(groupKey)}
                            </h6>

                            {Object.entries(groupValue).map(([k, v], j) => (
                                <p key={j} className="mb-1">
                                    <span className="fw-semibold me-2">
                                        {fieldLabelMap[k] ??
                                            convertCamelCaseToTitleCase(k)}
                                        :
                                    </span>
                                    {convertSnakeToTitle(v)}
                                </p>
                            ))}
                        </Col>
                    );
                }

                // SIMPLE VALUE
                return (
                    <Col xs={12} key={index}>
                        <p className="mb-1">
                            <span className="fw-semibold me-2">
                                {convertCamelCaseToTitleCase(groupKey)}:
                            </span>
                            {convertSnakeToTitle(groupValue)}
                        </p>
                    </Col>
                );
            })}

            <Divider />
        </>
    );
};

export default MentalExamination;
