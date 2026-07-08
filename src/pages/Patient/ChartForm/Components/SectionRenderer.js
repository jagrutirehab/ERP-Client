import React from "react";
import { Row, Col } from "reactstrap";
import Divider from "../../../../Components/Common/Divider"; // TODO: adjust relative path to match where this file lives in your project
import FormField from "./FormField";
import FixedGridField from "./FixedGridField";

/**
 * sections: [
 *   {
 *     title: "C. Substance Use History",
 *     items: [
 *       { kind: "grid", ...fixedGridConfig },
 *       { kind: "field", ...formFieldConfig },
 *       ...
 *     ],
 *   },
 *   ...
 * ]
 */
const SectionRenderer = ({ sections, values, onChange }) => {
  return (
    <>
      {sections?.map((section) => (
        <div key={section.title} className="mb-4">
          <div className="d-flex align-items-center gap-3 mb-3">
            <h6 className="display-6 fs-5 text-nowrap">{section.title}</h6>
            <Divider />
          </div>

          {section?.items
            .filter((item) => item.kind === "grid")
            .map((item) => (
              <FixedGridField
                key={item.path}
                field={item}
                values={values}
                onChange={onChange}
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
                />
              ))}
          </Row>
        </div>
      ))}
    </>
  );
};

export default SectionRenderer;
