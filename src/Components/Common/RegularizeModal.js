import React, { useState, useEffect } from "react";
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
import {
  getManagerByEmployeeId,
  getMyManager,
  requestForRegularization,
} from "../../helpers/backend_helper";
import { useAuthError } from "../Hooks/useAuthError";
import { toast } from "react-toastify";

const RegularizeModal = ({ isOpen, toggle, row, onSuccess, employeeId }) => {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [description, setDescription] = useState("");
  const [managerId, setManagerId] = useState();
  const [managerName, setManagerName] = useState();
  const [loading, setLoading] = useState(false);
  const handleAuthError = useAuthError();

  console.log("employeeId", employeeId);

  const loggedInuser = JSON.parse(localStorage.getItem("authUser"));

  const LoggedInId = loggedInuser?.data?._id;

  console.log("LoggedInId", LoggedInId);

  const fetchManager = async () => {
    const id = employeeId || LoggedInId;
    if (!id) return;

    const res = await getManagerByEmployeeId(id);
    console.log("manager", res);

    setManagerId(res?.data?.manager?._id);
    setManagerName(res?.data?.manager?.name);
  };

  useEffect(() => {
    if (isOpen) {
      fetchManager();
    }
  }, [isOpen]);

  useEffect(() => {
    // fetchManager();
    if (row) {
      setCheckIn("");
      setCheckOut("");
      setDescription("");
    }
  }, [row]);

  // console.log("Row", row?._id);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data = {
        manager_id: managerId,
        reqClockInTime: checkIn,
        reqClockOutTime: checkOut,
        description,
      };

      if (employeeId) {
        data.employee_id = employeeId;
      } else if (LoggedInId) {
        data.user_id = LoggedInId;
      }
      if (row?._id) {
        data.log_id = row._id;
      } else {
        data.date = new Date(row?.date + "T00:00:00+05:30").toISOString();
      }

      // console.log(data);

      const res = await requestForRegularization(data);
      // console.log("res", res);
      toggle();

      if (res?.success === true) {
        toast.success(res?.message);
      }
      onSuccess?.();
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error.message || "Failed to fetch data");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size="lg">
      <ModalHeader toggle={toggle}>
        Regularization Request For {row?.date}
      </ModalHeader>

      <ModalBody>
        {/* Manager */}
        <div className="mb-3">
          <Label>Manager</Label>
          <Input value={managerName || "Loading..."} disabled />
        </div>

        {/* Times */}
        <div className="row mb-3">
          <div className="col-md-6">
            <Label>Check In</Label>
            <Input
              type="time"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
            />
          </div>

          <div className="col-md-6">
            <Label>Check Out</Label>
            <Input
              type="time"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <Label>Description</Label>
          <Input
            type="textarea"
            rows="4"
            placeholder="Enter Your Reason"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
              Requesting...
            </>
          ) : (
            "Send Request"
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default RegularizeModal;
