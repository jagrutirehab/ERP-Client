import React, { useEffect, useState } from "react";
import { CardBody } from "reactstrap";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import { getMyTickets } from "../Helpers/FetchIssues";
import { normalizeStatus } from "../Components/normalizeStatus";
import { toast } from "react-toastify";
import DataTableComponent from "../../../Components/Common/DataTable";
import { MyIssuesCol } from "../Columns/MyIssues";
import ImagesModal from "../Components/ImagesModal";
import DescriptionModal from "../Components/DescriptionModal";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import StatusModal from "../Components/StatusModal";
import { changeStatus } from "../../../helpers/backend_helper";

const issueTypes = ["TECH", "PURCHASE", "REVIEW_SUBMISSION"];

const statuses = [
  "assigned",
  "in_progress",
  "on_hold",
  "pending_user",
  "pending_release",
  "resolved",
  // "closed",
];

const MyIssues = () => {
  const token = JSON.parse(localStorage.getItem("user"))?.token;
  const { hasPermission } = usePermissions(token);
  const hasUserPermission = hasPermission("ISSUES", "MY_ISSUES", "READ");

  const isMobile = useMediaQuery("(max-width: 1000px)");

  const [type, setType] = useState("TECH");
  const [status, setStatus] = useState("");
  const [issues, setIssues] = useState([]);

  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [imageModal, setImageModal] = useState(false);
  const [files, setFiles] = useState([]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState(null);
  const [assignModal, setAssignModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);


  const loadIssues = async () => {
    try {
      setLoading(true);

      const params = {
        page,
        limit,
      };

      if (status) {
        params.status = status;
      }

      const response = await getMyTickets(type, params);
      console.log("response", response);
      

      setIssues(response?.data || []);
      setPagination(response?.pagination || null);
    } catch (error) {
      console.log(error);
      toast.error(error?.message || "ERROR");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasUserPermission) {
      loadIssues();
    }
  }, [type, status, page, limit]);

  const handleViewDescription = (desc) => {
    setDescription(desc);
    setModalOpen(true);
  };

  const handleViewImages = (filesData) => {
    setFiles(filesData || []);
    setImageModal(true);
  };

  const handleAction = ({ issue, nextStatus }) => {
    setSelectedIssue({
      ...issue,
      nextStatus,
    });

    setAssignModal(true);
  };

  const handleAssignSubmit = async (data) => {

    const payload = {
      issueId: selectedIssue._id,
      status: selectedIssue.nextStatus,
      note: data.note
    }

    try {
      const response = await changeStatus(payload)
      console.log("RESPONSE", response);
      toast.success(response?.message || "STATUS CHANGED SUCCESSFULLY.")
      setStatus(selectedIssue.nextStatus)
      loadIssues();

    } catch (error) {
      toast.error(error?.message || "ERROR SUBMIITTING DATA.")
    }
  }

  return (
    <>
      <CardBody
        className="p-3 bg-white"
        style={isMobile ? { width: "100%" } : { width: "78%" }}
      >
        <div className="text-center text-md-left mb-4">
          <h1 className="display-6 fw-bold text-primary">MY ISSUES</h1>
        </div>

        {/* Filters */}
        <div className="d-flex gap-3 mb-3 flex-wrap">

          {/* Issue Type */}
          <select
            className="form-select"
            style={{ width: "200px" }}
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {issueTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            className="form-select"
            style={{ width: "200px" }}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Status</option>

            {statuses.map((s) => (
              <option key={s} value={s}>
                {normalizeStatus(s)}
              </option>
            ))}
          </select>

        </div>

        {/* Issues Table */}
        <DataTableComponent
          columns={MyIssuesCol(
            handleViewDescription,
            handleViewImages,
            status,
            handleAction
          )}
          data={issues}
          loading={loading}
          pagination={pagination}
          page={page}
          setPage={setPage}
          limit={limit}
          setLimit={setLimit}
        />
      </CardBody>

      <ImagesModal
        isOpen={imageModal}
        toggle={() => setImageModal(false)}
        files={files}
      />

      <DescriptionModal
        isOpen={modalOpen}
        toggle={() => setModalOpen(false)}
        description={description}
      />

      <StatusModal
        isOpen={assignModal}
        toggle={() => setAssignModal(false)}
        issue={selectedIssue}
        onAssign={handleAssignSubmit}
        activeTab={status}
        title={"Update Issue Status"}
      />
    </>
  );
};

export default MyIssues;