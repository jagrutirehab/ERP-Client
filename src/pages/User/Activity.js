import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Row, Col, Table, Input, Spinner } from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import { getUserActivityById } from "../../helpers/backend_helper";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { usePermissions } from "../../Components/Hooks/useRoles";
import { useAuthError } from "../../Components/Hooks/useAuthError";

const Activity = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const [loading, setLoading] = useState(false);
  const [activityData, setActivityData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const {
    loading: permissionLoader,
    hasPermission,
  } = usePermissions(token);
  const hasUserPermission = hasPermission("USER", null, "READ");
  const handleAuthError = useAuthError();
  useEffect(() => {
    if (!token || !hasUserPermission) return;
    const fetchUserActivity = async () => {
      try {
        setLoading(true);
        const response = await getUserActivityById({
          id,
          page: currentPage,
          limit: itemsPerPage,
          token,
        });
        setActivityData(response?.data?.data);
        setTotalPages(response?.data?.totalPages || 1);
        setTotalCount(response?.data?.total);
        setCurrentPage(response?.data?.page);
      } catch (error) {
       if(!handleAuthError(error)){
          toast.error("Failed to fetch user activity.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUserActivity();
  }, [currentPage, token, id, navigate, itemsPerPage, hasUserPermission]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
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
    <React.Fragment>
      <div className="p-4 bg-light rounded shadow-sm">
        <Row className="mb-3 align-items-center">
          <Col xs="auto">
            <Input
              type="select"
              value={itemsPerPage}
              className=""
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              style={{ width: "120px" }}
            >
              {[10, 20, 30, 50].map((size) => (
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
              <th>Time</th>
              <th>Action</th>
              <th>Actor</th>
              <th>Target</th>
              <th>Target Email</th>
              <th>Target Role</th>
              <th>Model</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="10" className="text-center py-4">
                  <div
                    className="spinner-border spinner-border-sm text-primary"
                    role="status"
                    style={{ width: "1rem", height: "1rem" }}
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : activityData &&
              Array.isArray(activityData) &&
              activityData.length > 0 ? (
              activityData.map((obj) => (
                <tr key={obj._id}>
                  <td className="fw-semibold text-primary text-center">
                    {format(new Date(obj?.updatedAt), "dd MMM, yyyy hh:mm a")}
                  </td>
                  <td className="text-capitalize text-center">
                    {obj?.task || "-"}
                  </td>
                  <td className="text-center">{obj?.userid?.name || "-"}</td>
                  <td className="text-center">{obj?.targetId?.name || "-"}</td>
                  <td className="text-center">{obj?.targetId?.email || "-"}</td>
                  <td className="text-capitalize text-center">
                    {obj?.targetId?.role || "-"}
                  </td>
                  <td className="text-center">{obj?.targetModel || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center text-muted py-4">
                  No activity found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
        {totalPages > 0 && (
          <Row className="mt-4 justify-content-between align-items-center">
            <Col xs="auto">
              <Button
                color="secondary"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                ← Previous
              </Button>
            </Col>
            <Col className="text-center text-muted">
              Showing{" "}
              {Math.min((currentPage - 1) * itemsPerPage + 1, totalCount)}–
              {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}
            </Col>
            <Col xs="auto">
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
      </div>
    </React.Fragment>
  );
};

export default Activity;
