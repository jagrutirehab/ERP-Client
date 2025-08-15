import { useState, useEffect } from "react";
import {
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
  Badge,
} from "reactstrap";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import Highlighter from "react-highlight-words";
import {
  fetchAllCenters,
  fetchCenters,
  removeUser,
  searchUser,
  setUserForm,
  suspendStaff,
} from "../../store/actions";
import { useDispatch, connect } from "react-redux";
import UserForm from "./Form";
import PasswordForm from "./PasswordForm";
import DeleteModal from "../../Components/Common/DeleteModal";
import RenderWhen from "../../Components/Common/RenderWhen";
import CheckPermission from "../../Components/HOC/CheckPermission";
import smallImage9 from "../../assets/images/small/img-9.jpg";

const UserCenterList = ({ centers }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!centers || centers.length === 0) {
    return <p className="text-muted mb-0">No centers assigned.</p>;
  }

  const visibleCenters = isExpanded ? centers : centers.slice(0, 3);
  const remainingCount = centers.length - 3;

  return (
    <div className="d-flex flex-wrap gap-2 align-items-center">
      {visibleCenters.map((center) => (
        <Badge key={center._id} color="primary" pill>
          {center.title}
        </Badge>
      ))}
      {remainingCount > 0 && (
        <button
          type="button"
          className="btn btn-link btn-sm p-0"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Show Less" : `+ ${remainingCount} more`}
        </button>
      )}
    </div>
  );
};

UserCenterList.propTypes = {
  centers: PropTypes.array.isRequired,
};

