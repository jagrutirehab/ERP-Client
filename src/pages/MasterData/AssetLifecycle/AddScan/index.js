import React, { useState, useEffect } from "react";
import { Button, Input, Label, Row, Col } from "reactstrap";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  getVerificationJobs,
  createAssetScan,
  downloadAssetScanTemplate,
  uploadAssetScans,
} from "../../../../helpers/backend_helper";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { usePermissions } from "../../../../Components/Hooks/useRoles.js";
import CategoryLevelSelect, { EMPTY_CATEGORY } from "../shared/CategoryLevelSelect";
import ExcelUploadPanel from "../shared/ExcelUploadPanel";
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
  const canAdd = hasPermission("MASTERDATA", "ASSET_SCAN", "WRITE");

  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState(false);
  const [jobId, setJobId] = useState("");
  const [category, setCategory] = useState(EMPTY_CATEGORY);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, runSave] = useBusy();
  const [lastAdded, setLastAdded] = useState("");

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

  const handleSubmit = () =>
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
        // the job and the category are kept, because the next scan is usually from the same place
        setForm(EMPTY_FORM);
      } catch (error) {
        if (!handleAuthError(error)) toast.error(errText(error, "The verification could not be added."));
      }
    });

  const selectedJob = jobs.find((j) => j._id === jobId);

  return (
    <div className="uom-page">
      <div className="uom-list-header">
        <div>
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

      {canAdd && (
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
              <Col md={3} className="mb-3">
                <Label className="small">Quantity</Label>
                <Input type="number" min={1} step={1} value={form.quantity} onChange={set("quantity")} />
              </Col>
              <Col md={3} className="mb-3">
                <Label className="small">Tag number</Label>
                <Input value={form.tagNumber} onChange={set("tagNumber")} placeholder="e.g. BT0012345" />
              </Col>
              <Col md={3} className="mb-3">
                <Label className="small">Old tag number</Label>
                <Input value={form.oldTagNumber} onChange={set("oldTagNumber")} />
              </Col>
              <Col md={3} className="mb-3">
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
              <Col md={3} className="mb-3">
                <Label className="small">Room</Label>
                <Input value={form.roomNo} onChange={set("roomNo")} />
              </Col>
              <Col md={3} className="mb-3">
                <Label className="small">Floor</Label>
                <Input value={form.floorNo} onChange={set("floorNo")} />
              </Col>
              <Col md={6} className="mb-3">
                <Label className="small">Remarks</Label>
                <Input value={form.remarks} onChange={set("remarks")} />
              </Col>
            </Row>
            <div className="text-muted small mb-3">
              When this is verified, one register asset is created for each unit. A tag number is fitted to the first
              asset only; the other units need tags afterwards.
            </div>

            <div className="d-flex align-items-center gap-3">
              <Button color="primary" onClick={handleSubmit} disabled={saving}>
                {saving ? "Adding..." : "Add Verification"}
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
