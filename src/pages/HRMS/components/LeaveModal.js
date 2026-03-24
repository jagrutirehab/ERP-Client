import { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Label,
  Spinner,
} from "reactstrap";
import Select from "react-select";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_green.css";
import { toast } from "react-toastify";
import {
  getManagerByEmployeeId,
  postLeaveRequest,
} from "../../../helpers/backend_helper";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import { leaveTypeOptions, leaveTypes, shiftTimeOptions } from "../../../Components/constants/HRMS";

const LeaveModal = ({ isOpen, toggle, row, onSuccess, employeeId }) => {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [leaveType, setLeaveType] = useState("EARNED_LEAVE");
  const [shiftTime, setShiftTime] = useState("FULL_DAY");
  const [leaveReason, setLeaveReason] = useState("");
  const [managerId, setManagerId] = useState(null);
  const [managerName, setManagerName] = useState("");
  const [loading, setLoading] = useState(false);
  const handleAuthError = useAuthError();

  const loggedInUser = JSON.parse(localStorage.getItem("authUser"));
  const loggedInId = loggedInUser?.data?._id;

  const fetchManager = async () => {
    const id = employeeId || loggedInId;
    if (!id) return;

    try {
      const res = await getManagerByEmployeeId(id);
      const manager = res?.data?.manager;

      if (!manager) {
        setManagerId(null);
        setManagerName("No Manager Found");
        return;
      }

      setManagerId(manager._id);
      setManagerName(manager.name);
    } catch (error) {
      setManagerId(null);
      setManagerName("No Manager Found");
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchManager();
    }
  }, [isOpen]);

  useEffect(() => {
    if (row) {
      const rowDate = row?.date ? new Date(row.date + "T00:00:00+05:30") : null;
      setFromDate(rowDate);
      setToDate(rowDate);
      setLeaveType("EARNED_LEAVE");
      setShiftTime("FULL_DAY");
      setLeaveReason("");
    }
  }, [row]);

  const isSameDay =
    fromDate &&
    toDate &&
    fromDate.toDateString() === toDate.toDateString();

  const handleSubmit = async () => {
    if (!fromDate || !toDate || !leaveReason) {
      toast.error("All fields are required");
      return;
    }

    if (!managerId) {
      toast.error("No manager found. Cannot submit leave request.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        leaveType,
        approvalAuthority: managerId,
        fromDate: fromDate.toLocaleDateString("en-CA"),
        toDate: toDate.toLocaleDateString("en-CA"),
        shiftTime,
        leaveReason,
      };

      if (employeeId) {
        payload.employeeId = employeeId;
      }

      const res = await postLeaveRequest(payload);
      toast.success(res?.message || "Leave request submitted successfully");
      toggle();
      onSuccess?.();
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.message || "Failed to submit leave request");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size="lg">
      <ModalHeader toggle={toggle}>
        Leave Request For {row?.date}
      </ModalHeader>

      <ModalBody>
        {/* Manager */}
        <div className="mb-3">
          <Label>Approval Manager</Label>
          <Input
            value={managerName || "No Manager Found"}
            disabled
            className={managerName === "No Manager Found" ? "text-danger" : ""}
          />
        </div>

        {/* Date Pickers */}
        <div className="row mb-3">
          <div className="col-md-6">
            <Label>
              From Date <span className="text-danger">*</span>
            </Label>
            <Flatpickr
              className="form-control"
              value={fromDate}
              options={{ dateFormat: "d M, Y" }}
              onChange={([date]) => setFromDate(date)}
            />
          </div>

          <div className="col-md-6">
            <Label>
              To Date <span className="text-danger">*</span>
            </Label>
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

        {/* Leave Type */}
        <div className="mb-3">
          <Label>
            Leave Type <span className="text-danger">*</span>
          </Label>
          <Select
            value={leaveTypeOptions.find((opt) => opt.value === leaveType)}
            onChange={(opt) => setLeaveType(opt.value)}
            options={leaveTypeOptions}
            classNamePrefix="react-select"
          />
        </div>

        {/* Shift Time */}
        <div className="mb-3">
          <Label>
            Shift Time <span className="text-danger">*</span>
          </Label>
          <Select
            value={shiftTimeOptions.find((opt) => opt.value === shiftTime)}
            onChange={(opt) => setShiftTime(opt.value)}
            options={
              !fromDate || !toDate || isSameDay
                ? shiftTimeOptions
                : shiftTimeOptions.filter((opt) => opt.value === "FULL_DAY")
            }
            classNamePrefix="react-select"
          />
        </div>

        {/* Leave Reason */}
        <div>
          <Label>
            Leave Reason <span className="text-danger">*</span>
          </Label>
          <Input
            type="textarea"
            rows="3"
            placeholder="Enter reason for leave"
            value={leaveReason}
            onChange={(e) => setLeaveReason(e.target.value)}
          />
        </div>
      </ModalBody>

      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Cancel
        </Button>
        <Button color="success" onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <>
              <Spinner size="sm" className="me-2" />
              Submitting...
            </>
          ) : (
            "Apply Leave"
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default LeaveModal;
