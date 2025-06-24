import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  CardBody,
  Button,
  Row,
  Col,
  Input,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  Spinner,
} from "reactstrap";
import PropTypes from "prop-types";
import { Link, Route, Routes } from "react-router-dom";
import BreadCrumb from "../../Components/Common/BreadCrumb";

//assets
import smallImage9 from "../../assets/images/small/img-9.jpg";

// action
import {
  fetchAllCenters,
  fetchCenters,
  // fetchUsers,
  removeUser,
  searchUser,
  setUserForm,
  suspendStaff,
} from "../../store/actions";

//redux
import { useDispatch, connect } from "react-redux";
import UserForm from "./Form";
import PasswordForm from "./PasswordForm";
import DeleteModal from "../../Components/Common/DeleteModal";
import Activity from "./Activity";
import RenderWhen from "../../Components/Common/RenderWhen";
import Highlighter from "react-highlight-words";
import CheckPermission from "../../Components/HOC/CheckPermission";

const Main = ({
  users,
  user,
  userActivity,
  centerAccess,
  setUserActivity,
  loading,
  form,
}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // dispatch(fetchUsers());
    dispatch(fetchCenters(user.centerAccess));
    dispatch(fetchAllCenters());
  }, [dispatch, user]);

  document.title = "Users";

  //Modal
  const openModal = (data) => {
    dispatch(setUserForm({ isOpen: !form.isOpen, data }));
  };

  //Password Moda
  const [passwordModal, setPasswordModal] = useState();
  const togglePasswordModal = () => setPasswordModal(!passwordModal);

  //Delete Modal
  const [deleteModal, setDeleteModal] = useState(false);
  const toggleDeleteModal = () => setDeleteModal(!deleteModal);

  //Suspend Modal
  const [suspendModal, setSuspendModal] = useState(false);
  const toggleSuspendModal = () => setSuspendModal(!suspendModal);

  //User
  const [userData, setUserData] = useState();

  //OffCanvas
  const [isOpen, setIsOpen] = useState(false);

  const toggleOffCanvas = () => {
    setIsOpen(!isOpen);
  };

  //Dropdown
  // const [dropdownOpen, setDropdownOpen] = useState(false);

  // const toggledropDown = () => {
  //   setDropdownOpen(!dropdownOpen);
  // };

  const deleteUser = () => {
    dispatch(
      removeUser({ userId: userData._id, pageId: userData.pageAccess._id })
    );
    setUserData(null);
    toggleDeleteModal();
  };

  const closeDeleteUser = () => {
    setUserData(null);
    toggleDeleteModal();
  };

  const closeSuspendUser = () => {
    setUserData(null);
    toggleSuspendModal();
  };

  const suspendUser = () => {
    dispatch(suspendStaff({ userId: userData._id }));
    setUserData(null);
    toggleSuspendModal();
  };

  const shortName = (name) => {
    const words = name.split(" ");
    const initials = words.map((w) => w.charAt(0).toUpperCase());
    const join = initials.join("");
    return join;
  };

  const [query, setQuery] = useState("");

  useEffect(() => {
    setTimeout(() => {
      dispatch(
        searchUser({ query, centerAccess: JSON.stringify(centerAccess) })
      );
    }, 1000);
  }, [dispatch, query, centerAccess]);

  return (
    <React.Fragment>
      <Card>
        <CardBody className="bg-white">
          <Row className="g-2">
            <Col sm={4}>
              <div className="search-box">
                <Input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                  }}
                  className="form-control"
                  placeholder="Search for name"
                />
                <i className="ri-search-line search-icon"></i>
                <RenderWhen isTrue={loading}>
                  <Spinner
                    className="position-absolute"
                    style={{ right: 10, top: 10 }}
                    color="success"
                    size={"sm"}
                  />
                </RenderWhen>
              </div>
            </Col>
            <Col className="col-sm-auto ms-auto">
              <div className="list-grid-nav hstack gap-1">
                <CheckPermission permission={"create"}>
                  <Button color="success" onClick={openModal}>
                    <i className="ri-add-fill me-1 align-bottom"></i> Add User
                  </Button>
                </CheckPermission>
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>

      <UserForm
        isOpen={form.isOpen}
        toggleForm={openModal}
        userData={userData}
        setUserData={setUserData}
      />
      <PasswordForm
        isOpen={passwordModal}
        toggleForm={togglePasswordModal}
        userData={userData}
        setUserData={setUserData}
      />
      <DeleteModal
        show={deleteModal}
        onDeleteClick={deleteUser}
        onCloseClick={closeDeleteUser}
      />

      <DeleteModal
        show={suspendModal}
        onDeleteClick={suspendUser}
        onCloseClick={closeSuspendUser}
        messsage={
          userData?.status === "suspended"
            ? "Are you sure you want to restore this user?"
            : "Are you sure you want to suspend this user?"
        }
        buttonMessage={
          userData?.status === "suspended"
            ? "Yes Restore it!"
            : "Yes Suspend it!"
        }
      />

      <Row className="team-list grid-view-filter">
        {(users || []).map((item, key) => (
          <Col key={key}>
            <Card className={`team-box`}>
              <div className="team-cover">
                <img src={smallImage9} alt="" className="img-fluid" />
              </div>
              <CardBody className="p-4">
                <div className="align-items-center team-row">
                  <Col className="team-settings">
                    <Row>
                      <Col>
                        <div className="bookmark-icon flex-shrink-0 me-2">
                          {/* <Rating
                                  stop={1}
                                  emptySymbol="mdi mdi-star-outline text-muted "
                                  fullSymbol="mdi mdi-star text-warning "
                                /> */}
                        </div>
                      </Col>
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
                          <CheckPermission permission={"edit"}>
                            <DropdownItem
                              onClick={() => {
                                setUserData(item);
                                toggleSuspendModal();
                              }}
                            >
                              <i className="ri-eye-line me-2 align-middle" />
                              {item.status === "suspended"
                                ? "Revoke User Suspension"
                                : "Suspend User"}
                            </DropdownItem>
                          </CheckPermission>
                          <CheckPermission permission={"edit"}>
                            <DropdownItem
                              onClick={() => {
                                setUserData(item);
                                openModal();
                              }}
                            >
                              <i className="ri-eye-line me-2 align-middle" />
                              Edit
                            </DropdownItem>
                          </CheckPermission>
                          <CheckPermission permission={"edit"}>
                            <DropdownItem
                              onClick={() => {
                                setUserData(item);
                                togglePasswordModal();
                              }}
                            >
                              <i className="ri-eye-line me-2 align-middle" />
                              Edit Password
                            </DropdownItem>
                          </CheckPermission>
                          <CheckPermission permission={"delete"}>
                            <DropdownItem
                              onClick={() => {
                                setUserData(item);
                                toggleDeleteModal();
                              }}
                            >
                              <i className="ri-delete-bin-5-line me-2 align-middle" />
                              Delete
                            </DropdownItem>
                          </CheckPermission>
                        </DropdownMenu>
                      </UncontrolledDropdown>
                    </Row>
                  </Col>
                  <Col lg={12} className="col">
                    <div className="team-profile-img">
                      <div className="avatar-lg img-thumbnail position-relative z-10 rounded-circle flex-shrink-0">
                        {item.profilePicture ? (
                          <img
                            src={item.profilePicture.url}
                            alt=""
                            className="img-fluid d-block h-100 w-100 rounded-circle"
                          />
                        ) : (
                          <div
                            className={
                              "avatar-title rounded-circle bg-soft-" +
                              item.bgColor +
                              " text-" +
                              item.textColor
                            }
                          >
                            {shortName(item.name)}
                          </div>
                        )}
                      </div>
                      <div className="team-content">
                        <Link to="#" onClick={toggleOffCanvas}>
                          <h5 className="fs-16 mb-1">
                            <Highlighter
                              // highlightClassName="bg-warning"
                              searchWords={[query]}
                              autoEscape={true}
                              textToHighlight={item.name}
                            />
                            -{" "}
                          </h5>
                          <p>
                            {item.centerAccess
                              ?.map((cn) => cn.title)
                              .join(", ")}
                          </p>
                        </Link>
                        <p className="fs-16 mb-1">
                          <Highlighter
                            // highlightClassName="bg-warning"
                            searchWords={[query]}
                            autoEscape={true}
                            textToHighlight={item.email}
                          />
                        </p>
                        <p className="text-muted mb-0">{item.role}</p>
                      </div>
                    </div>
                  </Col>
                  <Col lg={12} className="col">
                    <Row className="text-muted text-center">
                      <Col xs={12} className="border-end border-end-dashed">
                        <p className="mb-1">Account Status</p>
                        <h5
                          className={`text-muted mb-0 text-uppercase ${
                            item.status === "active"
                              ? "text-success"
                              : "text-danger"
                          }`}
                        >
                          {item.status}
                        </h5>
                      </Col>
                      {/* <Col xs={6} className="border-end border-end-dashed">
                        <h5 className="mb-1">{item.projectCount}</h5>
                        <p className="text-muted mb-0">Projects</p>
                      </Col>
                      <Col xs={6}>
                        <h5 className="mb-1">{item.taskCount}</h5>
                        <p className="text-muted mb-0">Tasks</p>
                      </Col> */}
                    </Row>
                  </Col>
                  <Col lg={12} className="col">
                    <div className="text-end">
                      <Link
                        onClick={() => setUserActivity(item)}
                        to={`/user/${item.name}`}
                        className="btn btn-light view-btn"
                      >
                        View Activity
                      </Link>
                    </div>
                  </Col>
                </div>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>
    </React.Fragment>
  );
};

const mapStateToProps = (state) => ({
  users: state.User.data,
  user: state.User.user,
  form: state.User.form,
  loading: state.User.loading,
  centerAccess: state.User.centerAccess,
});

Main.prototype = {
  users: PropTypes.array,
  user: PropTypes.object,
  setUserActivity: PropTypes.func,
};

export default connect(mapStateToProps)(Main);
