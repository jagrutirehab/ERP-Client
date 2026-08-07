import React, { useEffect, useState } from "react";
import { Input, Nav, NavItem, NavLink } from "reactstrap";
import Select from "react-select";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import classnames from "classnames";
import {
  getAllCenterFloorPhotos,
  reviewCenterFloorPhotoFile,
} from "../../helpers/backend_helper";
import { useAuthError } from "../../Components/Hooks/useAuthError";
import useCenterOptions from "../../Components/Hooks/useCenterOptions";
import DataTableComponent from "../../Components/Common/DataTable";
import PreviewFile from "../../Components/Common/PreviewFile";
import { CenterFloorPhotosColumn } from "./components/columns";
import ReviewPhotoModal from "./components/ReviewPhotoModal";

const Verification = ({ hasWrite }) => {
  const handleAuthError = useAuthError();
  const user = useSelector((state) => state.User);
  const centerOptions = useCenterOptions();

  const [statusTab, setStatusTab] = useState("uploaded");
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
  const [previewTitle, setPreviewTitle] = useState("Photo Preview");

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

  const fetchPhotos = async () => {
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

      const res = await getAllCenterFloorPhotos({
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
        toast.error(error?.message || "Failed to fetch floor photos");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [page, limit, debouncedSearch, selectedCenter, statusTab, user?.centerAccess]);

  useEffect(() => {
    setPage(1);
  }, [statusTab]);

  const handleFilePreview = (file, title) => {
    if (!file?.fileUrl) return;
    setPreviewFile({ url: file.fileUrl, originalName: file.fileName });
    setPreviewTitle(title || "Photo Preview");
    setPreviewOpen(true);
  };

  const openReviewModal = (fileId, recordId, fileName, actionType) => {
    if (!hasWrite) return;
    setReviewTarget({ fileId, recordId, fileName, actionType });
    setReviewModalOpen(true);
  };

  const handleReviewConfirm = async ({ remarks, assessment }) => {
    if (!reviewTarget) return;
    // Re-checked here so the request can't be issued without AUDIT/VERIFICATION
    // WRITE even if the modal is reached some other way.
    if (!hasWrite) {
      toast.error("You do not have permission to verify photos");
      return;
    }
    const { fileId, recordId, actionType } = reviewTarget;

    setReviewLoading(true);
    try {
      const res = await reviewCenterFloorPhotoFile(recordId, fileId, {
        status: actionType,
        ...(remarks ? { remarks } : {}),
        ...(assessment ? { assessment } : {}),
      });
      toast.success(
        res?.data?.message ||
          `Photo ${actionType === "verified" ? "approved" : "rejected"} successfully`,
      );
      setReviewModalOpen(false);
      setReviewTarget(null);
      fetchPhotos();
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Failed to review photo",
        );
      }
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <>
      <Nav tabs className="mb-3">
        {[
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
              placeholder="Search by center or floor..."
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
            Total Records: {pagination?.totalRecords || 0}
          </span>
        </div>
      </div>

      <DataTableComponent
        columns={CenterFloorPhotosColumn(
          openReviewModal,
          handleFilePreview,
          statusTab,
          hasWrite,
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
          setPreviewTitle("Photo Preview");
        }}
      />

      <ReviewPhotoModal
        isOpen={reviewModalOpen}
        toggle={() => setReviewModalOpen((prev) => !prev)}
        actionType={reviewTarget?.actionType}
        fileName={reviewTarget?.fileName}
        onConfirm={handleReviewConfirm}
        loading={reviewLoading}
      />
    </>
  );
};

export default Verification;
