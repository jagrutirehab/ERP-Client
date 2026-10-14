import React, { useEffect, useState } from "react";
import { CardBody, Input } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getAllEmployeeDocuments,
  reviewEmployeeDocumentFile,
} from "../../../helpers/backend_helper";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import DataTableComponent from "../../../Components/Common/DataTable";
import PreviewFile from "../../../Components/Common/PreviewFile";
import { downloadFile } from "../../../Components/Common/downloadFile";
import { getFilePreviewMeta } from "../../../utils/isPreviewable";
import { FILE_PREVIEW_CUTOFF } from "../../../Components/constants/HR";
import { EmployeeDocumentsColumn } from "../components/columns/employeeDocuments";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import { useSelector } from "react-redux";
import useCenterOptions from "../../../Components/Hooks/useCenterOptions";
import Select from "react-select";
import ReviewDocumentModal from "../components/ReviewDocumentModal.js";
import { Nav, NavItem, NavLink } from "reactstrap";
import classnames from "classnames";

const EmployeeDocuments = () => {
  const navigate = useNavigate();
  const handleAuthError = useAuthError();
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { hasPermission } = usePermissions(token);
  const hasUserPermission = hasPermission("HR", "EMPLOYEE_DOCUMENTS", "READ");
  const hasWrite = hasPermission("HR", "EMPLOYEE_DOCUMENTS", "WRITE");
  const hasPermissionToEdit = hasUserPermission && hasWrite;
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const [statusTab, setStatusTab] = useState("uploaded");

  const user = useSelector((state) => state.User);
  const centerOptions = useCenterOptions();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCenter, setSelectedCenter] = useState("ALL");

  const [previewFile, setPreviewFile] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("Attachment Preview");

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (
      selectedCenter !== "ALL" &&
      !user?.centerAccess?.includes(selectedCenter)
    ) {
      setSelectedCenter("ALL");
    }
  }, [selectedCenter, user?.centerAccess]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      let centers = [];
      if (selectedCenter === "") {
        centers = [];
      } else if (selectedCenter === "ALL") {
        centers = user?.centerAccess || [];
      } else {
        centers = [selectedCenter];
      }

      const res = await getAllEmployeeDocuments({
        page,
        limit,
        centers,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(statusTab !== "all" && { status: statusTab }),
      });

      setData(res?.data || []);

      setPagination({
        ...res?.pagination,
        totalDocs: res?.pagination?.totalRecords,
      });
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.message || "Failed to fetch employee documents");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasUserPermission) {
      navigate("/unauthorized");
      return;
    }
    fetchDocuments();
  }, [
    page,
    limit,
    debouncedSearch,
    selectedCenter,
    statusTab,
    user?.centerAccess,
  ]);

  useEffect(() => {
    setPage(1);
  }, [statusTab]);

  const handleFilePreview = (file, title) => {
    if (!file?.fileUrl) return;

    const meta = getFilePreviewMeta(
      { url: file.fileUrl },
      file.uploadedAt,
      FILE_PREVIEW_CUTOFF,
    );

    if (meta.action === "preview") {
      setPreviewFile({ url: file.fileUrl, originalName: file.fileName });
      setPreviewTitle(title || "Attachment Preview");
      setPreviewOpen(true);
    } else {
      downloadFile({ url: file.fileUrl, originalName: file.fileName });
    }
  };

  const openReviewModal = (fileId, docId, fileName, actionType) => {
    setReviewTarget({ fileId, docId, fileName, actionType });
    setReviewModalOpen(true);
  };

  const handleReviewConfirm = async (remarks) => {
    if (!reviewTarget) return;
    const { fileId, docId, actionType } = reviewTarget;

    setReviewLoading(true);
    try {
      const res = await reviewEmployeeDocumentFile(docId, fileId, {
        status: actionType,
        remarks,
      });
      toast.success(
        res?.data?.message ||
          `Document ${actionType === "verified" ? "approved" : "rejected"} successfully`,
      );
      setReviewModalOpen(false);
      setReviewTarget(null);
      fetchDocuments();
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Failed to review document",
        );
      }
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <CardBody
      className="p-3 bg-white"
      style={isMobile ? { width: "100%" } : { width: "78%" }}
    >
      <div className="text-center text-md-left mb-4">
        <h1 className="display-6 fw-bold text-primary">EMPLOYEE DOCUMENTS</h1>
      </div>
      <Nav tabs className="mb-3">
        {[
          // { key: "all", label: "All" },
          { key: "uploaded", label: "Pending Verification" },
          { key: "verified", label: "Verified" },
          { key: "rejected", label: "Rejected" },
        ].map((tab) => (
          <NavItem key={tab.key}>
            <NavLink
              className={classnames({ active: statusTab === tab.key })}
              onClick={() => setStatusTab(tab.key)}
              style={{ cursor: "pointer", fontWeight: 500 }}
            >
              {tab.label}
            </NavLink>
          </NavItem>
        ))}
      </Nav>

      <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-3">
        <div className="d-flex flex-wrap align-items-end gap-2">
          <div style={{ minWidth: 220 }}>
            <Input
              type="text"
              placeholder="Search by ECode, name or document..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ minWidth: 180 }}>
            <Select
              options={centerOptions}
              value={
                centerOptions.find((c) => c.value === selectedCenter) || null
              }
              onChange={(selected) =>
                setSelectedCenter(selected ? selected.value : "")
              }
              placeholder="Select Center"
              isDisabled={!centerOptions.length}
            />
          </div>
        </div>

        <div className="text-nowrap">
          <span className="fw-semibold text-muted">
            Total Records: {pagination?.totalRecords}
          </span>
        </div>
      </div>

      <DataTableComponent
        columns={EmployeeDocumentsColumn(
          openReviewModal,
          handleFilePreview,
          hasWrite,
          statusTab,
          hasPermissionToEdit,
        )}
        data={data}
        loading={loading}
        pagination={pagination}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
      />

      <PreviewFile
        title={previewTitle}
        file={previewFile}
        isOpen={previewOpen}
        toggle={() => {
          setPreviewOpen(false);
          setPreviewFile(null);
          setPreviewTitle("Attachment Preview");
        }}
      />

      <ReviewDocumentModal
        isOpen={reviewModalOpen}
        toggle={() => setReviewModalOpen((prev) => !prev)}
        actionType={reviewTarget?.actionType}
        fileName={reviewTarget?.fileName}
        onConfirm={handleReviewConfirm}
        loading={reviewLoading}
      />
    </CardBody>
  );
};

export default EmployeeDocuments;
