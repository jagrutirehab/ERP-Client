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
  const hasRead = hasPermission("PATIENTS", "ADDMISSIONSUMMARY", "READ");
  const hasWrite = hasPermission("PATIENTS", "ADDMISSIONSUMMARY", "WRITE");
  const hasDelete = hasPermission("PATIENTS", "ADDMISSIONSUMMARY", "DELETE");
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

  const getInterpretation = (test) => {
    const testName = test?.testName;
    const s = parseInt(test?.systemTotalScore);

    switch (testName) {
      case "YMRS":
        if (s <= 11) return "Normal / Euthymic";
        if (s <= 20) return "Mild Mania";
        if (s <= 25) return "Moderate Mania";
        return "Severe Mania";

      case "CIWA-AR":
        if (s <= 9) return "Mild Withdrawal";
        if (s <= 20) return "Moderate Withdrawal";
        return "Severe Withdrawal";

      case "C-SSRS":
        if (s === 0) return "Minimal Risk";
        if (s <= 2) return "Low Risk";
        if (s <= 4) return "Moderate Risk";
        return "High Risk";

      case "MPQ-9":
        if (parseInt(test?.Psychoticism) >= 3) return "Elevated Psychoticism";
        if (parseInt(test?.Neuroticism) >= 3) return "High Neuroticism";
        if (parseInt(test?.Depression) >= 3) return "Elevated Depression";
        if (parseInt(test?.Hysteria) >= 3) return "Elevated Hysteria";
        if (parseInt(test?.ObsessiveCompulsive) >= 3) return "OCD Tendencies";
        if (parseInt(test?.SomatizationAnxiety) >= 3)
          return "Elevated Somatization";
        return "Within Normal Range";

      case "MMSE":
        if (s >= 25) return "Normal";
        if (s >= 20) return "Mild Impairment";
        if (s >= 10) return "Moderate Impairment";
        return "Severe Impairment";

      case "Y-BOCS":
        if (s <= 7) return "Subclinical";
        if (s <= 15) return "Mild";
        if (s <= 23) return "Moderate";
        if (s <= 31) return "Severe";
        return "Extreme";

      case "ACDS":
        if (s <= 9) return "Minimal";
        if (s <= 19) return "Mild";
        if (s <= 34) return "Moderate";
        return "Extreme";

      case "HAM-A":
        if (s <= 17) return "Mild";
        if (s <= 24) return "Moderate";
        if (s <= 30) return "Severe";
        return "Very Severe";

      case "HAM-D":
        if (s <= 9) return "Minimal";
        if (s <= 13) return "Mild";
        if (s <= 17) return "Moderate";
        return "Severe";

      case "PANSS":
        if (s <= 59) return "Mild / Remitted";
        if (s <= 80) return "Moderate";
        if (s <= 110) return "Severe";
        return "Very Severe";

      case "Morse Fall Scale":
        if (s <= 24) return "No Risk";
        if (s <= 50) return "Low Risk";
        return "High Risk";

      case "Ramsay Sedation Scale":
        if (s === 1) return "Under-sedated";
        if (s <= 3) return "Optimal";
        if (s === 4) return "Adequate";
        if (s === 5) return "Over-sedated";
        return "Deeply Over-sedated";

      case "GCS":
        if (s >= 13) return "Mild Impairment";
        if (s >= 9) return "Moderate Impairment";
        return "Severe Impairment";

      default:
        return null;
    }
  };

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
          {summary?.clinicalTestSummary?.length > 0 && (
            <Card className="mb-3 shadow-none border">
              <CardHeader className="bg-light py-2">
                <h6 className="mb-0 fw-bold text-primary">Clinical Tests</h6>
              </CardHeader>
              <CardBody className="p-0">
                <div className="table-responsive">
                  <table className="table table-bordered table-sm mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ minWidth: "120px" }}>Test Name</th>
                        {[
                          ...new Set(
                            summary?.clinicalTestSummary?.map((t) => t?.date),
                          ),
                        ].map((date) => (
                          <th key={date} style={{ minWidth: "150px" }}>
                            {date}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(
                        summary?.clinicalTestSummary?.reduce((acc, t) => {
                          if (!acc[t?.testName]) acc[t?.testName] = [];
                          acc[t?.testName].push(t);
                          return acc;
                        }, {}) || {},
                      ).map(([testName, tests]) => {
                        const allDates = [
                          ...new Set(
                            summary?.clinicalTestSummary?.map((t) => t?.date),
                          ),
                        ];
                        return (
                          <tr key={testName}>
                            <td className="fw-semibold">{testName}</td>
                            {allDates.map((date) => {
                              const matchingTests = tests?.filter(
                                (t) => t?.date === date,
                              );
                              return (
                                <td key={date}>
                                  {matchingTests?.length > 0 ? (
                                    matchingTests.map((test, idx) => (
                                      <div
                                        key={idx}
                                        className={
                                          idx > 0 ? "mt-2 pt-2 border-top" : ""
                                        }
                                      >
                                        {test?.systemTotalScore &&
                                          test?.systemTotalScore !== "-" && (
                                            <div style={{ fontSize: "0.8rem" }}>
                                              <span className="fw-semibold">
                                                Score:{" "}
                                              </span>
                                              {test?.systemTotalScore}
                                            </div>
                                          )}
                                        {test?.systemInterpretation &&
                                          test?.systemInterpretation !==
                                            "-" && (
                                            <div style={{ fontSize: "0.8rem" }}>
                                              <span className="fw-semibold">
                                                Interpretation:{" "}
                                              </span>
                                              {test?.systemInterpretation.includes(
                                                ":",
                                              ) &&
                                              test?.systemInterpretation.split(
                                                ":",
                                              )[0].length < 30
                                                ? test?.systemInterpretation.split(
                                                    ":",
                                                  )[0]
                                                : getInterpretation(test)}
                                            </div>
                                          )}
                                      </div>
                                    ))
                                  ) : (
                                    <span className="text-muted">-</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          )}
          {summary?.vitalSummary?.length > 0 && (
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
                      {summary?.vitalSummary?.map((v, i) => (
                        <tr key={i}>
                          <td>{v?.date}</td>
                          <td>{v?.bp}</td>
                          <td>{v?.pulse}</td>
                          <td>{v?.temperature}</td>
                          <td>{v?.weight}</td>
                          <td>{v?.spo2}</td>
                          <td>{v?.bloodSugar}</td>
                          <td>{v?.respirationRate}</td>
                          <td>{v?.cns}</td>
                          <td>{v?.cvs}</td>
                          <td>{v?.rs}</td>
                          <td>{v?.pa}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          )}

          {!summary?.vitalSummary?.length &&
            !summary?.clinicalTestSummary?.length && (
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
