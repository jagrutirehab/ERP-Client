import React from "react";
import { Button, Row, Col, Table, Input } from "reactstrap";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import CheckPermission from "../../../../../Components/HOC/CheckPermission";
import { usePermissions } from "../../../../../Components/Hooks/useRoles";

const PaymentAccountsList = ({
  items,
  totalItems,
  totalPages,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  setDeleteItem,
}) => {
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(start + items?.length - 1, totalItems);

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const { roles } = usePermissions(token);

  return (
    <div className="p-4 bg-light rounded shadow-sm">
      {/* Top controls */}
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

      {/* Table */}
      <Table bordered hover className="bg-white">
        <thead className="table-primary text-center">
          <tr>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {(items || []).map((item) => (
            <tr key={item._id}>
              <td className="text-capitalize fw-semibold text-primary">
                {item.name}
              </td>
              <td className="text-center">
                <CheckPermission
                  accessRolePermission={roles?.permissions}
                  permission={"delete"}
                  subAccess={"ADVANCEPAYMENTSETTING"}>
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
                </CheckPermission>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination controls */}
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

PaymentAccountsList.propTypes = {
  items: PropTypes.array.isRequired,
  totalItems: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  currentPage: PropTypes.number.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
  setDeleteItem: PropTypes.func.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onItemsPerPageChange: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  items: state.Setting.paymentAccounts,
});

export default connect(mapStateToProps)(PaymentAccountsList);
