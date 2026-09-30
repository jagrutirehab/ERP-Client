import React from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Table,
} from "reactstrap";

const WeekOffModal = ({ isOpen, toggle, row }) => {
  const weekOffs = row?.weekOffs || {};
  const monthEntries = Object.entries(weekOffs);

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size="md">
      <ModalHeader toggle={toggle}>
        Week Off Details
      </ModalHeader>

      <ModalBody>
        <p>
          <strong>Policy Name:</strong> {row?.policyName || "-"}
        </p>

        {monthEntries.length === 0 ? (
          <p className="text-muted">No week off data available</p>
        ) : (
          <Table bordered responsive className="mt-3">
            <thead className="table-light">
              <tr>
                <th>Month</th>
                <th>Week Offs</th>
              </tr>
            </thead>
            <tbody>
              {monthEntries.map(([month, count]) => (
                <tr key={month}>
                  <td className="text-capitalize">{month}</td>
                  <td>{count}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </ModalBody>

      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};


export default WeekOffModal;
