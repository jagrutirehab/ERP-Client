/**
 * Public grievance page — SPDI Rule 5(9).
 *
 * Reachable WITHOUT a login, by design: the people most likely to need it are
 * patients and families who have no dashboard account. It is registered in
 * `publicRoutes` for that reason.
 *
 * The page does two things the Rule asks for — publishes the designated
 * officer's contact details, and states the one-month redress window — and one
 * thing that makes the obligation auditable: every submission is recorded
 * server-side with a receipt number, so "we redressed it within a month" is a
 * query rather than a recollection.
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Form,
  FormFeedback,
  Input,
  Label,
  Row,
  Spinner,
} from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";

import { REDRESS_DAYS } from "./grievanceOfficer";
import { useGrievanceOfficer } from "./useGrievanceOfficer";

// Already ends in /api/v1 — do not add the prefix again.
const API_BASE = process.env.REACT_APP_API_URL || "";

const GrievancePage = () => {
  const [receipt, setReceipt] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const { officer } = useGrievanceOfficer();

  const validation = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      relationToPatient: "",
      subject: "",
      description: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().trim().required("Please enter your name"),
      email: Yup.string()
        .trim()
        .email("Please enter a valid email address")
        .required("Please enter an email we can reply to"),
      phone: Yup.string()
        .trim()
        .matches(/^[0-9+\-\s()]{7,20}$/, "Please enter a valid phone number")
        .required("Please enter a contact number"),
      relationToPatient: Yup.string().trim(),
      subject: Yup.string().trim().required("Please enter a subject"),
      description: Yup.string()
        .trim()
        .min(20, "Please describe the grievance in a little more detail")
        .required("Please describe the grievance"),
    }),
    onSubmit: async (values, { resetForm }) => {
      setSubmitError(null);
      try {
        const { data } = await axios.post(
          `${API_BASE}/grievance`,
          values,
        );
        // The receipt number is the complainant's proof of the date of receipt,
        // which is what the one-month clock runs from.
        setReceipt(data?.payload?.receiptNumber || null);
        resetForm();
      } catch (err) {
        setSubmitError(
          err?.response?.data?.message ||
            "We could not record your grievance just now. Please email the officer directly using the address above.",
        );
      }
    },
  });

  const officerPublished = Boolean(officer?.published);

  return (
    <div className="page-content" style={{ paddingTop: "40px" }}>
      <Container style={{ maxWidth: "860px" }}>
        <h1 className="mb-2">Grievance Redressal</h1>
        <p className="text-muted mb-4">
          If you have a concern about how your personal or health information
          has been collected, used, stored or shared, you can raise it here. We
          will acknowledge your grievance and respond within{" "}
          <strong>{REDRESS_DAYS} days</strong> of receiving it, as required
          under Rule 5(9) of the Information Technology (Reasonable Security
          Practices and Procedures and Sensitive Personal Data or Information)
          Rules, 2011.
        </p>

        <Card className="mb-4">
          <CardBody>
            <h5 className="mb-3">Grievance Officer</h5>

            {officerPublished ? (
              <Row className="gy-2">
                <Col sm={4} className="text-muted">
                  Name
                </Col>
                <Col sm={8}>{officer.name}</Col>

                <Col sm={4} className="text-muted">
                  Designation
                </Col>
                <Col sm={8}>{officer.designation}</Col>

                <Col sm={4} className="text-muted">
                  Email
                </Col>
                <Col sm={8}>
                  <a href={`mailto:${officer.email}`}>
                    {officer.email}
                  </a>
                </Col>

                {officer.phone && (
                  <>
                    <Col sm={4} className="text-muted">
                      Phone
                    </Col>
                    <Col sm={8}>
                      <a href={`tel:${officer.phone}`}>
                        {officer.phone}
                      </a>
                    </Col>
                  </>
                )}

                {officer.address && (
                  <>
                    <Col sm={4} className="text-muted">
                      Address
                    </Col>
                    <Col sm={8}>{officer.address}</Col>
                  </>
                )}

                <Col sm={4} className="text-muted">
                  Hours
                </Col>
                <Col sm={8}>{officer.hours}</Col>
              </Row>
            ) : (
              // Honest fallback. A card with blank fields reads as a broken page
              // and still fails the Rule, so say plainly that it is pending.
              <Alert color="warning" className="mb-0">
                The Grievance Officer's details are being updated. In the
                meantime, please use the form below — your grievance is recorded
                with a receipt number either way, and the response clock starts
                from the moment you submit it.
              </Alert>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h5 className="mb-3">Raise a grievance</h5>

            {receipt && (
              <Alert color="success">
                <div className="fw-semibold mb-1">
                  Your grievance has been recorded.
                </div>
                <div>
                  Receipt number: <strong>{receipt}</strong>. Please keep this
                  for your reference. We will respond within {REDRESS_DAYS}{" "}
                  days.
                </div>
              </Alert>
            )}

            {submitError && <Alert color="danger">{submitError}</Alert>}

            <Form
              onSubmit={(e) => {
                e.preventDefault();
                validation.handleSubmit();
                return false;
              }}
            >
              <Row className="gy-3">
                <Col md={6}>
                  <Label htmlFor="name">Your name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={validation.values.name}
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    invalid={
                      validation.touched.name && !!validation.errors.name
                    }
                  />
                  <FormFeedback>{validation.errors.name}</FormFeedback>
                </Col>

                <Col md={6}>
                  <Label htmlFor="relationToPatient">
                    Your relationship to the patient{" "}
                    <span className="text-muted">(optional)</span>
                  </Label>
                  <Input
                    id="relationToPatient"
                    name="relationToPatient"
                    type="text"
                    placeholder="Self, parent, spouse, guardian…"
                    value={validation.values.relationToPatient}
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                  />
                </Col>

                <Col md={6}>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={validation.values.email}
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    invalid={
                      validation.touched.email && !!validation.errors.email
                    }
                  />
                  <FormFeedback>{validation.errors.email}</FormFeedback>
                </Col>

                <Col md={6}>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={validation.values.phone}
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    invalid={
                      validation.touched.phone && !!validation.errors.phone
                    }
                  />
                  <FormFeedback>{validation.errors.phone}</FormFeedback>
                </Col>

                <Col md={12}>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    value={validation.values.subject}
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    invalid={
                      validation.touched.subject && !!validation.errors.subject
                    }
                  />
                  <FormFeedback>{validation.errors.subject}</FormFeedback>
                </Col>

                <Col md={12}>
                  <Label htmlFor="description">What happened?</Label>
                  <Input
                    id="description"
                    name="description"
                    type="textarea"
                    rows={6}
                    value={validation.values.description}
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    invalid={
                      validation.touched.description &&
                      !!validation.errors.description
                    }
                  />
                  <FormFeedback>{validation.errors.description}</FormFeedback>
                  <div className="form-text">
                    Please do not include more personal or medical detail than
                    you need to explain the grievance.
                  </div>
                </Col>

                <Col md={12}>
                  <Button
                    color="primary"
                    type="submit"
                    disabled={validation.isSubmitting}
                  >
                    {validation.isSubmitting ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Submitting
                      </>
                    ) : (
                      "Submit grievance"
                    )}
                  </Button>
                </Col>
              </Row>
            </Form>
          </CardBody>
        </Card>

        <p className="text-muted mt-4 mb-5 fs-13">
          See also our <Link to="/privacy-policy">Privacy Policy</Link>, which
          explains what information we collect and why.
        </p>
      </Container>
    </div>
  );
};

export default GrievancePage;
