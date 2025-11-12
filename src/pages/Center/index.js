import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  CardHeader,
  CardBody,
  Button,
  Row,
  Col,
  Input,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
} from "reactstrap";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import BreadCrumb from "../../Components/Common/BreadCrumb";

//assets
// import avatar2 from "../../assets/images/users/avatar-2.jpg";
// import smallImage9 from "../../assets/images/small/img-9.jpg";
// import img4 from "../../assets/images/small/img-4.jpg";
import Divider from "../../Components/Common/Divider";

//form
import Form from "./Form";

//redux
import { connect, useDispatch, useSelector } from "react-redux";
import {
  changeUserAccess,
  createEditCenter,
  fetchBillItems,
  fetchCenters,
  fetchMedicines,
  fetchPaymentAccounts,
  removeCenter,
} from "../../store/actions";
import DeleteModal from "../../Components/Common/DeleteModal";

const Centers = ({ user, centers, userCenter, isFormOpen }) => {
  const dispatch = useDispatch();
  const centerAccess = useSelector((state) => state.User?.centerAccess);

  //Modal
  // const [formModal, setFormModal] = useState(false);
  // const toggleFormModal = () => setFormModal(!formModal);
  const toggleFormModal = (center) =>
    dispatch(createEditCenter({ data: center, isOpen: true }));

  //Delete Modal
  const [deleteModal, setDeleteModal] = useState(false);
  const toggleDeleteModal = () => setDeleteModal(!deleteModal);

  //User
  const [centerData, setCenterData] = useState();

  useEffect(() => {
    dispatch(fetchCenters(user?.centerAccess));
  }, [dispatch, user]);

  useEffect(() => {
    dispatch(fetchMedicines());
    dispatch(fetchBillItems(userCenter));
    dispatch(fetchPaymentAccounts(userCenter));
  }, [dispatch, userCenter]);

  const deleteCenter = () => {
    dispatch(removeCenter(centerData._id));
    setCenterData(null);
    toggleDeleteModal();
  };

  const closeDeleteCenter = () => {
    setCenterData(null);
    toggleDeleteModal();
  };

  const changeAccess = (centerId) => {
    const checkCenter = centerAccess.includes(centerId);
    let updateAccess = [...centerAccess];
    if (checkCenter) {
      updateAccess = updateAccess.filter((id) => id !== centerId);
    } else {
      updateAccess = [centerId, ...centerAccess];
    }
    dispatch(changeUserAccess(updateAccess));
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Centers" pageTitle="Centers" />
          <Card>
            <CardBody className="bg-white">
              <Row className="g-2">
                <Col sm={4}>
                  <div className="search-box">
                    <Input
                      type="text"
                      className="form-control"
                      placeholder="Search for title, address"
                    />
                    <i className="ri-search-line search-icon"></i>
                  </div>
                </Col>
                <Col className="col-sm-auto ms-auto">
                  <div className="list-grid-nav hstack gap-1">
                    <Button
                      color="success"
                      onClick={() => toggleFormModal(null)}
                    >
                      <i className="ri-add-fill me-1 align-bottom"></i> Add New
                      Center
                    </Button>
                  </div>
                </Col>
              </Row>
            </CardBody>
          </Card>

          <Form />
          <DeleteModal
            show={deleteModal}
            onDeleteClick={deleteCenter}
            onCloseClick={closeDeleteCenter}
          />

          <Row className="team-list grid-view-filter">
            {(centers || []).map((center, key) => {
              const checkCenter = centerAccess.includes(center._id);
              return (
                <Col key={key} xl={4}>
                  <Card className="rounded-3 overflow-hidden">
                    <CardHeader className="bg-white p-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <button
                            onClick={() => changeAccess(center._id)}
                            type="button"
                            className="btn btn-sm p-0 fs-20 me-2"
                          >
                            <i
                              className={
                                checkCenter
                                  ? "ri-record-circle-line text-success"
                                  : " ri-checkbox-blank-circle-line"
                              }
                            ></i>
                          </button>
                          <h6 className="card-title text-nowrap mb-0">
                            {center.title || ""}
                          </h6>
                        </div>
                        <UncontrolledDropdown
                          direction="start"
                          className="col text-end"
                        >
                          <DropdownToggle
                            tag="a"
                            id="dropdownMenuLink2"
                            role="button"
                          >
                            <i className="ri-more-fill fs-17"></i>
                          </DropdownToggle>
                          <DropdownMenu>
                            <DropdownItem
                              onClick={() => {
                                toggleFormModal(center);
                              }}
                            >
                              <i className="ri-eye-line me-2 align-middle" />
                              Edit
                            </DropdownItem>
                            <DropdownItem
                              onClick={() => {
                                setCenterData(center);
                                toggleDeleteModal();
                              }}
                            >
                              <i className="ri-delete-bin-5-line me-2 align-middle" />
                              Delete
                            </DropdownItem>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </div>
                    </CardHeader>
                    {/* <img className="img-fluid" src={img4} alt="Card cap" /> */}
                    <CardBody className="p-4 text-center">
                      {center?.logo && (
                        <div className="mx-auto avatar-md">
                          <img
                            src={center.logo?.url}
                            alt=""
                            className="img-fluid rounded-circle"
                          />
                        </div>
                      )}
                      {/* <h5 className="card-title mb-1">{center.title || ""}</h5> */}
                      <p className="text-muted mb-0">{center.name || ""}</p>
                      <p className="text-muted mb-0">{center.address || ""}</p>
                      <Divider />
                      <p className="mb-0 text-muted">{center.bankName || ""}</p>
                      <p className="mb-0 text-muted">
                        {center.accountHolderName || ""}
                      </p>
                      <p className="mb-0 text-muted">
                        {center.accountNumber || ""}
                      </p>
                      <p className="mb-0 text-muted">
                        {center.branchName || ""}
                      </p>
                      <p className="mb-0 text-muted">{center.numbers || ""}</p>
                      <p className="mb-0 text-muted">
                        {center.numberOfBeds || ""}
                      </p>
                    </CardBody>
                    <div className="card-footer text-center bg-white">
                      <ul className="list-inline mb-0">
                        <li className="list-inline-item">
                          <Link
                            to="#"
                            className="lh-1 align-middle link-secondary"
                          >
                            <i className="ri-facebook-fill"></i>
                          </Link>
                        </li>
                        <li className="list-inline-item">
                          <Link
                            to="#"
                            className="lh-1 align-middle link-success"
                          >
                            <i className="ri-whatsapp-line"></i>
                          </Link>
                        </li>
                        {/* <li className="list-inline-item">
                        <Link to="#" className="lh-1 align-middle link-primary">
                          <i className="ri-linkedin-fill"></i>
                        </Link>
                      </li>
                      <li className="list-inline-item">
                        <Link to="#" className="lh-1 align-middle link-danger">
                          <i className="ri-slack-fill"></i>
                        </Link>
                      </li> */}
                      </ul>
                    </div>
                    <div
                      className={
                        checkCenter
                          ? "progress progress-bar rounded-0 bg-success"
                          : "progress progress-bar rounded-0 bg-danger"
                      }
                    />
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

const mapStateToProps = (state) => ({
  user: state.User.user,
  centers: state.Center.data,
  isFormOpen: state.Center.createEditCenter?.isOpen,
  userCenter: state.User?.centerAccess,
});

Centers.prototype = {
  user: PropTypes.object,
  centers: PropTypes.array,
  isFormOpen: PropTypes.bool,
};

export default connect(mapStateToProps)(Centers);
