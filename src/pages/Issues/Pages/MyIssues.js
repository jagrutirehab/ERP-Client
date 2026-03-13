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
import ApprovalModal from "../Components/ApprovalModal";
import Select from "react-select";
import { useSelector } from "react-redux";

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
  const hasWritePermission = hasPermission("ISSUES", "MY_ISSUES", "WRITE");
  const hasDeletePermission = hasPermission("ISSUES", "MY_ISSUES", "DELETE");

  const canChangeStatus = hasWritePermission || hasDeletePermission;

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
  const [selectedCenter, setSelectedCenter] = useState("ALL");


  const user = useSelector((state) => state.User);

  const loadIssues = async () => {
    try {
      setLoading(true);

      let centers = [];

      if (selectedCenter === "") {
        centers = [];
      }
      else if (selectedCenter === "ALL") {
        centers = user?.centerAccess || [];
      }
      else {
        centers = [selectedCenter];
      }

      const params = {
        page,
        limit,
        centers
      };

      if (status) {
        params.status = status;
      }

      const response = await getMyTickets(type, params);


      setIssues(response?.data || []);
      setPagination({
        ...response?.pagination,
        totalDocs: response?.pagination?.totalRecords,
      });
    } catch (error) {
      console.log(error);
      toast.error(error?.message || "ERROR");
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    if (hasUserPermission) {
      if (!user?.centerAccess) return;
      loadIssues();
    }
  }, [type, status, page, limit, selectedCenter, user?.centerAccess]);


  const centerOptions = [
    ...(user?.centerAccess?.length > 1
      ? [
        {
          value: "ALL",
          label: "All Centers",
        },
      ]
      : []),
    ...(user?.centerAccess?.map((id) => {
      const center = user?.userCenters?.find((c) => c._id === id);
      return {
        value: id,
        label: center?.title || "Unknown Center",
      };
    }) || []),
  ];

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
      issueId: data.issueId,
      status: data.status,
      note: data.note
    }
    try {
      const response = await changeStatus(payload)
      toast.success(response?.message || "STATUS CHANGED SUCCESSFULLY.")
      setStatus(data?.status)
      loadIssues();

    } catch (error) {
      toast.error(error?.message || "ERROR SUBMIITTING DATA.")
    }
  }

  const issueTypeOptions = issueTypes.map((t) => ({
    value: t,
    label: t,
  }));

  const statusOptions = statuses.map((s) => ({
    value: s,
    label: normalizeStatus(s),
  }));


  return (
    <>
      <CardBody
        className="p-3 bg-white"
        style={isMobile ? { width: "100%" } : { width: "78%" }}
      >
        <div className="text-center text-md-left mb-4">
          <h1 className="display-6 fw-bold text-primary">MY TICKETS</h1>
        </div>

        {/* Filters */}
        <div className="d-flex gap-3 mb-3 flex-wrap">


          <Select
            options={centerOptions || []}
            value={centerOptions?.find((c) => c.value === selectedCenter) || null}
            onChange={(selected) => setSelectedCenter(selected?.value || "")}
            isDisabled={!centerOptions?.length}
            placeholder={centerOptions?.length ? "Select Center" : "No Center Selected"}
            styles={{ container: (base) => ({ ...base, width: 200 }) }}
          />

          {/* Issue Type */}
          <Select
            options={issueTypeOptions}
            value={issueTypeOptions.find((o) => o.value === type)}
            onChange={(selected) => setType(selected.value)}
            styles={{ container: (base) => ({ ...base, width: 200 }) }}
          />

          {/* Status */}
          <Select
            options={[
              { value: "", label: "All Status" },
              ...statusOptions,
            ]}
            value={
              status
                ? statusOptions.find((o) => o.value === status)
                : { value: "", label: "All Status" }
            }
            onChange={(selected) => setStatus(selected.value)}
            styles={{ container: (base) => ({ ...base, width: 200 }) }}
          />

        </div>

        {/* Issues Table */}
        <DataTableComponent
          columns={MyIssuesCol(
            handleViewDescription,
            handleViewImages,
            status,
            handleAction,
            type,
            canChangeStatus
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
        title={`Update Issue Status`}
      />


    </>
  );
};

export default MyIssues;