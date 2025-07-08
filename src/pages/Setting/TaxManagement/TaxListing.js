import React, { useState } from "react";
import { Button, Row, Col, Table, Input } from "reactstrap";
import PropTypes from "prop-types";

import { connect } from "react-redux";

const TaxList = ({
    offerCode,
    totalCount,
    setDeleteOffer,
    currentPage,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
}) => {

    console.log(offerCode);
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    return (
        <div className="p-4 bg-light rounded shadow-sm">
            <Row className="mb-3 align-items-center">
                <Col xs="auto">
                    <Input
                        type="select"
                        value={itemsPerPage}
                        className=""
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
                    Page 5 of  10
                </Col>
            </Row>

            <Table bordered hover className="bg-white">
                <thead className="table-primary text-center">
                    <tr>
                        <th>Name</th>
                        <th>Value</th>
                        <th>Tax Type</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>

                    <tr>
                        <td className="text-capitalize fw-semibold text-primary">
                            GST
                        </td>
                        <td>12%</td>
                        <th>Tax </th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <td>Active</td>
                        <td>
                            <Button
                                size="sm"
                                color="info"
                                className="me-2"
                                onClick={() => console.log("object")}
                            >
                                <i className="ri-quill-pen-line"></i>
                            </Button>
                            <Button
                                size="sm"
                                color="danger"
                                outline
                                onClick={() =>
                                    setDeleteOffer({ isOpen: true, data: '' })
                                }
                            >
                                <i className="ri-close-circle-line"></i>
                            </Button>
                        </td>


                    </tr>

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

TaxList.propTypes = {
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

export default connect(mapStateToProps)(TaxList);
