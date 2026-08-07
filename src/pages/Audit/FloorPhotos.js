import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Row, Spinner, Button } from "reactstrap";
import Select from "react-select";
import { toast } from "react-toastify";
import useCenterOptions from "../../Components/Hooks/useCenterOptions";
import { getCenterFloorFields } from "../../helpers/backend_helper";
import DocPreview from "../Authentication/Components/DocPreview";
import UploadPhotoModal from "./components/UploadPhotoModal";
import DeletePhotoConfirmModal from "./components/DeletePhotoConfirmModal";

const FloorPhotos = ({ hasWrite, hasDelete }) => {
  // A single center at a time — photos always belong to one center.
  const centerOptions = useCenterOptions({ includeAll: false });

  const [selectedCenter, setSelectedCenter] = useState("");
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

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
      const res = await getCenterFloorFields(selectedCenter);
      setFields(res?.data || []);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch floor photos";
      toast.error(message);
      setFields([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, [selectedCenter]);

  // areaId is null for floors that collect photos at floor level.
  const openUploadModal = (floorId, areaId, label) => {
    setActiveSlot({ floorId, areaId, label });
    setUploadModalOpen(true);
  };

  const openDeleteModal = (recordId, file) => {
    setSelectedFile({ recordId, fileId: file._id, fileName: file.fileName });
    setDeleteModalOpen(true);
  };

  // One upload slot — used for a floor with no areas, and for each area.
  const renderSlot = ({ label, mandatory, legacy, floorId, areaId, files, recordId }) => (
    <>
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div>
          <p className="fw-semibold mb-0">
            {label}
            {mandatory && <span className="text-danger ms-1">*</span>}
          </p>
          {legacy && (
            <p className="text-muted small mb-0">
              <i className="ri-information-line me-1" />
              No longer configured for this center.
            </p>
          )}
        </div>
        {!legacy && hasWrite && (
          <Button
            color="primary"
            size="sm"
            onClick={() => openUploadModal(floorId, areaId, label)}
          >
            <i className="ri-upload-2-line me-1" />
            {files.length > 0 ? "Upload More" : "Upload"}
          </Button>
        )}
      </div>

      {files.length === 0 ? (
        <div className="border rounded p-3 text-center text-muted bg-light small">
          No photos uploaded
        </div>
      ) : (
        <Row>
          {files.map((file, index) => (
            <DocPreview
              key={file._id || index}
              label={label}
              url={file.fileUrl}
              detail={file.fileName}
              status={file.status}
              remarks={file.remarks}
              uploadedAt={file.uploadedAt}
              actionedAt={file.actionedAt}
              onDelete={
                hasDelete && file.status !== "verified"
                  ? () => openDeleteModal(recordId, file)
                  : undefined
              }
            />
          ))}
        </Row>
      )}
    </>
  );

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
      </div>

      <Card>
        <CardHeader>
          <h5 className="mb-0">Floor Photos</h5>
        </CardHeader>
        <CardBody>
          {!selectedCenter ? (
            <p className="text-muted small mb-0">
              Select a center to view its floors.
            </p>
          ) : loading ? (
            <div className="text-center py-4">
              <Spinner />
            </div>
          ) : fields.length === 0 ? (
            <p className="text-muted small mb-0">
              No floors are configured for this center yet. Configure them under
              Setting → Center Floor Configuration.
            </p>
          ) : (
            fields.map((field) => {
              const areas = field.areas || [];

              // A floor split into areas is just a heading for its areas.
              if (areas.length > 0) {
                return (
                  <div key={field.floor} className="mb-4 pb-2 border-bottom">
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <i className="ri-building-4-line text-muted" />
                      <h6 className="fw-semibold mb-0">
                        {field.floorName}
                        {field.markMandatory && (
                          <span className="text-danger ms-1">*</span>
                        )}
                      </h6>
                      <span className="text-muted small">
                        ({areas.length} area{areas.length > 1 ? "s" : ""})
                      </span>
                    </div>

                    <div className="ps-3 border-start">
                      {areas.map((area) => (
                        <div key={area.area} className="mb-4">
                          {renderSlot({
                            label: area.areaName,
                            mandatory: area.markMandatory,
                            legacy: area.legacy,
                            floorId: field.floor,
                            areaId: area.area,
                            files: area.files || [],
                            recordId: area.recordId,
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <div key={field.floor} className="mb-4 pb-3 border-bottom">
                  {renderSlot({
                    label: field.floorName,
                    mandatory: field.markMandatory,
                    legacy: field.legacy,
                    floorId: field.floor,
                    areaId: null,
                    files: field.files || [],
                    recordId: field.recordId,
                  })}
                </div>
              );
            })
          )}
        </CardBody>
      </Card>

      <UploadPhotoModal
        isOpen={uploadModalOpen}
        toggle={() => setUploadModalOpen((prev) => !prev)}
        center={selectedCenter}
        floorId={activeSlot?.floorId}
        areaId={activeSlot?.areaId}
        label={activeSlot?.label}
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
