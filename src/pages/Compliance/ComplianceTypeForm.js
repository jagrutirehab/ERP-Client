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
} from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";
import { CENTRES, GROUPS, DEFAULT_COMPLIANCE_TYPES } from "./data";

const LEAD_OPTIONS = [30, 45, 60, 90];

const ComplianceTypeForm = () => {
  const navigate = useNavigate();
  const { typeId } = useParams();

  const existing = useMemo(
    () => (typeId ? DEFAULT_COMPLIANCE_TYPES.find((t) => t.id === typeId) : null),
    [typeId],
  );

  const [name, setName] = useState(existing?.name || "");
  const [group, setGroup] = useState(existing?.group || GROUPS[0]);
  const [hasExpiry, setHasExpiry] = useState(existing ? existing.hasExpiry : true);
  const [leadDays, setLeadDays] = useState(existing?.defaultLeadDays || 60);
  const [authorityHint, setAuthorityHint] = useState(existing?.issuingAuthorityHint || "");
  const [active, setActive] = useState(existing ? existing.active : true);
  const [applicable, setApplicable] = useState(
    () => new Set(existing?.applicableCentreIds || CENTRES.map((c) => c.id)),
  );

  const toggleCentre = (id) =>
    setApplicable((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const groupOptions = GROUPS.map((g) => ({ value: g, label: g }));

  const allSelected = applicable.size === CENTRES.length;
  const toggleAll = () =>
    setApplicable(allSelected ? new Set() : new Set(CENTRES.map((c) => c.id)));

  const handleSubmit = (e) => {
    e.preventDefault();
    // Front-end only demo — nothing is persisted to a server yet.
    toast.success(
      existing ? "Compliance type updated (demo only)." : "Compliance type created (demo only).",
    );
    navigate("/compliance/types");
  };

  return (
    <div className="p-3 p-lg-4">
      <div className="mb-3">
        <h5 className="mb-1 fw-semibold">
          {existing ? "Edit compliance type" : "Add compliance type"}
        </h5>
        <p className="text-muted mb-0 fs-13">
          Define the master licence category, its renewal behaviour and which centres it applies to.
        </p>
      </div>

        <Row>
          <Col lg={8}>
            <form onSubmit={handleSubmit}>
              <Card className="shadow-sm mb-3">
                <CardBody>
                  <h6 className="mb-3">Type details</h6>
                  <Row className="g-3">
                    <Col xs={12}>
                      <FormGroup className="mb-0">
                        <Label>Name</Label>
                        <Input
                          placeholder="e.g. Fire NOC"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </FormGroup>
                    </Col>
                    <Col sm={6}>
                      <FormGroup className="mb-0">
                        <Label>Category</Label>
                        <Select
                          classNamePrefix="react-select"
                          options={groupOptions}
                          value={groupOptions.find((o) => o.value === group)}
                          onChange={(option) => setGroup(option?.value)}
                        />
                      </FormGroup>
                    </Col>
                    <Col sm={6}>
                      <FormGroup className="mb-0">
                        <Label>Issuing authority</Label>
                        <Input
                          placeholder="e.g. Municipal Fire Brigade"
                          value={authorityHint}
                          onChange={(e) => setAuthorityHint(e.target.value)}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                </CardBody>
              </Card>

              <Card className="shadow-sm mb-3">
                <CardBody>
                  <h6 className="mb-3">Renewal behaviour</h6>
                  <FormGroup check className="mb-3">
                    <Input
                      id="typeHasExpiry"
                      type="checkbox"
                      checked={hasExpiry}
                      onChange={(e) => setHasExpiry(e.target.checked)}
                    />
                    <Label check htmlFor="typeHasExpiry">
                      This licence type expires and needs renewal
                    </Label>
                  </FormGroup>
                  {hasExpiry && (
                    <FormGroup className="mb-0">
                      <Label>Default renewal lead time</Label>
                      <div className="d-flex flex-wrap gap-2">
                        {LEAD_OPTIONS.map((d) => (
                          <Button
                            key={d}
                            type="button"
                            size="sm"
                            color={leadDays === d ? "success" : "light"}
                            className={leadDays === d ? "text-white" : "border"}
                            onClick={() => setLeadDays(d)}
                          >
                            {d} days
                          </Button>
                        ))}
                      </div>
                      <div className="text-muted mt-1" style={{ fontSize: 12 }}>
                        Prefills the renewal form; each item can still override this.
                      </div>
                    </FormGroup>
                  )}
                </CardBody>
              </Card>

              <Card className="shadow-sm mb-3">
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0">Applicable centres</h6>
                    <Button type="button" color="link" size="sm" className="p-0" onClick={toggleAll}>
                      {allSelected ? "Clear all" : "Select all"}
                    </Button>
                  </div>
                  <p className="text-muted" style={{ fontSize: 13 }}>
                    Centres left unchecked won&apos;t show this item at all — not as missing, just
                    not applicable.
                  </p>
                  <Row className="g-2">
                    {CENTRES.map((centre) => (
                      <Col xs={6} sm={4} key={centre.id}>
                        <FormGroup check className="mb-0">
                          <Input
                            id={`centre-${centre.id}`}
                            type="checkbox"
                            checked={applicable.has(centre.id)}
                            onChange={() => toggleCentre(centre.id)}
                          />
                          <Label check htmlFor={`centre-${centre.id}`}>
                            {centre.name}
                          </Label>
                        </FormGroup>
                      </Col>
                    ))}
                  </Row>
                </CardBody>
              </Card>

              <Card className="shadow-sm mb-3">
                <CardBody>
                  <FormGroup check className="mb-0">
                    <Input
                      id="typeActive"
                      type="checkbox"
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                    />
                    <Label check htmlFor="typeActive">
                      Active (shows up when adding a compliance item)
                    </Label>
                  </FormGroup>
                </CardBody>
              </Card>

              <div className="d-flex flex-column flex-sm-row gap-2">
                <Button type="submit" color="success" className="text-white order-sm-2">
                  {existing ? "Save changes" : "Create type"}
                </Button>
                <Button
                  type="button"
                  color="light"
                  className="border order-sm-1"
                  onClick={() => navigate("/compliance/types")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Col>

          <Col lg={4}>
            <Card className="shadow-sm">
              <CardBody>
                <h6 className="mb-2">How this is used</h6>
                <p className="text-muted mb-2" style={{ fontSize: 13 }}>
                  This is the master definition — the name, category, renewal lead time and which
                  centres it applies to.
                </p>
                <p className="text-muted mb-0" style={{ fontSize: 13 }}>
                  Adding a type here does not create a tracked item anywhere yet. A centre admin
                  still adds it to that centre&apos;s register when it actually applies there.
                </p>
              </CardBody>
            </Card>
          </Col>
        </Row>
    </div>
  );
};

export default ComplianceTypeForm;
