/**
 * Settings screen for the designated Grievance Officer (SPDI Rule 5(9)).
 *
 * What is saved here appears immediately on the public /grievance page and in
 * the privacy policy. That is the point: the Rule requires these details to be
 * PUBLISHED, and a designation that needs a code deploy to correct will
 * eventually be out of date on a public page.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Form,
  Input,
  Label,
  Row,
  Spinner,
} from "reactstrap";
import { toast } from "react-toastify";
import axios from "axios";

import { usePermissions } from "../../../Components/Hooks/useRoles";

const API_BASE = process.env.REACT_APP_API_URL || "";

const EMPTY = {
  name: "",
  designation: "",
  email: "",
  phone: "",
  address: "",
  hours: "Monday to Saturday, 10:00 - 18:00 IST",
};

const GrievanceOfficerSetting = () => {
  const navigate = useNavigate();

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { loading: permissionLoader, hasPermission } = usePermissions(token);

  const canRead = hasPermission("GRIEVANCE", null, "READ");
  const canWrite = hasPermission("GRIEVANCE", null, "WRITE");

  const [form, setForm] = useState(EMPTY);
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    axios
      .get(`${API_BASE}/grievance-officer`)
      .then(({ data }) => {
        if (cancelled || !data?.payload) return;
        const { published: isPublished, updatedAt, ...rest } = data.payload;
        setForm({ ...EMPTY, ...rest });
        setPublished(Boolean(isPublished));
      })
      .catch(() => {
        if (!cancelled) toast.error("Could not load the current details");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await axios.put(`${API_BASE}/grievance-officer`, form);
      setPublished(Boolean(data?.payload?.published));
      toast.success("Grievance Officer updated and published");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Could not save these details",
      );
    } finally {
      setSaving(false);
    }
  };

  if (permissionLoader || loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner color="primary" />
      </div>
    );
  }

  if (!canRead) {
    navigate("/unauthorized");
    return null;
  }

  return (
    <Container fluid className="p-4">
      <h4 className="mb-1">Grievance Officer</h4>
      <p className="text-muted">
        Published on the public grievance page and in our privacy policy, as
        Rule 5(9) of the SPDI Rules, 2011 requires. Grievances must be answered
        within 30 days of receipt.
      </p>

      {!published && (
        <Alert color="warning">
          No Grievance Officer is currently published. Until one is, the public
          page shows a notice instead of contact details &mdash; which does not
          satisfy Rule 5(9).
        </Alert>
      )}

      {!canWrite && (
        <Alert color="light" className="border">
          You have read-only access. Ask an administrator for write access on
          the Grievances module to change these details.
        </Alert>
      )}

      <Card>
        <CardBody>
          <Form onSubmit={save}>
            <Row className="gy-3">
              <Col md={6}>
                <Label htmlFor="go-name">
                  Full name <span className="text-danger">*</span>
                </Label>
                <Input
                  id="go-name"
                  value={form.name}
                  onChange={set("name")}
                  disabled={!canWrite}
                />
              </Col>

              <Col md={6}>
                <Label htmlFor="go-designation">
                  Designation <span className="text-danger">*</span>
                </Label>
                <Input
                  id="go-designation"
                  placeholder="e.g. Chief Operating Officer"
                  value={form.designation}
                  onChange={set("designation")}
                  disabled={!canWrite}
                />
              </Col>

              <Col md={6}>
                <Label htmlFor="go-email">
                  Email <span className="text-danger">*</span>
                </Label>
                <Input
                  id="go-email"
                  type="email"
                  placeholder="grievance@jagrutirehab.org"
                  value={form.email}
                  onChange={set("email")}
                  disabled={!canWrite}
                />
                <div className="form-text">
                  Prefer a role address over a personal one, so the obligation
                  survives the person changing jobs.
                </div>
              </Col>

              <Col md={6}>
                <Label htmlFor="go-phone">Phone</Label>
                <Input
                  id="go-phone"
                  value={form.phone}
                  onChange={set("phone")}
                  disabled={!canWrite}
                />
              </Col>

              <Col md={12}>
                <Label htmlFor="go-address">Postal address</Label>
                <Input
                  id="go-address"
                  type="textarea"
                  rows={2}
                  value={form.address}
                  onChange={set("address")}
                  disabled={!canWrite}
                />
              </Col>

              <Col md={6}>
                <Label htmlFor="go-hours">Contact hours</Label>
                <Input
                  id="go-hours"
                  value={form.hours}
                  onChange={set("hours")}
                  disabled={!canWrite}
                />
              </Col>

              {canWrite && (
                <Col md={12}>
                  <Button color="primary" type="submit" disabled={saving}>
                    {saving ? <Spinner size="sm" /> : "Save and publish"}
                  </Button>
                </Col>
              )}
            </Row>
          </Form>
        </CardBody>
      </Card>
    </Container>
  );
};

export default GrievanceOfficerSetting;
