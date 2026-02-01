import React, { useEffect, useState } from "react";
import { addPolicies, getPolicies } from "../../../helpers/backend_helper";
import { CardBody } from "reactstrap";
import DataTableComponent from "../../../Components/Common/DataTable";
import { policyColumn } from "../components/Table/Columns/policies";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import CustomModal from "../../../Components/Common/Modal";
import { toast } from "react-toastify";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import { useNavigate } from "react-router-dom";

const Policies = () => {
  const [earnedLeaves, setEarnedLeaves] = useState("");
  const [festiveLeaves, setFestiveLeaves] = useState("");
  const [weekOffs, setWeekOffs] = useState("");
  const [loading, setLoading] = useState(false);
  const [policyData, setPolicyData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [policyName, setPolicyName] = useState("");
  const [loadingToFetch, setLoadingToFetch] = useState(false);
  const [regularization_limits, setRegularization_limits] = useState("");

  const navigate = useNavigate();
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { hasPermission, loading: isLoading } = usePermissions(token);
  const hasUserPermission = hasPermission("HR", "POLICIES", "READ");
  const hasRead = hasPermission("HR", "POLICIES", "READ");
  const hasWrite = hasPermission("HR", "POLICIES", "WRITE");
  const hasDelete = hasPermission("HR", "POLICIES", "DELETE");

  // const isReadOnly = hasRead && !hasWrite && !hasDelete;

  // console.log("isReadOnly", isReadOnly);

  const isMobile = useMediaQuery("(max-width: 1000px)");

  const fetchPolicies = async () => {
    try {
      setLoadingToFetch(true);
      const res = await getPolicies();
      setPolicyData(res?.data);
    } catch (error) {
      console.log("error", error);
    }
    setLoadingToFetch(false);
  };

  useEffect(() => {
    if (!hasUserPermission) navigate("/unauthorized");
    fetchPolicies();
  }, []);

  const resetForm = () => {
    setPolicyName("");
    setEarnedLeaves("");
    setFestiveLeaves("");
    setWeekOffs("");
    setRegularization_limits("");
  };

  const handleAdd = async () => {
    try {
      setLoading(true);

      if (
        !policyName ||
        earnedLeaves === "" ||
        festiveLeaves === "" ||
        weekOffs === "" || 
        regularization_limits === ""
      ) {
        return toast.error("All fields are required!");
      }

      if (earnedLeaves < 0 || festiveLeaves < 0 || weekOffs < 0) {
        return toast.error("Leaves cannot be negative");
      }

      const data = {
        earnedLeaves,
        festiveLeaves,
        weekOffs,
        policyName,
        regularization_limits
      };

      const res = await addPolicies(data);

      if (res?.success === true) {
        toast.success(res?.message);
        setShowModal(false);
        fetchPolicies();
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.message);
    } finally {
      setLoading(false);
      resetForm();
    }
  };

  const tableData = [...policyData].reverse()?.map((p) => ({
    earnedLeaves: p?.earnedLeaves,
    festiveLeaves: p?.festiveLeaves,
    weekOffs: p?.weekOffs,
    unpaidLeaves: p?.unpaidLeaves,
    postedOn: new Date(p.createdAt).toLocaleDateString(),
    status: p?.isSoftDeleted ? "Inactive" : "Active",
    policyName: p?.policyName,
    regularization_limits: p?.regularization_limits,
  }));

  return (
    <CardBody
      className="p-3 bg-white"
      style={isMobile ? { width: "100%" } : { width: "78%" }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="display-6 fw-bold text-primary">LEAVE POLICIES</h1>
        {!isLoading && (hasWrite || hasDelete) && (
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            Add Policy
          </button>
        )}
      </div>

      <DataTableComponent
        columns={policyColumn()}
        data={tableData}
        loading={loadingToFetch}
        pagination={false}
      />

      <CustomModal
        isOpen={showModal}
        toggle={() => {
          setShowModal(false);
          resetForm();
        }}
        title="Add Policy"
        centered
        size="md"
      >
        <div className="mb-2">
          <label>Policy Name</label>
          <input
            type="text"
            className="form-control"
            value={policyName}
            onChange={(e) => setPolicyName(e.target.value)}
          />
        </div>

        <div className="mb-2">
          <label>Earned Leaves</label>
          <input
            type="number"
            min="0"
            className="form-control"
            value={earnedLeaves}
            onChange={(e) => {
              const v = e.target.value;
              if (v >= 0) setEarnedLeaves(v);
            }}
          />
        </div>

        <div className="mb-2">
          <label>Festive Leaves</label>
          <input
            type="number"
            min="0"
            className="form-control"
            value={festiveLeaves}
            onChange={(e) => {
              const v = e.target.value;
              if (v >= 0) setFestiveLeaves(v);
            }}
          />
        </div>

        <div className="mb-3">
          <label>Week Offs</label>
          <input
            type="number"
            min="0"
            className="form-control"
            value={weekOffs}
            onChange={(e) => {
              const v = e.target.value;
              if (v >= 0) setWeekOffs(v);
            }}
          />
        </div>

        <div className="mb-3">
          <label>Regularization Limits</label>
          <input
            type="number"
            min="0"
            className="form-control"
            value={regularization_limits}
            onChange={(e) => setRegularization_limits(e.target.value)}
          />
        </div>

        <div className="d-flex justify-content-end gap-2">
          <button
            className="btn btn-secondary"
            onClick={() => {
              setShowModal(false);
              resetForm();
            }}
          >
            Cancel
          </button>
          <button
            className="btn btn-success"
            onClick={handleAdd}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </CustomModal>
    </CardBody>
  );
};

export default Policies;
