import React from "react";
import { Row, Col } from "reactstrap";
import Divider from "../../../../Components/Common/Divider"; 
import FormField from "./FormField";
import FixedGridField from "./FixedGridField";


const SectionRenderer = ({ sections, values, onChange, errors }) => {
  return (
    <>
      {sections.map((section) => (
        <div key={section.title} className="mb-4">
          <div className="d-flex align-items-center flex-wrap gap-2 gap-md-3 mb-3">
            <h6 className="fs-xs-12 fs-md-14 display-6 mb-0">
              {section.title}
            </h6>
            <Divider />
          </div>

          {section.items
            .filter((item) => item.kind === "grid")
            .map((item) => (
              <FixedGridField
                key={item.path}
                field={item}
                values={values}
                onChange={onChange}
                error={errors?.[item.path]}
              />
            ))}

          <Row>
            {section.items
              .filter((item) => item.kind !== "grid")
              .map((item) => (
                <FormField
                  key={item.path}
                  field={item}
                  values={values}
                  onChange={onChange}
                  error={errors?.[item.path]}
                />
              ))}
          </Row>
        </div>
      ))}
    </>
  );
};

export default SectionRenderer;
