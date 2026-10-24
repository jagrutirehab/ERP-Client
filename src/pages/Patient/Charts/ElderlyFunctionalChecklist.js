import { Col } from "reactstrap";
import Divider from "../../../Components/Common/Divider";
import { elderlyFunctionalChecklistFields } from "../../../Components/constants/patient";
import { convertSnakeToTitle } from "../../../utils/convertSnakeToTitle";

const ElderlyFunctionalChecklist = ({ data }) => {
  if (!data) return null;

  const sections = [];
  let currentSection = null;

  elderlyFunctionalChecklistFields.forEach((field) => {
    if (field.type === "header") {
      currentSection = { label: field.label, fields: [] };
      sections.push(currentSection);
      return;
    }
    if (currentSection) currentSection.fields.push(field);
  });

  return (
    <>
      {sections.map((section, index) => {
        const rows = section.fields.filter((field) => {
          if (field.showIf) {
            const { field: conditionField, value } = field.showIf;
            if (value !== undefined && data[conditionField] !== value)
              return false;
          }
          const value = data[field.name];
          return value !== undefined && value !== null && value !== "" &&
            !(Array.isArray(value) && value.length === 0);
        });

        if (!rows.length) return null;

        return (
          <Col xs={12} key={index}>
            <h6 className="mt-3 mb-2">{section.label}</h6>
            {rows.map((field) => (
              <p key={field.name} className="mb-1">
                <span className="fw-semibold me-2">{field.label}:</span>
                {convertSnakeToTitle(data[field.name])}
              </p>
            ))}
          </Col>
        );
      })}

      <Divider />
    </>
  );
};

export default ElderlyFunctionalChecklist;
