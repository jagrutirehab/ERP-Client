import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Badge,
  Alert,
  Progress,
} from "reactstrap";
import Select from "react-select";
import Flatpickr from "react-flatpickr";
import { toast } from "react-toastify";
import useCenterOptions from "../../Components/Hooks/useCenterOptions";
import { getCenterFloorFields } from "../../helpers/backend_helper";
import {
  toAuditDateParam,
  isTodayLocal,
  formatAuditDate,
} from "../../utils/auditDate";
import LocationTreeSlots from "./components/LocationTreeSlots";
import UploadPhotoModal from "./components/UploadPhotoModal";
import DeletePhotoConfirmModal from "./components/DeletePhotoConfirmModal";

const FloorPhotos = ({ hasWrite, hasDelete }) => {
  // A single center at a time — photos always belong to one center.
  const centerOptions = useCenterOptions({ includeAll: false });

  const [selectedCenter, setSelectedCenter] = useState("");
  // The client owns the audit date. Today, local time.
  const [auditDate, setAuditDate] = useState(() => new Date());
  const [tree, setTree] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Past audits are read-only history — photos can only be added for today.
  const editable = isTodayLocal(auditDate);

  // Default to the first accessible center once the options resolve.
  useEffect(() => {
    if (!selectedCenter && centerOptions.length) {
      setSelectedCenter(centerOptions[0].value);
    }
  }, [centerOptions, selectedCenter]);

  const fetchFields = async () => {
    if (!selectedCenter) return;
    setLoading(true);
    try {
      const res = await getCenterFloorFields(selectedCenter, {
        auditDate: toAuditDateParam(auditDate),
      });
      setTree(res?.data?.tree || []);
      setSummary(res?.data?.summary || null);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch audit locations";
      toast.error(message);
      setTree([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, [selectedCenter, auditDate]);

  const openUploadModal = (slot) => {
    setActiveSlot(slot);
    setUploadModalOpen(true);
  };

  const openDeleteModal = (recordId, file) => {
    setSelectedFile({ recordId, fileId: file._id, fileName: file.fileName });
    setDeleteModalOpen(true);
  };

  const progressPct =
    summary?.totalSlots > 0
      ? Math.round((summary.filledSlots / summary.totalSlots) * 100)
      : 0;

  return (
    <>
      <div className="d-flex flex-wrap align-items-end gap-2 mb-3">
        <div style={{ minWidth: 240 }}>
          <Select
            options={centerOptions}
            value={centerOptions.find((c) => c.value === selectedCenter) || null}
            onChange={(selected) =>
              setSelectedCenter(selected ? selected.value : "")
            }
            placeholder="Select Center"
            isDisabled={!centerOptions.length}
          />
        </div>

        <div style={{ minWidth: 180 }}>
          <Flatpickr
            className="form-control"
            value={auditDate}
            options={{
              dateFormat: "d M, Y",
              maxDate: new Date(),
              disableMobile: true,
            }}
            onChange={([picked]) => picked && setAuditDate(picked)}
          />
        </div>

        {summary?.totalSlots > 0 && (
          <div className="ms-auto d-flex align-items-center gap-3">
            <div style={{ minWidth: 160 }}>
              <div className="d-flex justify-content-between">
                <span className="text-muted" style={{ fontSize: 11 }}>
                  {summary.filledSlots} of {summary.totalSlots} locations
                </span>
                <span className="text-muted" style={{ fontSize: 11 }}>
                  {progressPct}%
                </span>
              </div>
              <Progress value={progressPct} style={{ height: 6 }} />
            </div>
            {summary.pending > 0 && (
              <Badge color="warning" pill>
                {summary.pending} pending
              </Badge>
            )}
            {summary.verified > 0 && (
              <Badge color="success" pill>
                {summary.verified} verified
              </Badge>
            )}
            {summary.rejected > 0 && (
              <Badge color="danger" pill>
                {summary.rejected} rejected
              </Badge>
            )}
          </div>
        )}
      </div>

      {!editable && (
        <Alert color="info" className="py-2 small">
          <i className="ri-history-line me-1" />
          Viewing the audit for {formatAuditDate(auditDate)}. Past audits are
          read-only — switch to today to upload photos.
        </Alert>
      )}

      {summary?.missingMandatory?.length > 0 && editable && (
        <Alert color="warning" className="py-2 small">
          <i className="ri-error-warning-line me-1" />
          {summary.missingMandatory.length} required location
          {summary.missingMandatory.length > 1 ? "s" : ""} still
          {summary.missingMandatory.length > 1 ? " have" : " has"} no photos.
        </Alert>
      )}

      <Card>
        <CardHeader>
          <h5 className="mb-0">
            Floor Photos
            <span className="text-muted fw-normal ms-2" style={{ fontSize: 13 }}>
              {formatAuditDate(auditDate)}
            </span>
          </h5>
        </CardHeader>
        <CardBody>
          {!selectedCenter ? (
            <p className="text-muted small mb-0">
              Select a center to view its locations.
            </p>
          ) : loading ? (
            <div className="text-center py-4">
              <Spinner />
            </div>
          ) : tree.length === 0 ? (
            <p className="text-muted small mb-0">
              No locations are configured for this center. Configure them under
              Setting → Center Floor Configuration.
            </p>
          ) : (
            <LocationTreeSlots
              tree={tree}
              editable={editable}
              hasWrite={hasWrite}
              hasDelete={hasDelete}
              onUpload={openUploadModal}
              onDelete={openDeleteModal}
            />
          )}
        </CardBody>
      </Card>

      <UploadPhotoModal
        isOpen={uploadModalOpen}
        toggle={() => setUploadModalOpen((prev) => !prev)}
        center={selectedCenter}
        auditDate={auditDate}
        slotKey={activeSlot?.slotKey}
        label={activeSlot?.locationLabel}
        onSuccess={fetchFields}
      />

      <DeletePhotoConfirmModal
        isOpen={deleteModalOpen}
        toggle={() => setDeleteModalOpen((prev) => !prev)}
        recordId={selectedFile?.recordId}
        fileId={selectedFile?.fileId}
        fileName={selectedFile?.fileName}
        onSuccess={fetchFields}
      />
    </>
  );
};

export default FloorPhotos;
