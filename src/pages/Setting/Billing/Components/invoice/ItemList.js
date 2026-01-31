import React, { useState } from "react";
import { Button, Row, Col, Table, Input } from "reactstrap";
import PropTypes from "prop-types";
import EditItem from "./EditItem";

const InvoiceProcedureList = ({
  items,
  totalItems,
  totalPages,
  currentPage,
  setDeleteItem,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}) => {
  const [updateItem, setUpdateItem] = useState({
    isOpen: false,
    formData: null,
  });

  const toggleUpdateForm = (idx, data) =>
    setUpdateItem({
      isForm: true,
      formIndex: idx,
      formData: data,
    });

  const toggleUpdateModal = () => {
    setUpdateItem({
      isOpen: false,
      formData: null,
    });
  };

  const openEditModal = (item) => {
    setUpdateItem({
      isOpen: true,
      formData: item,
    });
  };

  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(start + items.length - 1, totalItems);

  return (
    <div className="p-4 bg-light rounded shadow-sm">
      <Row className="mb-3 align-items-center">
        <Col xs="auto">
          <Input
            type="select"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            style={{ width: "120px" }}
          >
            {[5, 10, 25, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </Input>
        </Col>
        <Col className="text-end text-muted">
          Page {currentPage} of {totalPages}
        </Col>
      </Row>

      <Table bordered hover className="bg-white">
        <thead className="table-primary text-center">
          <tr>
            <th>Name</th>
            <th>Unit</th>
            <th>Cost</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {(items || []).map((item) => (
            <tr key={item._id}>
              <td className="text-capitalize fw-semibold text-primary">
                {item.name}
              </td>
              <td>{item.unit || ""}</td>
              <td>{item.cost || ""}</td>
              <td>
                <Button
                  size="sm"
                  color="info"
                  className="me-2"
                  onClick={() => openEditModal(item)}
                >
                  <i className="ri-quill-pen-line"></i>
                </Button>

                <Button
                  size="sm"
                  color="danger"
                  outline
                  onClick={() =>
                    setDeleteItem({ isOpen: true, data: item._id })
                  }
                >
                  <i className="ri-close-circle-line"></i>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <EditItem
        isOpen={updateItem.isOpen}
        toggle={toggleUpdateModal}
        updateItem={updateItem}
      />

      <Row className="mt-4 justify-content-between align-items-center">
        <Col xs="auto">
          <Button
            color="secondary"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            ← Previous
          </Button>
        </Col>
        <Col className="text-center text-muted">
          Showing {start}–{end} of {totalItems}
        </Col>
        <Col xs="auto">
          <Button
            color="secondary"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next →
          </Button>
        </Col>
      </Row>
    </div>
  );
};

InvoiceProcedureList.propTypes = {
  items: PropTypes.array.isRequired,
  totalItems: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  currentPage: PropTypes.number.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
  setDeleteItem: PropTypes.func.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onItemsPerPageChange: PropTypes.func.isRequired,
};

export default InvoiceProcedureList;
