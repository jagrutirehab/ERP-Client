import { useEffect, useState } from "react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_green.css";

import {
  getMyManager,
  getTemporaryManager,
  postCompOffRequest,
  postLeaveRequest,
} from "../../../../helpers/backend_helper";
import ButtonLoader from "../../../../Components/Common/ButtonLoader";
import { toast } from "react-toastify";
import { CardBody } from "reactstrap";
import { useMediaQuery } from "../../../../Components/Hooks/useMediaQuery";
import { usePermissions } from "../../../../Components/Hooks/useRoles";
import { useNavigate } from "react-router-dom";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";

const LeaveApplications = () => {
  const isMobile = useMediaQuery("(max-width: 1000px)");

  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const [leaveType, setLeaveType] = useState("EARNED_LEAVE");
  const [shiftTime, setShiftTime] = useState("FULL_DAY");
  const [approvalAuthority, setApprovalAuthority] = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [managerName, setManagerName] = useState("");
  const [manager, setManager] = useState();
  const [temporary, setTemporary] = useState();
  const handleAuthError = useAuthError();

  const navigate = useNavigate();
  const token = JSON.parse(localStorage.getItem("user"))?.token;

  const { hasPermission, loading: isLoading } = usePermissions(token);
  const hasUserPermission = hasPermission("HR", "APPLY_LEAVE", "READ");

  const hasRead = hasPermission("HR", "APPLY_LEAVE", "READ");
  const hasWrite = hasPermission("HR", "APPLY_LEAVE", "WRITE");
  const hasDelete = hasPermission("HR", "APPLY_LEAVE", "DELETE");
  const isReadOnly = hasRead && !hasWrite && !hasDelete;

  useEffect(() => {
    if (!hasUserPermission) navigate("/unauthorized");

    const getMyManagers = async () => {
      try {
        setPageLoading(true);
        const res = await getMyManager(token);

        setManagerName(res?.data?.manager?.name || "");
        setManager(res?.data?.manager || {})
        setApprovalAuthority(res?.data?.manager?._id || "");
      } catch (error) {
        // console.log(error);
        if (!handleAuthError(error)) {
          toast.error(error.message || "Failed to fetch data");
        }
      } finally {
        setPageLoading(false);
      }
    };

    getMyManagers();
    handleGetTemporaryManager();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();



    if (!fromDate || !toDate || !leaveReason) {
      toast.error("All fields are required");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const payload = {
        leaveType,
        approvalAuthority,
        fromDate: fromDate.toLocaleDateString("en-CA"),
        toDate: toDate.toLocaleDateString("en-CA"),
        shiftTime,
        leaveReason,
      };
      const compOffPayload = {
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
        manager: approvalAuthority,
        reason: leaveReason
      }

      let res;
      if (leaveType === "COMP_OFF_REQUEST") {
        res = await postCompOffRequest(compOffPayload, token);
        console.log("res", res);

      } else {
        res = await postLeaveRequest(payload, token);
      }

      toast.success(res?.message);

      setFromDate(null);
      setToDate(null);
      setLeaveReason("");
    } catch (err) {
      // console.log("err", err);
      toast.error(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGetTemporaryManager = async () => {
    try {
      const response = await getTemporaryManager()
      console.log("Response", response);
      setTemporary(response);

    } catch (error) {
      console.log("Error", error);
    }
  }



  return (
    <CardBody
      className="p-3 bg-white"
      style={isMobile ? { width: "100%" } : { width: "78%" }}
    >
      <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="card shadow-lg p-4 w-100" style={{ maxWidth: "520px" }}>
          <h3 className="text-center mb-4 fw-bold text-primary">Apply Leave</h3>

          {pageLoading ? (
            <ButtonLoader />
          ) : (
            <form onSubmit={handleSubmit}>
              {/* DATE PICKERS */}
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">
                    From Date <span className="text-danger">*</span>
                  </label>
                  <Flatpickr
                    className="form-control"
                    value={fromDate}
                    options={{ dateFormat: "d M, Y" }}
                    onChange={([date]) => setFromDate(date)}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    To Date <span className="text-danger">*</span>
                  </label>
                  <Flatpickr
                    className="form-control"
                    value={toDate}
                    options={{
                      dateFormat: "d M, Y",
                      minDate: fromDate,
                    }}
                    onChange={([date]) => setToDate(date)}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">
                  Leave Type <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  value={leaveType}
                  // onChange={(e) => setLeaveType(e.target.value)}
                  onChange={(e) => {
                    const value = e.target.value;
                    setLeaveType(value);
                  }}
                >
                  <option value="EARNED_LEAVE">Earned Leave</option>
                  <option value="WEEK_OFFS">Week Off</option>
                  <option value="FESTIVE_LEAVE">Festive Leave</option>
                  <option value="LEAVE_WTIHOUT_PAYS">Unpaid Leave</option>
                  <option value="COMP_OFF_REQUEST">Comp-Off Addition Request</option>
                  <option value="COMP_OFF">Comp-Off Apply</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Approval Manager</label>
                <input
                  type="text"
                  className="form-control bg-light"
                  value={managerName}
                  disabled
                />
              </div>
              {manager?._id !== temporary?._id && temporary?._id && (
                <div
                  style={{
                    background: "#fff3cd",
                    color: "#856404",
                    padding: "8px 8px",
                    borderRadius: "6px",
                    border: "1px solid #ffeeba",
                    marginTop: "5px"
                  }}
                >
                  ⚠️ Leave requests will be transferred to <strong>{temporary?.name}</strong>
                </div>
              )}

              <div className="mb-3">
                <label className="form-label mt-4">
                  Shift Time <span className="text-danger">*</span>
                </label>

                <select
                  className="form-select"
                  value={shiftTime}
                  onChange={(e) => setShiftTime(e.target.value)}
                >
                  <option value="FULL_DAY">Full Day</option>

                  {(!fromDate ||
                    !toDate ||
                    fromDate.toDateString() === toDate.toDateString()) && (
                      <>
                        <option value="FIRST_HALF">First Half</option>
                        <option value="SECOND_HALF">Second Half</option>
                      </>
                    )}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">
                  Leave Reason <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Enter reason"
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                />
              </div>

              {!isLoading && (hasWrite || hasDelete) && (
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-100 py-2 fw-semibold d-flex justify-content-center align-items-center"
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Submitting...
                    </>
                  ) : (
                    "Apply Leave"
                  )}
                </button>
              )}

              {message && (
                <div className="alert alert-info text-center mt-3 p-2">
                  {message}
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </CardBody>
  );
};

export default LeaveApplications;
