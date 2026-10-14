import React, { useMemo, useState } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  Label,
  Input,
  Button,
  FormGroup,
  ButtonGroup,
} from "reactstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
import { UploadCloud, CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";
import Select from "react-select";
import { addSubmission } from "./submissionsStore";
import { CENTRES, CATEGORIES, getItem } from "./data";

const LEAD_OPTIONS = [30, 60, 90, 120];

const StepTitle = ({ n, children }) => (
  <h6 className="mb-3 d-flex align-items-center gap-2">
    <span
      className="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
      style={{ width: 22, height: 22, background: "#1B4D47", color: "#fff", fontSize: 12 }}
    >
      {n}
    </span>
    {children}
  </h6>
);

const UploadDocument = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const initialCentre = params.get("centre") || CENTRES[0].id;
  const initialCategory = params.get("category") || CATEGORIES[0].id;

  const [centreId, setCentreId] = useState(initialCentre);
  const [categoryId, setCategoryId] = useState(initialCategory);
  const [leadDays, setLeadDays] = useState(60);
  const [noExpiry, setNoExpiry] = useState(false);
  const [files, setFiles] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const centre = CENTRES.find((c) => c.id === centreId);
  const category = CATEGORIES.find((c) => c.id === categoryId);
  const existing = getItem(centreId, categoryId);

  const centreOptions = CENTRES.map((c) => ({ value: c.id, label: c.name }));
  const categoryOptions = CATEGORIES.map((c) => ({ value: c.id, label: c.name }));

  const [issuingAuthority, setIssuingAuthority] = useState(category?.authority?.[centre?.state] || "");
  const [licenceNo, setLicenceNo] = useState(existing?.licenceNo || "");
  const [issuedOn, setIssuedOn] = useState("");
  const [validTill, setValidTill] = useState("");
  const [owner, setOwner] = useState(category?.owner || "");
  const [escalateTo, setEscalateTo] = useState("Centre Head + Admin & Legal");
  const [notes, setNotes] = useState("");

  const handleFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...picked.map((f) => ({ name: f.name, size: f.size }))]);
  };

  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = (e) => {
    e.preventDefault();
    // No backend yet — this pushes into the same in-memory store the
    // Approvals page reads from, so the demo flow (submit → shows up for
    // Admin & Legal to approve/reject) actually works end to end.
    addSubmission({
      centreId,
      categoryId,
      fileNames: files.length ? files.map((f) => f.name) : undefined,
      issuingAuthority,
      licenceNo,
      issuedOn: issuedOn || null,
      validTill: noExpiry ? null : validTill || null,
      noExpiry,
      leadDays,
      owner,
      escalateTo,
      notes,
    });
    setSubmitted(true);
    toast.success("Sent for verification.");
  };

  const reminderPreview = useMemo(() => {
    if (noExpiry) return [];
    const base = [90, 60, 30, 7];
    return base.map((d) => `${d}-day reminder before expiry`);
  }, [noExpiry]);

  if (submitted) {
    return (
      <div className="p-3 p-lg-4">
        <div className="mb-3">
          <h5 className="mb-1 fw-semibold">Saved</h5>
        </div>
        <Card className="shadow-sm">
          <CardBody className="text-center py-5">
            <CheckCircle2 size={40} className="text-success mb-3" />
            <h5>Sent for verification</h5>
            <p className="text-muted">
              {category?.name} · {centre?.name} — this now sits in the Approvals queue for Admin &amp;
              Legal. (Front-end only demo: nothing left this browser.)
            </p>
            <div className="d-flex justify-content-center flex-wrap gap-2">
              <Button color="success" className="text-white" onClick={() => navigate("/compliance/approvals")}>
                View approvals queue
              </Button>
              <Button
                color="light"
                className="border"
                onClick={() => navigate(`/compliance/centres/${centreId}`)}
              >
                Back to {centre?.name} register
              </Button>
              <Button color="light" className="border" onClick={() => navigate("/compliance")}>
                Back to overview
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-3 p-lg-4">
      <div className="mb-3">
        <h5 className="mb-1 fw-semibold">Add / renew document</h5>
        <p className="text-muted mb-0 fs-13">
          Upload a new or renewed compliance document and send it for verification.
        </p>
      </div>

        <Row className="g-3">
          <Col lg={8}>
            <form onSubmit={handleSubmit}>
              <Card className="shadow-sm mb-3">
                <CardBody>
                  <StepTitle n={1}>What and where</StepTitle>
                  <Row className="g-3">
                    <Col sm={6}>
                      <FormGroup className="mb-0">
                        <Label>Centre</Label>
                        <Select
                          classNamePrefix="react-select"
                          options={centreOptions}
                          value={centreOptions.find((o) => o.value === centreId)}
                          onChange={(option) => setCentreId(option?.value)}
                        />
                      </FormGroup>
                    </Col>
                    <Col sm={6}>
                      <FormGroup className="mb-0">
                        <Label>Compliance type</Label>
                        <Select
                          classNamePrefix="react-select"
                          options={categoryOptions}
                          value={categoryOptions.find((o) => o.value === categoryId)}
                          onChange={(option) => setCategoryId(option?.value)}
                        />
                      </FormGroup>
                    </Col>
                    <Col sm={6}>
                      <FormGroup className="mb-0">
                        <Label>Issuing authority</Label>
                        <Input
                          value={issuingAuthority}
                          onChange={(e) => setIssuingAuthority(e.target.value)}
                        />
                      </FormGroup>
                    </Col>
                    <Col sm={6}>
                      <FormGroup className="mb-0">
                        <Label>Licence / registration no.</Label>
                        <Input
                          value={licenceNo}
                          onChange={(e) => setLicenceNo(e.target.value)}
                          placeholder="e.g. FIRE/PUN/1097"
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                </CardBody>
              </Card>

              <Card className="shadow-sm mb-3">
                <CardBody>
                  <StepTitle n={2}>Validity</StepTitle>
                  <FormGroup check className="mb-3">
                    <Input
                      id="noExpiry"
                      type="checkbox"
                      checked={noExpiry}
                      onChange={(e) => setNoExpiry(e.target.checked)}
                    />
                    <Label check htmlFor="noExpiry">
                      This document has no expiry (lifetime registration)
                    </Label>
                  </FormGroup>
                  <Row className="g-3">
                    <Col sm={6}>
                      <FormGroup className="mb-0">
                        <Label>Issued on</Label>
                        <Input
                          type="date"
                          value={issuedOn}
                          onChange={(e) => setIssuedOn(e.target.value)}
                        />
                      </FormGroup>
                    </Col>
                    <Col sm={6}>
                      <FormGroup className="mb-0">
                        <Label>Valid till</Label>
                        <Input
                          type="date"
                          value={validTill}
                          onChange={(e) => setValidTill(e.target.value)}
                          disabled={noExpiry}
                        />
                      </FormGroup>
                    </Col>
                    <Col xs={12}>
                      <Label>Start renewal before expiry</Label>
                      <div>
                        <ButtonGroup>
                          {LEAD_OPTIONS.map((d) => (
                            <Button
                              key={d}
                              type="button"
                              color={leadDays === d ? "success" : "light"}
                              className={leadDays === d ? "text-white" : "border"}
                              onClick={() => setLeadDays(d)}
                              disabled={noExpiry}
                            >
                              {d} days
                            </Button>
                          ))}
                        </ButtonGroup>
                      </div>
                    </Col>
                  </Row>
                </CardBody>
              </Card>

              <Card className="shadow-sm mb-3">
                <CardBody>
                  <StepTitle n={3}>Documents</StepTitle>
                  <p className="text-muted" style={{ fontSize: 13 }}>
                    PDF, JPG or PNG · up to 10 MB each. The signed certificate is the primary document; add
                    challans or inspection reports as supporting files.
                  </p>
                  <label
                    htmlFor="complianceFiles"
                    className="compliance-dropzone d-flex flex-column align-items-center justify-content-center border border-dashed rounded py-4 mb-3"
                    style={{ cursor: "pointer", background: "#FAFAF8", transition: "all .15s ease" }}
                  >
                    <style>{`
                      .compliance-dropzone:hover {
                        background: #EFF7F3 !important;
                        border-color: #1B4D47 !important;
                      }
                    `}</style>
                    <UploadCloud size={28} className="text-muted mb-2" />
                    <span className="text-muted">Tap to choose files</span>
                    <input
                      id="complianceFiles"
                      type="file"
                      multiple
                      className="d-none"
                      onChange={handleFiles}
                    />
                  </label>
                  <div className="d-flex flex-column gap-2">
                    {files.map((f, idx) => (
                      <div
                        key={`${f.name}-${idx}`}
                        className="d-flex justify-content-between align-items-center border rounded p-2"
                      >
                        <span className="text-truncate" style={{ fontSize: 13 }}>
                          {f.name}
                        </span>
                        <Button color="link" size="sm" className="text-danger" onClick={() => removeFile(idx)}>
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              <Card className="shadow-sm mb-3">
                <CardBody>
                  <StepTitle n={4}>Ownership &amp; notes</StepTitle>
                  <Row className="g-3">
                    <Col sm={6}>
                      <FormGroup className="mb-0">
                        <Label>Responsible owner</Label>
                        <Input value={owner} onChange={(e) => setOwner(e.target.value)} />
                      </FormGroup>
                    </Col>
                    <Col sm={6}>
                      <FormGroup className="mb-0">
                        <Label>Escalate to</Label>
                        <Input value={escalateTo} onChange={(e) => setEscalateTo(e.target.value)} />
                      </FormGroup>
                    </Col>
                    <Col xs={12}>
                      <FormGroup className="mb-0">
                        <Label>Notes / conditions on the licence</Label>
                        <Input
                          type="textarea"
                          rows={3}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="e.g. Conditions imposed, inspection observations"
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                </CardBody>
              </Card>

              <div className="d-flex flex-column flex-sm-row gap-2">
                <Button type="submit" color="success" className="text-white order-sm-3">
                  Save &amp; send for verification
                </Button>
                <Button type="button" color="light" className="border order-sm-2">
                  Save draft
                </Button>
                <Button
                  type="button"
                  color="light"
                  className="border order-sm-1"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Col>

          <Col lg={4}>
            <Card className="shadow-sm mb-3">
              <CardBody>
                <h6 className="mb-3">After saving</h6>
                <div className="d-flex justify-content-between py-1 border-bottom">
                  <span className="text-muted">Item</span>
                  <span className="fw-medium text-end">
                    {category?.short} · {centre?.name}
                  </span>
                </div>
                <div className="d-flex justify-content-between py-1 border-bottom">
                  <span className="text-muted">Status becomes</span>
                  <span className="fw-medium">Valid · pending verification</span>
                </div>
                <div className="d-flex justify-content-between py-1">
                  <span className="text-muted">Previous version</span>
                  <span className="fw-medium">Archived · stays downloadable</span>
                </div>
              </CardBody>
            </Card>

            <Card className="shadow-sm mb-3">
              <CardBody>
                <h6 className="mb-2">Reminders</h6>
                {noExpiry ? (
                  <p className="text-muted mb-0" style={{ fontSize: 13 }}>
                    No reminders — lifetime registration.
                  </p>
                ) : (
                  <ul className="text-muted mb-0 ps-3" style={{ fontSize: 13 }}>
                    {reminderPreview.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                )}
                <p className="text-muted mt-2 mb-0" style={{ fontSize: 12 }}>
                  Scheduling itself is handled by the SOP module, not this screen.
                </p>
              </CardBody>
            </Card>

            <Card className="shadow-sm">
              <CardBody>
                <h6 className="mb-2">Verification</h6>
                <p className="text-muted mb-0" style={{ fontSize: 13 }}>
                  Admin &amp; Legal checks the uploaded certificate against the entered licence number and
                  dates before the status turns final. Every upload, edit and verification is written to the
                  audit log.
                </p>
              </CardBody>
            </Card>
          </Col>
        </Row>
    </div>
  );
};

export default UploadDocument;
