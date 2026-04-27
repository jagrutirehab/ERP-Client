import React from "react";
import PropTypes from "prop-types";
import { Button, Container, Row, Col } from "reactstrap";
import _ from "lodash";

const chunkSize = 30;
const BatchSelector = ({ charts, onSelect }) => {
  const batches = _.chunk(charts || [], chunkSize);


  const getBatchLabel = (batchIndex) => {
    const start = batchIndex * chunkSize + 1;
    const end = Math.min((batchIndex + 1) * chunkSize, charts.length);
    return `${start} - ${end}`;
  };

  return (
    <Container className="py-5">
      <div className="text-center mb-4">
        <h5 className="mb-3">Select Charts Batch to Print</h5>
        <p className="text-muted">Total charts: {charts?.length || 0}</p>
      </div>

      <Row className="g-3 justify-content-center">
        {batches.map((batch, index) => (
          <Col key={index} xs="auto" className="mb-2">
            <Button
              color="primary"
              outline
              onClick={() => {
                console.log('Batch selected:', index, 'batch array length:', batch?.length, batch);
                onSelect(batch, index);
              }}
              className="batch-button"
              style={{
                minWidth: "120px",
              }}
            >
              {getBatchLabel(index)}
            </Button>
          </Col>
        ))}
      </Row>

      <div className="text-center mt-4">
        <p className="text-muted small">
          Click on a batch to preview and print those charts
        </p>
      </div>
    </Container>
  );
};

BatchSelector.propTypes = {
  charts: PropTypes.array.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default BatchSelector;
