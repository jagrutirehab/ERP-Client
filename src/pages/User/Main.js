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
import { Link, useNavigate } from "react-router-dom";
import Highlighter from "react-highlight-words";
import { useDispatch, useSelector, connect } from "react-redux";
import UserForm from "./Form";
import PasswordForm from "./PasswordForm";
import DeleteModal from "../../Components/Common/DeleteModal";
import RenderWhen from "../../Components/Common/RenderWhen";
import CheckPermission from "../../Components/HOC/CheckPermission";
import smallImage9 from "../../assets/images/small/img-9.jpg";
import { toast } from "react-toastify";
import { getAllUsers } from "../../helpers/backend_helper";
import {
  fetchAllCenters,
  fetchCenters,
  removeUser,
  setUserForm,
  suspendStaff,
} from "../../store/actions";
import {
  setData,
  setdataLoader,
} from "../../store/features/auth/user/userSlice";
import { usePermissions } from "../../Components/Hooks/useRoles";
import { useAuthError } from "../../Components/Hooks/useAuthError";

const UserCenterList = ({ centers }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!centers || !Array.isArray(centers) || centers.length === 0) {
    return <p className="text-muted mb-0">No centers assigned.</p>;
  }

  const visibleCenters = isExpanded ? centers : centers.slice(0, 3);
  const remainingCount = centers.length - 3;

  return (
    <div className="d-flex flex-wrap gap-2 align-items-center">
      {visibleCenters.map((center) => (
        <Badge key={center._id || center.id} color="primary" pill>
          {center?.displayName || center.title}
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

const Main = ({ user, form, centerAccess }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state) => state.User?.microLogin?.token);
  const dataLoader = useSelector((state) => state.User.dataLoader);
  const centers = useSelector((state) => state.Center.allCenters || []);
  const userDataa = useSelector((state) => state.User.data || []);
  const [query, setQuery] = useState("");
  const [userData, setUserData] = useState(null);
  const [passwordModal, setPasswordModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [suspendModal, setSuspendModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 12;

  const {loading: permissionLoader, hasPermission, roles} = usePermissions(token);
  const hasUserPermission = hasPermission("USER", null, "READ");
  const handleAuthError = useAuthError();
  useEffect(() => {
    if (token) {
      dispatch(fetchCenters(user?.centerAccess));
      dispatch(fetchAllCenters());
    }
  }, [dispatch, user, token]);

  useEffect(() => {
    if (!centers || centers.length === 0 || !token) return;
    if (!hasUserPermission) return;
    const handler = setTimeout(() => {
      const fetchUser = async () => {
        try {
          dispatch(setdataLoader(true));
          const response = await getAllUsers({
            page: currentPage,
            limit,
            search: query,
            token,
            centerAccess: JSON.stringify(centerAccess),
          });
          let users = response?.data?.data || [];
          console.log("Fetched users:", users);
          console.log("Available centers:", centers);

          // Map centerAccess IDs to full center objects if centers is available
          if (
            users.length > 0 &&
            Array.isArray(centers) &&
            centers.length > 0
          ) {
            users = users.map((user) => ({
              ...user,
              centerAccess: (user.centerAccess || []).map(
                (centerId) =>
                  centers.find((center) => center._id === centerId) || {
                    _id: centerId,
                    title: "Unknown Center",
                  }
              ),
            }));
          } else {
            // Fallback if centers is not available
            users = users.map((user) => ({
              ...user,
              centerAccess: (user.centerAccess || []).map((centerId) => ({
                _id: centerId,
                title: "Unknown Center",
              })),
            }));
          }

          dispatch(setData(users));
          setTotalPages(response?.data?.totalPages || 1);
          setTotalCount(response?.data?.total);
          setCurrentPage(response?.data?.currentPage || currentPage);
        } catch (error) {
          if (!handleAuthError(error)) {
            console.error("Error fetching users:", error);
            toast.error(error.message || "Failed to fetch users.");
          }
        } finally {
          dispatch(setdataLoader(false));
        }
      };
      fetchUser();
    }, 500);

    return () => clearTimeout(handler);
  }, [query, currentPage, token, centerAccess, centers, roles]);

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

  const deleteUser = async () => {
    try {
      await dispatch(removeUser({ id: userData._id, token })).unwrap();
      setUserData(null);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error.message || "Failed to delete user.");
      }
    } finally {
      toggleDeleteModal();
    }
  };

  const closeDeleteUser = () => {
    setUserData(null);
    toggleDeleteModal();
  };

  const closeSuspendUser = () => {
    setUserData(null);
    toggleSuspendModal();
  };

  const suspendUser = async () => {
    try {
      await dispatch(suspendStaff({ id: userData._id, token })).unwrap();
      setUserData(null);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error.message || "Failed to suspend user.");
      }
    } finally {
      toggleSuspendModal();
    }
  };

  const shortName = (name = "") =>
    name
      .split(" ")
      .map((w) => w.charAt(0))
      .join("")
      .toUpperCase();

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (permissionLoader) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner
          color="primary"
          className="d-block"
          style={{ width: "3rem", height: "3rem" }}
        />
      </div>
    );
  }

  if (!hasUserPermission) {
    navigate("/unauthorized");
    return null;
  }

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
                <RenderWhen isTrue={dataLoader}>
                  <Spinner
                    className="position-absolute end-0 top-50 translate-middle-y me-2"
                    color="success"
                    size="sm"
                  />
                </RenderWhen>
              </div>
            </Col>
            <Col md={8} className="text-sm-end">
              <CheckPermission
                accessRolePermission={roles?.permissions}
                permission="create"
              >
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
        hasUserPermission={hasUserPermission}
      />
      <PasswordForm
        isOpen={passwordModal}
        toggleForm={togglePasswordModal}
        userData={userData}
        setUserData={setUserData}
        token={token}
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
        {(userDataa || []).map((item) => (
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
                        {item.profilePicture ? (
                          <img
                            src={item.profilePicture}
                            alt={item.name}
                            className="img-fluid d-block h-100 w-100 rounded-circle object-fit-cover"
                          />
                        ) : (
                          <div
                            className={`avatar-title rounded-circle h-100 w-100 bg-soft-${
                              item.bgColor || "primary"
                            } text-${item.textColor || "primary"}`}
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
                      <p className="text-muted mb-0">{item.role || "N/A"}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <UncontrolledDropdown direction="start">
                       <CheckPermission accessRolePermission={roles?.permissions} permission="create">
                         <DropdownToggle tag="a" role="button">
                          <i className="ri-more-fill fs-17"></i>
                        </DropdownToggle>
                       </CheckPermission>
                        <DropdownMenu>
                          <CheckPermission
                            accessRolePermission={roles?.permissions}
                            permission="edit"
                          >
                            <DropdownItem onClick={() => openUserForm(item)}>
                              <i className="ri-pencil-line me-2 align-middle" />
                              Edit Details
                            </DropdownItem>
                          </CheckPermission>

                          <CheckPermission
                            accessRolePermission={roles?.permissions}
                            permission="edit"
                            subAccess="USERPASSWORDCHANGE"
                          >
                            <DropdownItem
                              onClick={() => togglePasswordModal(item)}
                            >
                              <i className="ri-lock-password-line me-2 align-middle" />
                              Change Password
                            </DropdownItem>
                          </CheckPermission>
                          <CheckPermission
                            accessRolePermission={roles?.permissions}
                            permission="delete"
                            subAccess="SUSPENDUSER"
                          >
                            <DropdownItem
                              onClick={() => toggleSuspendModal(item)}
                            >
                              <i className="ri-user-unfollow-line me-2 align-middle" />
                              {item.status === "suspended"
                                ? "Restore User"
                                : "Suspend User"}
                            </DropdownItem>
                          </CheckPermission>
                          <CheckPermission
                            accessRolePermission={roles?.permissions}
                            permission="delete"
                          >
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
                    to={`/user/activity/${item._id}`}
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

      {totalPages > 1 && (
        <Row className="mt-4 justify-content-center align-items-center">
          <Col xs="auto" className="d-flex justify-content-center">
            <Button
              color="secondary"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              ← Previous
            </Button>
          </Col>
          <Col xs="auto" className="text-center text-muted mx-3">
            Showing {Math.min((currentPage - 1) * limit + 1, totalCount)}–
            {Math.min(currentPage * limit, totalCount)} of {totalCount}
          </Col>
          <Col xs="auto" className="d-flex justify-content-center">
            <Button
              color="secondary"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next →
            </Button>
          </Col>
        </Row>
      )}
    </>
  );
};

const mapStateToProps = (state) => ({
  user: state.User.user,
  form: state.User.form,
  centerAccess: state.User.centerAccess,
});

Main.propTypes = {
  user: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
  centerAccess: PropTypes.array.isRequired,
};

export default connect(mapStateToProps)(Main);
