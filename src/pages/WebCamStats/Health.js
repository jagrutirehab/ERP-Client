import React from "react";
import { Container } from "reactstrap";
import MachineStatus from "./MachineStatus";

/**
 * CCTV Health — live status of every monitoring machine across the centres.
 *
 * Its own page rather than a band on the analytics dashboard: this is what you
 * open when something is wrong, and it should not be below a chart.
 *
 * No centre filter: the whole point is seeing the entire fleet at a glance, and
 * with a handful of machines a filter only hides the one that is broken.
 */
const Health = () => {
  return (
    <React.Fragment>
      <div className="page-content overflow-hidden">
        <Container fluid>
          <div className="chat-wrapper d-flex row gap-1 mx-n4 my-n4 mb-n5 p-1">
            <div className="mb-4">
              <h2 className="fw-bold text-dark mb-1">CCTV Health</h2>
              <p className="text-muted mb-0">
                Are the monitoring machines at each centre alive?
              </p>
            </div>

            {/* The page heading above already names this section. */}
            <MachineStatus showHeading={false} />
          </div>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Health;