const Main = ({ users, user, form, loading, centerAccess }) => {
  const dispatch = useDispatch();
  const [query, setQuery] = useState("");
  const [userData, setUserData] = useState();
  const [passwordModal, setPasswordModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [suspendModal, setSuspendModal] = useState(false);

  useEffect(() => {
    dispatch(fetchCenters(user?.centerAccess));
    dispatch(fetchAllCenters());
  }, [dispatch, user]);

  useEffect(() => {
    const handler = setTimeout(() => {
      dispatch(
        searchUser({ query, centerAccess: JSON.stringify(centerAccess) })
      );
    }, 500);

    return () => clearTimeout(handler);
  }, [dispatch, query, centerAccess]);

  document.title = "Users | Your App Name";

  const openUserForm = (data = null) => {
    setUserData(data);
    dispatch(setUserForm({ isOpen: !form.isOpen, data }));
  };

  const togglePasswordModal = (data = null) => {
    setUserData(data);
    setPasswordModal((prev) => !prev);
  };

  const toggleDeleteModal = (data = null) => {
    setUserData(data);
    setDeleteModal((prev) => !prev);
  };

  const toggleSuspendModal = (data = null) => {
    setUserData(data);
    setSuspendModal((prev) => !prev);
  };

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

  const shortName = (name = "") =>
    name
      .split(" ")
      .map((w) => w.charAt(0))
      .join("")
      .toUpperCase();

  return (
    <>
      <Card>
        <CardBody>
          <Row className="g-3 align-items-center">
            <Col md={4}>
              <div className="search-box position-relative">
                <Input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="form-control"
                  placeholder="Search by name or email..."
                />
                <i className="ri-search-line search-icon" />
                <RenderWhen isTrue={loading}>
                  <Spinner
                    className="position-absolute end-0 top-50 translate-middle-y me-2"
                    color="success"
                    size="sm"
                  />
                </RenderWhen>
              </div>
            </Col>
            <Col md={8} className="text-sm-end">
              <CheckPermission permission="create">
                <Button color="success" onClick={() => openUserForm()}>
                  <i className="ri-add-fill me-1 align-bottom" />
                  Add User
                </Button>
              </CheckPermission>
            </Col>
          </Row>
        </CardBody>
      </Card>

      <UserForm
        isOpen={form.isOpen}
        toggleForm={() => openUserForm(null)}
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
        messsage={`Are you sure you want to ${
          userData?.status === "suspended" ? "restore" : "suspend"
        } this user?`}
        buttonMessage={`Yes, ${
          userData?.status === "suspended" ? "Restore" : "Suspend"
        } It!`}
      />

      <Row className="g-4">
        {(users || []).map((item) => (
          <Col xxl={3} lg={4} md={6} key={item._id}>
            <Card className="team-box h-100">
              <div className="team-cover">
                <img src={smallImage9} alt="" className="img-fluid" />
              </div>
              <CardBody className="p-4 d-flex flex-column">
                <div className="flex-grow-1">
                  <div className="d-flex align-items-start mb-4">
                    <div className="flex-shrink-0">
                      <div className="avatar-lg img-thumbnail rounded-circle">
                        {item.profilePicture?.url ? (
                          <img
                            src={item.profilePicture.url}
                            alt=""
                            className="img-fluid d-block h-100 w-100 rounded-circle object-fit-cover"
                          />
                        ) : (
                          <div
                            className={`avatar-title rounded-circle h-100 w-100 bg-soft-${item.bgColor} text-${item.textColor}`}
                          >
                            <span className="fs-22">
                              {shortName(item.name)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h5 className="fs-16 mb-1">
                        <Highlighter
                          searchWords={[query]}
                          autoEscape
                          textToHighlight={item.name || ""}
                        />
                      </h5>
                      <p className="text-muted mb-0">{item.role}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <UncontrolledDropdown direction="start">
                        <DropdownToggle tag="a" role="button">
                          <i className="ri-more-fill fs-17"></i>
                        </DropdownToggle>
                        <DropdownMenu>
                          <CheckPermission permission="edit">
                            <DropdownItem onClick={() => openUserForm(item)}>
                              <i className="ri-pencil-line me-2 align-middle" />
                              Edit Details
                            </DropdownItem>
                            <DropdownItem
                              onClick={() => togglePasswordModal(item)}
                            >
                              <i className="ri-lock-password-line me-2 align-middle" />
                              Change Password
                            </DropdownItem>
                            <DropdownItem
                              onClick={() => toggleSuspendModal(item)}
                            >
                              <i className="ri-user-unfollow-line me-2 align-middle" />
                              {item.status === "suspended"
                                ? "Restore User"
                                : "Suspend User"}
                            </DropdownItem>
                          </CheckPermission>
                          <CheckPermission permission="delete">
                            <DropdownItem
                              className="text-danger"
                              onClick={() => toggleDeleteModal(item)}
                            >
                              <i className="ri-delete-bin-5-line me-2 align-middle" />
                              Delete User
                            </DropdownItem>
                          </CheckPermission>
                        </DropdownMenu>
                      </UncontrolledDropdown>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-muted mb-1">Email Address</p>
                    <h6 className="mb-0">
                      <Highlighter
                        searchWords={[query]}
                        autoEscape
                        textToHighlight={item.email || "-"}
                      />
                    </h6>
                  </div>
                  {item.phoneNumber && (
                    <div className="mb-4">
                      <p className="text-muted mb-1">Contact Number</p>
                      <h6 className="mb-0">
                        <Highlighter
                          searchWords={[query]}
                          autoEscape
                          textToHighlight={item.phoneNumber || "-"}
                        />
                      </h6>
                    </div>
                  )}
                  <div className="mb-4">
                    <p className="text-muted mb-1">Assigned Centers</p>
                    <UserCenterList centers={item.centerAccess || []} />
                  </div>
                </div>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <p className="text-muted mb-1">Account Status</p>
                    <Badge
                      color={item.status === "active" ? "success" : "danger"}
                      className="text-uppercase"
                    >
                      {item.status || "N/A"}
                    </Badge>
                  </div>
                  <Link
                    to={`/user-activity/${item._id}`}
                    className="btn btn-soft-primary view-btn"
                  >
                    View Activity
                  </Link>
                </div>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
};

const mapStateToProps = (state) => ({
  users: state.User.data,
  user: state.User.user,
  form: state.User.form,
  loading: state.User.loading,
  centerAccess: state.User.centerAccess,
});

Main.propTypes = {
  users: PropTypes.array.isRequired,
  user: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  centerAccess: PropTypes.array.isRequired,
};

export default connect(mapStateToProps)(Main);
