import React, { useState, useEffect } from "react";
import { Button, Input, Label, Row, Col } from "reactstrap";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  getVerificationJobs,
  createAssetScan,
  uploadAssetScanImage,
  downloadAssetScanTemplate,
  uploadAssetScans,
} from "../../../../helpers/backend_helper";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { usePermissions } from "../../../../Components/Hooks/useRoles.js";
import CategoryLevelSelect, { EMPTY_CATEGORY } from "../shared/CategoryLevelSelect";
import ExcelUploadPanel from "../shared/ExcelUploadPanel";
import PhotoPicker from "../shared/PhotoPicker";
import { errText, useBusy } from "../shared/assetUi";
import "../../UnitOfMeasurement/uom.scss";

const EMPTY_FORM = {
  quantity: "1",
  tagNumber: "",
  oldTagNumber: "",
  tagStatus: "",
  roomNo: "",
  floorNo: "",
  remarks: "",
};

const AddScan = () => {
  const handleAuthError = useAuthError();
  const navigate = useNavigate();
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canAdd = hasPermission("MASTERDATA", "VERIFICATION_JOB", "WRITE");

  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState(false);
  const [jobId, setJobId] = useState("");
  const [category, setCategory] = useState(EMPTY_CATEGORY);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, runSave] = useBusy();
  const [lastAdded, setLastAdded] = useState("");

  // Step 2: the verification is saved, now its photos (optional)
  const [savedScan, setSavedScan] = useState(null); // { id, scanCode }
  const [photoState, setPhotoState] = useState({ ready: 0, failed: 0, uploading: 0, done: 0 });
  const [savedCounts, setSavedCounts] = useState({ tag: 0, asset: 0 }); // photos already saved for this verification

  const loadJobs = () => {
    setJobsLoading(true);
    setJobsError(false);
    getVerificationJobs({ status: "active" })
      .then((res) => setJobs(res?.data || []))
      .catch((error) => {
        if (!handleAuthError(error)) setJobsError(true);
      })
      .finally(() => setJobsLoading(false));
  };
  useEffect(loadJobs, []); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // mode "photos": save, then go to the photo step. mode "next": save, keep the job and the category, clear the rest.
  const save = (mode) =>
    runSave(async () => {
      if (!jobId) return toast.error("Select a job");
      if (!category.categoryL1) return toast.error("Category level 1 is required");
      try {
        const body = {
          jobId,
          categoryL1: category.categoryL1,
          categoryL2: category.categoryL2 || undefined,
          categoryL3: category.categoryL3 || undefined,
          categoryL4: category.categoryL4 || undefined,
          quantity: form.quantity === "" ? undefined : Number(form.quantity),
          tagNumber: form.tagNumber.trim() || undefined,
          oldTagNumber: form.oldTagNumber.trim() || undefined,
          tagStatus: form.tagStatus || undefined,
          roomNo: form.roomNo.trim() || undefined,
          floorNo: form.floorNo.trim() || undefined,
          remarks: form.remarks.trim() || undefined,
        };
        const res = await createAssetScan(body);
        toast.success(res?.message || "Verification added successfully");
        (res?.warnings || []).forEach((w) => toast.warn(w.message || String(w)));
        setLastAdded(res?.data?.scanCode || "");
        if (mode === "photos") {
          setSavedScan({ id: res?.data?._id, scanCode: res?.data?.scanCode || "" });
          setPhotoState({ ready: 0, failed: 0, uploading: 0, done: 0 });
          setSavedCounts({ tag: 0, asset: 0 });
        } else {
          setForm(EMPTY_FORM); // quantity back to 1, tag number and the rest cleared; job and category stay
        }
      } catch (error) {
        if (!handleAuthError(error)) toast.error(errText(error, "The verification could not be added."));
      }
    });

  const finishPhotos = () => {
    const waiting = photoState.ready + photoState.failed;
    if (photoState.uploading > 0) return toast.error("Photos are still being prepared or uploaded. Please wait");
    if (waiting > 0) {
      return toast.error(`${waiting} photo(s) have not been uploaded yet. Upload them or remove them, then press Done`);
    }
    setSavedScan(null);
    setForm(EMPTY_FORM); // the job and the category stay for the next one
  };

  const selectedJob = jobs.find((j) => j._id === jobId);

  return (
    <div className="uom-page add-verification-page" style={{ maxWidth: "100%", overflowX: "hidden" }}>
      {/* one column and no sideways scrolling on a phone */}
      <style>{`
        .add-verification-page select.form-select, .add-verification-page input.form-control, .add-verification-page .form-control { min-height: 40px; font-size: 16px; }
        .add-verification-page .uom-table-card { max-width: 100%; }
        @media (max-width: 575px) {
          .add-verification-page.uom-page { padding-left: 0; padding-right: 0; }
          .add-verification-page .uom-table-card { padding: 16px !important; }
        }
      `}</style>

      <div className="uom-list-header">
        <div style={{ minWidth: 0 }}>
          <h4>Add Verification</h4>
          <p>Record something found during a verification job, one at a time or from an Excel file</p>
        </div>
        <Button color="light" onClick={() => navigate("/vendor-management/asset-scan")}>
          Go to Verifications
        </Button>
      </div>

      {!canAdd && (
        <div className="uom-table-card p-4 mb-4">
          <div className="uom-empty-state">
            <p className="uom-empty-title">You can view this page but not add verifications</p>
            <p className="uom-empty-sub">Ask an administrator for write access to Verifications.</p>
          </div>
        </div>
      )}

      {canAdd && savedScan && (
        <div className="uom-table-card p-4 mb-4">
          <div className="p-3 mb-3" style={{ background: "#ecfdf3", border: "1px solid #abefc6", borderRadius: 10 }}>
            <div className="fw-semibold" style={{ color: "#067647" }}>
              Verification saved: {savedScan.scanCode}
            </div>
            {photoState.failed > 0 && (
              <div className="text-danger small mt-1">
                Verification saved, photo failed. Use Retry on the photo, or press Done to leave it without that photo.
              </div>
            )}
          </div>
          <h6 className="fw-semibold mb-1">Add photos (optional)</h6>
          <p className="text-muted small mb-3">
            Take a photo of the tag and of the item. The photos are shrunk on your device before they are sent.
          </p>
          <PhotoPicker
            onUpload={(file, kind) => {
              const fd = new FormData();
              fd.append("file", file);
              return uploadAssetScanImage(savedScan.id, kind, fd);
            }}
            existingTag={savedCounts.tag}
            existingAsset={savedCounts.asset}
            onUploaded={(kind) => setSavedCounts((c) => ({ ...c, [kind]: c[kind] + 1 }))}
            onSummary={setPhotoState}
          />
          <div className="d-flex flex-wrap gap-2 mt-4">
            <Button color="primary" onClick={finishPhotos}>
              Done
            </Button>
          </div>
        </div>
      )}

      {canAdd && !savedScan && (
        <>
          <div className="uom-table-card p-4 mb-4">
            <h6 className="fw-semibold mb-3">Add one verification</h6>

            <Row>
              <Col md={6} className="mb-3">
                <Label className="small">
                  Job <span className="text-danger">*</span>
                </Label>
                <Input type="select" value={jobId} onChange={(e) => setJobId(e.target.value)} disabled={jobsLoading}>
                  <option value="">{jobsLoading ? "Loading jobs..." : "Select an active job"}</option>
                  {jobs.map((j) => (
                    <option key={j._id} value={j._id}>
                      {j.jobCode} - {j.jobName}
                    </option>
                  ))}
                </Input>
                {jobsError && (
                  <div className="text-danger small mt-1">
                    Could not load the jobs.{" "}
                    <button type="button" className="btn btn-link btn-sm p-0" onClick={loadJobs}>
                      Try again
                    </button>
                  </div>
                )}
                {!jobsLoading && !jobsError && jobs.length === 0 && (
                  <div className="text-muted small mt-1">
                    There is no active job. Create a job and activate it in Verification Jobs first.
                  </div>
                )}
                {selectedJob && (
                  <div className="text-muted small mt-1">Found at: {selectedJob.centerId?.title || "the job's site"}</div>
                )}
              </Col>
            </Row>

            <CategoryLevelSelect value={category} onChange={setCategory} required disabled={saving} />

            <Row>
              <Col md={3} xs={12} className="mb-3">
                <Label className="small">Quantity</Label>
                <Input type="number" min={1} step={1} inputMode="numeric" value={form.quantity} onChange={set("quantity")} />
              </Col>
              <Col md={3} xs={12} className="mb-3">
                <Label className="small">Tag number</Label>
                <Input value={form.tagNumber} onChange={set("tagNumber")} placeholder="e.g. BT0012345" />
              </Col>
              <Col md={3} xs={12} className="mb-3">
                <Label className="small">Old tag number</Label>
                <Input value={form.oldTagNumber} onChange={set("oldTagNumber")} />
              </Col>
              <Col md={3} xs={12} className="mb-3">
                <Label className="small">Tag status</Label>
                <Input type="select" value={form.tagStatus} onChange={set("tagStatus")}>
                  <option value="">Not given</option>
                  <option value="new">New</option>
                  <option value="old_plus_new">Old + New</option>
                  <option value="existing">Existing</option>
                </Input>
              </Col>
            </Row>
            <Row>
              <Col md={3} xs={12} className="mb-3">
                <Label className="small">Room</Label>
                <Input value={form.roomNo} onChange={set("roomNo")} />
              </Col>
              <Col md={3} xs={12} className="mb-3">
                <Label className="small">Floor</Label>
                <Input value={form.floorNo} onChange={set("floorNo")} />
              </Col>
              <Col md={6} xs={12} className="mb-3">
                <Label className="small">Remarks</Label>
                <Input value={form.remarks} onChange={set("remarks")} />
              </Col>
            </Row>
            <div className="text-muted small mb-3">
              When this is approved, one register asset is created for each unit. A tag number is fitted to the first
              asset only; the other units need tags afterwards. Photos are optional and are added in the next step.
            </div>

            <div className="d-flex flex-wrap align-items-center gap-2">
              <Button color="primary" onClick={() => save("photos")} disabled={saving}>
                {saving ? "Saving..." : "Add Verification"}
              </Button>
              <Button color="light" onClick={() => save("next")} disabled={saving}>
                Save and add next
              </Button>
              {lastAdded && <span className="text-success small">Last added: {lastAdded}</span>}
            </div>
          </div>

          <ExcelUploadPanel
            title="Add many verifications from an Excel file"
            hint="Download the template, fill one row per verification, then upload it. If any row has a problem nothing is saved and the problems are listed. Up to 1000 rows, .xlsx only, 5 MB at most."
            templateFile="verification-template.xlsx"
            downloadTemplate={downloadAssetScanTemplate}
            upload={uploadAssetScans}
          />
        </>
      )}
    </div>
  );
};

export default AddScan;
