import React, { useState, useEffect, useRef } from "react";
import { Button, Input, Label } from "reactstrap";
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
import { DASH, TAG_STATUS_LABEL, errText, useBusy } from "../shared/assetUi";
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

const STEPS = [
  { n: 1, title: "What was found" },
  { n: 2, title: "Tag and place" },
  { n: 3, title: "Photos and save" },
];

// Add Verification in three simple steps. The verification is saved at the end (step 3), then its photos are sent.
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
  const [categoryNames, setCategoryNames] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [step, setStep] = useState(1);
  const [saving, runSave] = useBusy();

  // After saving: the verification exists. If a photo failed, the page stays here so it can be retried.
  const [saved, setSaved] = useState(null); // { id, scanCode, photoFailures }
  const scanIdRef = useRef(null);
  const pickerRef = useRef(null);
  const [photoState, setPhotoState] = useState({ ready: 0, failed: 0, uploading: 0, done: 0 });
  const [savedCounts, setSavedCounts] = useState({ tag: 0, asset: 0 });
  const [pickerKey, setPickerKey] = useState(0); // a new picker (no old photos) for every new verification

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
  const selectedJob = jobs.find((j) => j._id === jobId);

  const quantityProblem = () => {
    if (form.quantity === "") return "";
    const q = Number(form.quantity);
    if (!Number.isFinite(q)) return "Quantity must be a number";
    if (!Number.isInteger(q)) return "Quantity must be a whole number";
    if (q < 1) return "Quantity must be at least 1";
    return "";
  };
  const stepQuantity = (delta) =>
    setForm((f) => {
      const q = Number(f.quantity);
      const base = Number.isInteger(q) && q >= 1 ? q : 1;
      return { ...f, quantity: String(Math.max(1, base + delta)) };
    });

  const goNext = () => {
    if (step === 1) {
      if (!jobId) return toast.error("Select a job");
      if (!category.categoryL1) return toast.error("Category level 1 is required");
      const problem = quantityProblem();
      if (problem) return toast.error(problem);
    }
    setStep((s) => Math.min(3, s + 1));
  };

  // Next one: keep the job and the category, clear the rest, back to step 1
  const startNext = () => {
    setForm(EMPTY_FORM);
    setSaved(null);
    setStep(1);
    scanIdRef.current = null;
    setSavedCounts({ tag: 0, asset: 0 });
    setPhotoState({ ready: 0, failed: 0, uploading: 0, done: 0 });
    setPickerKey((k) => k + 1);
  };

  // Save the verification, then send the photos that were chosen. goNextAfter: jump straight to the next one when all went well.
  const save = (goNextAfter) =>
    runSave(async () => {
      let scan = null;
      try {
        const res = await createAssetScan({
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
        });
        toast.success(res?.message || "Verification added successfully");
        (res?.warnings || []).forEach((w) => toast.warn(w.message || String(w)));
        scan = { id: res?.data?._id, scanCode: res?.data?.scanCode || "" };
      } catch (error) {
        if (!handleAuthError(error)) toast.error(errText(error, "The verification could not be added."));
        return;
      }

      // the verification is saved; from here a failed photo can never lose it
      scanIdRef.current = scan.id;
      let failures = 0;
      if (pickerRef.current && pickerRef.current.hasWaiting()) {
        failures = (await pickerRef.current.uploadAll()) || 0;
        if (failures > 0) toast.error(`Verification saved, ${failures} photo(s) failed. Use Retry`);
      }
      if (failures === 0 && goNextAfter) return startNext();
      setSaved({ ...scan, photoFailures: failures });
    });

  const steps = (
    <div className="d-flex align-items-center mb-4" aria-label={`Step ${step} of 3`}>
      {STEPS.map((s, i) => {
        const done = saved ? true : step > s.n;
        const on = !saved && step === s.n;
        return (
          <React.Fragment key={s.n}>
            <div className="text-center" style={{ flex: "0 0 auto", width: 84 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  margin: "0 auto",
                  borderRadius: 999,
                  lineHeight: "34px",
                  fontWeight: 700,
                  background: done ? "#12b76a" : on ? "#4f46e5" : "#e5e7eb",
                  color: done || on ? "#fff" : "#667085",
                }}
              >
                {done ? "✓" : s.n}
              </div>
              <div style={{ fontSize: 12, marginTop: 4, color: on ? "#4f46e5" : "#667085", fontWeight: on ? 700 : 500 }}>{s.title}</div>
            </div>
            {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: done ? "#12b76a" : "#e5e7eb", marginBottom: 20 }} />}
          </React.Fragment>
        );
      })}
    </div>
  );

  // the photo picker is shown on step 3, and after saving only if a photo is still waiting or failed
  const showPhotos = (!saved && step === 3) || (saved && (photoState.failed > 0 || photoState.ready > 0 || photoState.uploading > 0));

  const hint = (text) => <div className="text-muted small mt-1">{text}</div>;

  return (
    <div className="uom-page add-verification-page" style={{ maxWidth: "100%", overflowX: "hidden" }}>
      {/* bigger touch targets, one column and no sideways scrolling on a phone */}
      <style>{`
        .add-verification-page select.form-select, .add-verification-page input.form-control, .add-verification-page .form-control { min-height: 40px; font-size: 16px; }
        .add-verification-page .uom-table-card { max-width: 100%; }
        .add-verification-page .qty-btn { width: 40px; font-size: 18px; font-weight: 700; padding: 0; }
        @media (max-width: 575px) {
          .add-verification-page.uom-page { padding-left: 0; padding-right: 0; }
          .add-verification-page .uom-table-card { padding: 16px !important; }
                  }
      `}</style>

      <div className="uom-list-header">
        <div style={{ minWidth: 0 }}>
          <h4>Add Verification</h4>
          <p>Record something found during a verification job</p>
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
        <div className="uom-table-card p-4 mb-4">
          {steps}

          {/* ----- after saving: result (and retry for a photo that failed) ----- */}
          {saved && (
            <>
              <div className="p-3 mb-3" style={{ background: "#ecfdf3", border: "1px solid #abefc6", borderRadius: 10 }}>
                <div className="fw-semibold" style={{ color: "#067647" }}>Verification saved: {saved.scanCode}</div>
                {photoState.failed > 0 || saved.photoFailures > 0 ? (
                  <div className="text-danger small mt-1">
                    Verification saved, photo failed. Tap Retry on the photo, or go on without it.
                  </div>
                ) : (
                  <div className="text-muted small mt-1">It is now waiting for review in Verifications.</div>
                )}
              </div>
            </>
          )}

          {/* ----- step 1: what was found ----- */}
          {!saved && step === 1 && (
            <>
              <h5 className="mb-1">What was found?</h5>
              <p className="text-muted small mb-3">Choose the job and the kind of item, and how many there are.</p>

              <Label className="fw-semibold">
                Job <span className="text-danger">*</span>
              </Label>
              <Input type="select" value={jobId} onChange={(e) => setJobId(e.target.value)} disabled={jobsLoading} className="mb-1">
                <option value="">{jobsLoading ? "Loading jobs..." : "Select an active job"}</option>
                {jobs.map((j) => (
                  <option key={j._id} value={j._id}>
                    {j.jobCode} - {j.jobName}
                  </option>
                ))}
              </Input>
              {selectedJob && hint(`Site: ${selectedJob.centerId?.title || "the job's site"}`)}
              {jobsError && (
                <div className="text-danger small mt-1">
                  Could not load the jobs.{" "}
                  <button type="button" className="btn btn-link btn-sm p-0" onClick={loadJobs}>Try again</button>
                </div>
              )}
              {!jobsLoading && !jobsError && jobs.length === 0 && hint("There is no active job. Create a job and activate it in Verification Jobs first.")}

              <Label className="fw-semibold mt-4">
                Category <span className="text-danger">*</span>
              </Label>
              <p className="text-muted small mb-2">Start with level 1, then pick a more exact kind if there is one.</p>
              <CategoryLevelSelect
                value={category}
                onChange={setCategory}
                onSettings={(c) => setCategoryNames(c.names || [])}
                required
                md={12}
              />

              <Label className="fw-semibold">How many?</Label>
              <div className="d-flex align-items-stretch gap-2" style={{ maxWidth: 200 }}>
                <Button color="light" className="qty-btn" aria-label="One less" onClick={() => stepQuantity(-1)}>−</Button>
                <Input type="number" min={1} step={1} inputMode="numeric" value={form.quantity} onChange={set("quantity")} className="text-center" />
                <Button color="light" className="qty-btn" aria-label="One more" onClick={() => stepQuantity(1)}>+</Button>
              </div>
              {hint("The number of identical items. One register asset is created for each when this is approved.")}

              <div className="d-flex flex-wrap justify-content-end mt-4">
                <Button color="primary" onClick={goNext}>Next</Button>
              </div>
            </>
          )}

          {/* ----- step 2: tag and place ----- */}
          {!saved && step === 2 && (
            <>
              <h5 className="mb-1">Tag and place</h5>
              <p className="text-muted small mb-3">All of this is optional. Fill in what you have.</p>

              <Label className="fw-semibold">Tag number</Label>
              <Input value={form.tagNumber} onChange={set("tagNumber")} placeholder="e.g. BT0012345" autoCapitalize="characters" />
              {hint("The number printed on the tag. When approved, the tag is fitted to the first item only.")}

              <div className="row">
                <div className="col-12 col-md-6 mt-3">
                  <Label className="fw-semibold">Old tag number</Label>
                  <Input value={form.oldTagNumber} onChange={set("oldTagNumber")} />
                </div>
                <div className="col-12 col-md-6 mt-3">
                  <Label className="fw-semibold">Tag status</Label>
                  <Input type="select" value={form.tagStatus} onChange={set("tagStatus")}>
                    <option value="">Not given</option>
                    {Object.entries(TAG_STATUS_LABEL).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </Input>
                </div>
                <div className="col-6 mt-3">
                  <Label className="fw-semibold">Room</Label>
                  <Input value={form.roomNo} onChange={set("roomNo")} />
                </div>
                <div className="col-6 mt-3">
                  <Label className="fw-semibold">Floor</Label>
                  <Input value={form.floorNo} onChange={set("floorNo")} />
                </div>
                <div className="col-12 mt-3">
                  <Label className="fw-semibold">Remarks</Label>
                  <Input type="textarea" rows={2} value={form.remarks} onChange={set("remarks")} />
                </div>
              </div>

              <div className="d-flex flex-wrap justify-content-between gap-2 mt-4">
                <Button color="light" onClick={() => setStep(1)}>Back</Button>
                <Button color="primary" onClick={goNext}>Next</Button>
              </div>
            </>
          )}

          {/* ----- step 3: photos and save ----- */}
          {!saved && step === 3 && (
            <>
              <h5 className="mb-1">Photos and save</h5>
              <p className="text-muted small mb-3">Check the details, add photos if you can (they are optional), then save.</p>

              <div className="mb-4 p-3" style={{ background: "#f8f9fa", borderRadius: 10 }}>
                {[
                  ["Job", selectedJob ? `${selectedJob.jobCode} - ${selectedJob.jobName}` : DASH],
                  ["Site", selectedJob?.centerId?.title || DASH],
                  ["Category", categoryNames.length > 0 ? categoryNames.join(" › ") : DASH],
                  ["How many", form.quantity || "1"],
                  ["Tag number", form.tagNumber.trim() || DASH],
                  ["Room / Floor", [form.roomNo.trim() && `Room ${form.roomNo.trim()}`, form.floorNo.trim() && `Floor ${form.floorNo.trim()}`].filter(Boolean).join(" · ") || DASH],
                ].map(([label, value]) => (
                  <div key={label} className="d-flex justify-content-between gap-3 py-1" style={{ fontSize: 14 }}>
                    <span className="text-muted">{label}</span>
                    <span className="fw-semibold text-end" style={{ minWidth: 0, wordBreak: "break-word" }}>{value}</span>
                  </div>
                ))}
                <div className="text-end mt-1">
                  <button type="button" className="btn btn-link btn-sm p-0" onClick={() => setStep(1)}>Change</button>
                </div>
              </div>

            </>
          )}

          {/* The photos stay here (hidden on other steps) so they are not lost when going Back and Next */}
          <div style={{ display: showPhotos ? "block" : "none" }} className={saved ? "mb-3" : "mb-4"}>
            {!saved && (
              <>
                <h6 className="fw-semibold mb-1">Photos (optional)</h6>
                <p className="text-muted small mb-2">
                  Take a photo of the tag and of the item. They are shrunk on your device and sent when you save.
                </p>
              </>
            )}
            <PhotoPicker
              key={pickerKey}
              ref={pickerRef}
              onUpload={(file, kind) => {
                const fd = new FormData();
                fd.append("file", file);
                return uploadAssetScanImage(scanIdRef.current, kind, fd);
              }}
              existingTag={savedCounts.tag}
              existingAsset={savedCounts.asset}
              onUploaded={(kind) => setSavedCounts((c) => ({ ...c, [kind]: c[kind] + 1 }))}
              onSummary={setPhotoState}
              manualUpload={!!saved}
              disabled={saving}
              hideDone
            />
          </div>

          {/* buttons: after the photos */}
          {saved && (
            <div className="d-flex flex-wrap gap-2">
              <Button color="primary" disabled={photoState.uploading > 0} onClick={startNext}>Add another</Button>
              <Button color="light" onClick={() => navigate("/vendor-management/asset-scan")}>Go to Verifications</Button>
            </div>
          )}
          {!saved && step === 3 && (
            <div className="d-flex flex-wrap justify-content-between gap-2 mt-4">
              <Button color="light" disabled={saving} onClick={() => setStep(2)}>Back</Button>
              <div className="d-flex flex-wrap gap-2">
                <Button color="light" disabled={saving} onClick={() => save(true)}>
                  {saving ? "Saving..." : "Save and add next"}
                </Button>
                <Button color="primary" disabled={saving} onClick={() => save(false)}>
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {canAdd && !saved && step === 1 && (
        <ExcelUploadPanel
          title="Have many? Upload an Excel file"
          hint="Download the template, fill one row per verification, then upload it. If any row has a problem nothing is saved and the problems are listed. Up to 1000 rows, .xlsx only, 5 MB at most."
          templateFile="verification-template.xlsx"
          downloadTemplate={downloadAssetScanTemplate}
          upload={uploadAssetScans}
        />
      )}
    </div>
  );
};

export default AddScan;
