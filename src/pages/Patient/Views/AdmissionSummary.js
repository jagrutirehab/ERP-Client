import React, { useEffect, useState } from "react";
import { Spinner, Card, CardBody, CardHeader } from "reactstrap";
import {
  getAddmissionSummary,
  generateAddmissionSummary,
} from "../../../helpers/backend_helper";
import { normalizeSummary } from "./Components/normalizeSummary";
import { usePermissions } from "../../../Components/Hooks/useRoles";

const AdmissionSummary = ({ patient, addmission }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const user = JSON.parse(localStorage.getItem("micrologin"))?.user?._id;

  const { hasPermission, loading: isLoading } = usePermissions(token);
  const hasUserPermission = hasPermission(
    "PATIENTS",
    "SUMMARYGENERATION",
    "READ",
  );

  const hasRead = hasPermission("PATIENTS", "SUMMARYGENERATION", "READ");
  const hasWrite = hasPermission("PATIENTS", "SUMMARYGENERATION", "WRITE");
  const hasDelete = hasPermission("PATIENTS", "SUMMARYGENERATION", "DELETE");
  const isReadOnly = hasRead && !hasWrite && !hasDelete;

  const load = async () => {
    setLoading(true);
    try {
      const response = await getAddmissionSummary(addmission);
      const raw = response?.data?.summary;
      const normalized = normalizeSummary(raw);
      setSummary(normalized);
    } catch (err) {
      console.log("Error", err);
    } finally {
      setLoading(false);
    }
  };

  const generate = async () => {
    setGenerating(true);
    try {
      await generateAddmissionSummary({ addmission, patient });
      await load();
    } catch (err) {
      console.log("Generate error", err);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    setSummary(null);
    load();
  }, [addmission]);

  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "300px" }}
      >
        <Spinner color="primary" />
      </div>
    );

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between mb-3 align-items-center">
        {summary?.updatedAt && (
          <small className="text-muted">
            Last updated: {summary.updatedAt}
          </small>
        )}
        {!isReadOnly && (
          <button
            className="btn btn-primary btn-sm ms-auto"
            onClick={generate}
            disabled={generating}
          >
            {generating ? (
              <>
                <Spinner size="sm" className="me-1" />
                Generating...
              </>
            ) : (
              "Generate Summary"
            )}
          </button>
        )}
      </div>

      {!summary ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "200px" }}
        >
          <p className="text-muted">
            No summary available. Click Generate Summary to create one.
          </p>
        </div>
      ) : (
        <>
          {summary.vitalSummary?.length > 0 && (
            <Card className="mb-3 shadow-none border">
              <CardHeader className="bg-light py-2">
                <h6 className="mb-0 fw-bold text-primary">Vital Signs</h6>
              </CardHeader>
              <CardBody className="p-0">
                <div className="table-responsive">
                  <table className="table table-bordered table-sm mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Date</th>
                        <th>BP</th>
                        <th>Pulse</th>
                        <th>Temp</th>
                        <th>Weight</th>
                        <th>SpO2</th>
                        <th>Blood Sugar</th>
                        <th>Respiration</th>
                        <th>CNS</th>
                        <th>CVS</th>
                        <th>RS</th>
                        <th>PA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.vitalSummary.map((v, i) => (
                        <tr key={i}>
                          <td>{v.date}</td>
                          <td>{v.bp}</td>
                          <td>{v.pulse}</td>
                          <td>{v.temperature}</td>
                          <td>{v.weight}</td>
                          <td>{v.spo2}</td>
                          <td>{v.bloodSugar}</td>
                          <td>{v.respirationRate}</td>
                          <td>{v.cns}</td>
                          <td>{v.cvs}</td>
                          <td>{v.rs}</td>
                          <td>{v.pa}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          )}

          {summary.clinicalTestSummary?.length > 0 && (
            <Card className="mb-3 shadow-none border">
              <CardHeader className="bg-light py-2">
                <h6 className="mb-0 fw-bold text-primary">Clinical Tests</h6>
              </CardHeader>
              <CardBody className="p-2">
                <div className="d-flex flex-wrap gap-3">
                  {summary.clinicalTestSummary.map((t, i) => (
                    <div
                      key={i}
                      className="border rounded p-2"
                      style={{
                        minWidth: "180px",
                        maxWidth: "180px",
                        minHeight: "200px",
                        maxHeight: "400px",
                        overflowY: "auto",
                      }}
                    >
                      <div
                        className="fw-bold text-primary mb-1"
                        style={{ fontSize: "0.8rem" }}
                      >
                        {t?.testName}
                      </div>
                      <div
                        style={{ fontSize: "0.85rem" }}
                        className="text-muted fw-bold mb-1"
                      >
                        {t?.date}
                      </div>
                      {t?.systemTotalScore && t?.systemTotalScore !== "-" && (
                        <div style={{ fontSize: "0.8rem" }}>
                          <span className="fw-semibold">Score: </span>
                          {t.systemTotalScore}
                        </div>
                      )}
                      {t.systemInterpretation &&
                        t.systemInterpretation !== "-" && (
                          <div style={{ fontSize: "0.8rem" }}>
                            <span className="fw-semibold">
                              Interpretation:{" "}
                            </span>
                            {t.systemInterpretation.split(/:\s(?![^(]*\))/)[0]}
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {!summary.vitalSummary?.length &&
            !summary.clinicalTestSummary?.length && (
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ minHeight: "200px" }}
              >
                <p className="text-muted">
                  No data available for this admission.
                </p>
              </div>
            )}
        </>
      )}
    </div>
  );
};

export default AdmissionSummary;
