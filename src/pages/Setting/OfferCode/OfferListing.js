import React, { useState } from "react";
import { Button, Row, Col, Table, Input } from "reactstrap";
import PropTypes, { oneOf } from "prop-types";
import { format } from 'date-fns';
import { connect } from "react-redux";

const OfferList = ({
    offerCode,
    totalCount,
    setEditOffer,
    setDeleteOffer,
    currentPage,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
}) => {
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
                    Page {currentPage} of {totalPages}
                </Col>
            </Row>

            <Table bordered hover className="bg-white">
                <thead className="table-primary text-center">
                    <tr>
                        <th>Code</th>
                        <th>Type</th>
                        <th>Value</th>
                        <th>Use/User</th>
                        <th>Total Applicable</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Status</th>
                        <th>Visible To All</th>
                        <th>Offer Remains</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {offerCode && Array.isArray(offerCode) && offerCode?.map((obj) => {
                        return (
                            <tr key={obj?._id}>
                                <td className="text-capitalize fw-semibold text-primary">
                                    {obj?.code}
                                </td>
                                <td>{obj?.discountType}</td>
                                 <td>{`${obj?.discountValue}${obj?.discountType === 'FIXED'?'₹':'%'}`}</td>
                                <td>{obj?.usageLimitPerUser}</td>
                                <td>{obj?.usageLimitGlobal}</td>
                                <td>{format(new Date(obj?.startDate), 'dd MMM, yyyy')}</td>
                                <td>{format(new Date(obj?.endDate), 'dd MMM, yyyy')}</td>
                                <td>{obj?.status ? 'Active' : 'Inactive'}</td>
                                <td>{obj?.visibleToAll ? 'Yes' : 'No'}</td>
                                <td>{Number(obj?.usageLimitGlobal) - Number(obj?.totalUsed)}</td>
                                <td>
                                    <Button
                                        size="sm"
                                        color="info"
                                        className="me-2"
                                        onClick={() => setEditOffer({ isOpen: true, data: obj })}
                                    >
                                        <i className="ri-quill-pen-line"></i>
                                    </Button>
                                    <Button
                                        size="sm"
                                        color="danger"
                                        outline
                                        onClick={() =>
                                            setDeleteOffer({ isOpen: true, data: obj })
                                        }
                                    >
                                        <i className="ri-close-circle-line"></i>
                                    </Button>
                                </td>
                            </tr>
                        )
                    })}
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

OfferList.propTypes = {
    totalCount: PropTypes.number.isRequired,
    setDeleteOffer: PropTypes.func.isRequired,
    setEditOffer: PropTypes.func.isRequired,
    currentPage: PropTypes.number.isRequired,
    itemsPerPage: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    onItemsPerPageChange: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
    data: state.Offers.data,
    totalCount: state.Offers.totalCount,
});

export default connect(mapStateToProps)(OfferList);
