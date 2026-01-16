import { useEffect, useState } from "react";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
import {
  getMyManager,
  postLeaveRequest,
} from "../../../../helpers/backend_helper";
import ButtonLoader from "../../../../Components/Common/ButtonLoader";
import { toast } from "react-toastify";
import { CardBody } from "reactstrap";
import { useMediaQuery } from "../../../../Components/Hooks/useMediaQuery";
// import {useNavigate} from "react-router-dom";

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
  // const [isLoading, seIsloading] = useState(false);
  // const navigate = useNavigate();

  const token = JSON.parse(localStorage.getItem("user"))?.token;


  useEffect(() => {
    const getMyManagers = async () => {
      try {
        setPageLoading(true);
        const res = await getMyManager(token);

        setManagerName(res?.data?.manager?.name || "");
        setApprovalAuthority(res?.data?.manager?._id || "");
      } catch (error) {
        console.log(error);
      } finally {
        setPageLoading(false);
      }
    };

    getMyManagers();
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
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString(),
        shiftTime,
        leaveReason,
      };

      const res = await postLeaveRequest(payload, token);
      console.log("res", res);
      toast.success(res?.message);
      setFromDate(null);
      setToDate(null);
      setLeaveReason("");
      // navigate('/hrms/leaves/my/leaves')
    } catch (err) {
      console.log("err", err);
      toast.error(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

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
              <div className="mb-3">
                <label className="form-label">
                  Leave Type <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                >
                  <option value="EARNED_LEAVE">Earned Leave</option>
                  <option value="WEEK_OFFS">Week Off</option>
                  <option value="FESTIVE_LEAVE">Festive Leave</option>
                  <option value="LEAVE_WTIHOUT_PAYS">Unpaid Leave</option>
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

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    From Date <span className="text-danger">*</span>
                  </label>
                  {/* <DatePicker
                    selected={fromDate}
                    onChange={(date) => setFromDate(date)}
                    className="form-control"
                    placeholderText="Select date"
                  /> */}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    To Date <span className="text-danger">*</span>
                  </label>
                  {/* <DatePicker
                    selected={toDate}
                    onChange={(date) => setToDate(date)}
                    minDate={fromDate}
                    className="form-control"
                    placeholderText="Select date"
                  /> */}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">
                  Shift Time <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  value={shiftTime}
                  onChange={(e) => setShiftTime(e.target.value)}
                >
                  <option value="FULL_DAY">Full Day</option>
                  <option value="FIRST_HALF">First Half</option>
                  <option value="SECOND_HALF">Second Half</option>
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
