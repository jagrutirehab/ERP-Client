import React, { useState } from "react";
import { Button, Row, Col, Table, Input } from "reactstrap";
import PropTypes from "prop-types";
import EditMedicine from "./EditMedicine";
import { connect } from "react-redux";

const MedicinesList = ({
  medicines,
  totalCount,
  setDeleteMedicine,
  toggleDeleteModal,
  searchItem,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}) => {
  const [updateMedicine, setUpdateMedicine] = useState({
    isForm: false,
    formIndex: undefined,
    formData: undefined,
  });

  const toggleUpdateForm = (idx, data) =>
    setUpdateMedicine({
      isForm: true,
      formIndex: idx,
      formData: data,
    });

  const totalPages = Math.ceil(totalCount / itemsPerPage);

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
            <th>Type</th>
            <th>Strength</th>
            <th>Unit</th>
            <th>Expiry</th>
            <th>Instruction</th>
            <th>Composition</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {(medicines || [])
            .filter((item) =>
              item.name.toLowerCase().includes(searchItem.toLowerCase())
            )
            .map((item, idx) => (
              <tr key={item._id}>
                {updateMedicine.isForm && updateMedicine.formIndex === idx ? (
                  <td colSpan="10">
                    <EditMedicine
                      updateMedicine={updateMedicine}
                      setUpdateMedicine={setUpdateMedicine}
                    />
                  </td>
                ) : (
                  <>
                    <td className="text-capitalize fw-semibold text-primary">
                      {item.name}
                    </td>
                    <td>{item.type || ""}</td>
                    <td>{item.strength || ""}</td>
                    <td>{item.unit || ""}</td>
                    <td>{item.expiry || ""}</td>
                    <td>{item.instruction || ""}</td>
                    <td>{item.composition || ""}</td>
                    <td>{item.quantity || ""}</td>
                    <td>{item.unitPrice || ""}</td>
                    <td>
                      <Button
                        size="sm"
                        color="info"
                        className="me-2"
                        onClick={() => toggleUpdateForm(idx, item)}
                      >
                        <i className="ri-quill-pen-line"></i>
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        outline
                        onClick={() =>
                          setDeleteMedicine({ isOpen: true, data: item._id })
                        }
                      >
                        <i className="ri-close-circle-line"></i>
                      </Button>
                    </td>
                  </>
                )}
              </tr>
            ))}
        </tbody>
      </Table>

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
          Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalCount)}–
          {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}
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

MedicinesList.propTypes = {
  medicines: PropTypes.array.isRequired,
  totalCount: PropTypes.number.isRequired,
  setDeleteMedicine: PropTypes.func.isRequired,
  toggleDeleteModal: PropTypes.func,
  searchItem: PropTypes.string,
  currentPage: PropTypes.number.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onItemsPerPageChange: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  medicines: state.Medicine.data,
  totalCount: state.Medicine.totalCount,
});

export default connect(mapStateToProps)(MedicinesList);
