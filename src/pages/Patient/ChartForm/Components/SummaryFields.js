import React from "react";
import { Row, Col, Label, Input } from "reactstrap";
import PropTypes from "prop-types";

const SummaryFields = ({ item, validation }) => {
  return (
    <React.Fragment>
      {item.fields ? (
        <div>
          <h6 className="display-6 fs-5">{item.label}</h6>
          <Row>
            {(item.fields || []).map((field, id) => (
              <Col key={id} xs={field.xs} md={field.md}>
                <div className="mb-3">
                  <Label for={item.name}>{field.label}</Label>
                  <Input
                    type={field.type}
                    rows="4"
                    bsSize="sm"
                    name={field.name}
                    onChange={(e) => {
                      const name = e.target.name;
                      const value = e.target.value;
                      const event = {
                        target: {
                          name: item.name,
                          value: {
                            ...validation.values[item.name],
                            [name]: value,
                          },
                        },
                      };
                      validation.handleChange(event);
                    }}
                    onBlur={validation.handleBlur}
                    value={validation.values[item.name][field.name] || ""}
                    className="form-control"
                  />
                </div>
              </Col>
            ))}
          </Row>
        </div>
      ) : (
        <Col xs={item.xs} md={item.md}>
          <div className="mb-3">
            <Label for={item.name}>{item.label}</Label>
            <Input
              type={item.type}
              rows="4"
              bsSize="sm"
              name={item.name}
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values[item.name] || ""}
              className="form-control"
            />
          </div>
        </Col>
      )}
    </React.Fragment>
  );
};

SummaryFields.propTypes = {
  item: PropTypes.object.isRequired,
  validation: PropTypes.object.isRequired,
};

export default SummaryFields;
