import React, { useEffect, useState } from "react";
import { addPolicies, getPolicies } from "../../../helpers/backend_helper";
import { CardBody } from "reactstrap";
import DataTableComponent from "../components/Table/DataTable";
import { policyColumn } from "../components/Table/Columns/policies";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import CustomModal from "../../../Components/Common/Modal";
import { toast } from "react-toastify";

const Policies = () => {
  const [earnedLeaves, setEarnedLeaves] = useState();
  const [festiveLeaves, setFestiveLeaves] = useState();
  const [weekOffs, setWeekOffs] = useState();
  const [loading, setLoading] = useState(false);
  const [policyData, setPolicyData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [policyName, setPolicyName] = useState(false);

  const isMobile = useMediaQuery("(max-width: 1000px)");

  const fetchPolicies = async () => {
    const res = await getPolicies();
    setPolicyData(res?.data);
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  // console.log("policyData", policyData);
  const handleAdd = async () => {
    try {
      setLoading(true);
      if (!earnedLeaves || !festiveLeaves || !weekOffs) {
        toast.error("All fields are required!");
      }

      const data = {
        earnedLeaves,
        festiveLeaves,
        weekOffs,
        policyName
      };
      const res = await addPolicies(data);
      console.log("res", res);
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
    }
  };

  const tableData = [...policyData].reverse()?.map((p) => ({
    earnedLeaves: p?.earnedLeaves,
    festiveLeaves: p?.festiveLeaves,
    weekOffs: p?.weekOffs,
    unpaidLeaves: p?.unpaidLeaves,
    postedOn: new Date(p.createdAt).toLocaleDateString(),
    status: p?.isSoftDeleted ? "Inactive" : "Active",
    policyName : p?.policyName
  }));

  return (
    <CardBody
      className="p-3 bg-white"
      style={isMobile ? { width: "100%" } : { width: "78%" }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="display-6 fw-bold text-primary">LEAVE POLICIES</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Add Policy
        </button>
      </div>

      {/* Table */}
      <DataTableComponent
        columns={policyColumn()}
        data={tableData}
        loading={false}
        pagination={false}
      />

      {/* Modal */}
      <CustomModal
        isOpen={showModal}
        toggle={() => setShowModal(false)}
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
            className="form-control"
            value={earnedLeaves}
            onChange={(e) => setEarnedLeaves(e.target.value)}
          />
        </div>

        <div className="mb-2">
          <label>Festive Leaves</label>
          <input
            type="number"
            className="form-control"
            value={festiveLeaves}
            onChange={(e) => setFestiveLeaves(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label>Week Offs</label>
          <input
            type="number"
            className="form-control"
            value={weekOffs}
            onChange={(e) => setWeekOffs(e.target.value)}
          />
        </div>

        <div className="d-flex justify-content-end gap-2">
          <button
            className="btn btn-secondary"
            onClick={() => setShowModal(false)}
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
