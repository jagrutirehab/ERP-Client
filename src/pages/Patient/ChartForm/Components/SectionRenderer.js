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

          {(() => {
            const groups = [];
            let currentFieldGroup = null;

            section.items.forEach((item) => {
              if (item.kind === "grid") {
                currentFieldGroup = null;
                groups.push({ kind: "grid", item });
              } else {
                if (!currentFieldGroup) {
                  currentFieldGroup = { kind: "fields", items: [] };
                  groups.push(currentFieldGroup);
                }
                currentFieldGroup.items.push(item);
              }
            });

            return groups.map((group, idx) =>
              group.kind === "grid" ? (
                <FixedGridField
                  key={group.item.path}
                  field={group.item}
                  values={values}
                  onChange={onChange}
                  error={errors?.[group.item.path]}
                />
              ) : (
                <Row key={`fields-${idx}`}>
                  {group.items.map((item) => (
                    <FormField
                      key={item.path}
                      field={item}
                      values={values}
                      onChange={onChange}
                      error={errors?.[item.path]}
                    />
                  ))}
                </Row>
              ),
            );
          })()}
        </div>
      ))}
    </>
  );
};

export default SectionRenderer;
