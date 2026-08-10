import React, { useEffect, useState } from "react";
import { Card, CardBody, Row, Col, Spinner } from "reactstrap";
import { toast } from "react-toastify";
import { useAuthError } from "../../Components/Hooks/useAuthError";
import {
  exportDoctorDirectory,
  getDoctorDirectory,
} from "../../helpers/backend_helper";

const COLUMNS = [
  { icon: "bx bx-user-voice", label: "Doctor Name" },
  { icon: "bx bx-building-house", label: "Clinic Name" },
  { icon: "bx bx-plus-medical", label: "Specialisation" },
  { icon: "bx bx-phone", label: "Contact Number" },
  { icon: "bx bx-calendar-check", label: "Total Visits" },
  { icon: "bx bx-check-shield", label: "Verified Visits" },
  { icon: "bx bx-error-circle", label: "Mismatch Visits" },
  { icon: "bx bx-time-five", label: "Last Visit Date" },
];

const LAST_EXPORT_KEY = "doctorDirectoryLastExport";

const formatRelativeTime = (isoString) => {
  if (!isoString) return null;
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? "s" : ""} ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
};

const DoctorDirectoryExport = () => {
  const handleAuthError = useAuthError();
  const [isExporting, setIsExporting] = useState(false);
  const [doctorCount, setDoctorCount] = useState(null);
  const [countLoading, setCountLoading] = useState(true);
  const [lastExportedAt, setLastExportedAt] = useState(
    localStorage.getItem(LAST_EXPORT_KEY),
  );

//   useEffect(() => {
//     document.title = "Doctor Directory Export | Jagruti Rehab";
//   }, []);

  useEffect(() => {
    setCountLoading(true);
    getDoctorDirectory({})
      .then((res) => {
        const data = res?.data?.payload || res?.payload || res?.data || [];
        setDoctorCount(data.length);
      })
      .catch(() => setDoctorCount(null))
      .finally(() => setCountLoading(false));
  }, []);

  const handleExportDirectory = async () => {
    setIsExporting(true);
    try {
      const res = await exportDoctorDirectory();
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `Doctor-Directory-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      const now = new Date().toISOString();
      localStorage.setItem(LAST_EXPORT_KEY, now);
      setLastExportedAt(now);

      toast.success("Doctor directory exported successfully");
    } catch (err) {
      if (!handleAuthError(err)) {
        toast.error(err?.response?.data?.message || "Failed to export report");
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-3 p-lg-4 bg-white" style={{ overflowX: "hidden" }}>
      <style>
        {`
          .dde-col-chip {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            background: #f8fafc;
            font-size: 13px;
            color: #334155;
          }
          .dde-col-chip i {
            font-size: 15px;
            color: #1e90ff;
          }
        `}
      </style>

      <Row className="justify-content-center">
        <Col xs={12} xl={10} style={{ minWidth: 0 }}>
          {/* Header */}
          <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom flex-wrap gap-2">
            <div className="d-flex align-items-center gap-3">
              {/* <div
                className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: 44, height: 44, background: "#eff6ff", color: "#1e90ff" }}
              >
                <i className="ri-file-excel-2-line" style={{ fontSize: 22 }} />
              </div> */}
              <div>
                <h4 className="mb-0 fw-semibold">Doctor Directory Export</h4>
                {/* <p className="text-muted fs-13 mb-0 mt-1">
                  Download the full list of doctors visited, along with their
                  engagement stats and GPS verification summary.
                </p> */}
              </div>
            </div>

            {lastExportedAt && (
              <span className="text-muted fs-12 d-flex align-items-center gap-1">
                <i className="bx bx-history" />
                Last exported {formatRelativeTime(lastExportedAt)}
              </span>
            )}
          </div>

          <Row className="g-3">
            {/* Left: Export action card */}
            <Col xs={12} md={5}>
              <Card className="border-0 shadow-sm h-100">
                <CardBody className="p-4 p-lg-5 text-center d-flex flex-column align-items-center justify-content-center h-100">
                  <div
                    className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: 64, height: 64, background: "#eff6ff", color: "#1e90ff" }}
                  >
                    <i className="ri-file-excel-2-line" style={{ fontSize: 30 }} />
                  </div>
                  <h6 className="fw-bold text-dark mb-1">
                    Full Doctor Directory Report
                  </h6>

                  <div className="mb-3">
                    {countLoading ? (
                      <span className="text-muted fs-13">
                        <Spinner size="sm" className="me-1" /> Counting doctors…
                      </span>
                    ) : doctorCount != null ? (
                      <span
                        className="badge rounded-pill fw-semibold px-3 py-2"
                        style={{ background: "#eef2ff", color: "#3577f1", fontSize: 13 }}
                      >
                        {doctorCount} doctor{doctorCount === 1 ? "" : "s"} will be exported
                      </span>
                    ) : null}
                  </div>

                  {/* <p
                    className="text-muted fs-13 mb-4"
                    style={{ maxWidth: 320, margin: "0 auto" }}
                  >
                    One click generates and downloads an Excel file with every
                    doctor currently on record.
                  </p> */}

                  <button
                    className="btn d-flex align-items-center gap-2 mx-auto"
                    onClick={handleExportDirectory}
                    disabled={isExporting}
                    style={{
                      backgroundColor: "#1e90ff",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                      padding: "8px 20px",
                      fontSize: 14,
                      fontWeight: 450,
                    }}
                  >
                    {isExporting ? (
                      <Spinner size="sm" style={{ color: "#fff" }} />
                    ) : (
                      <i className="ri-file-excel-2-line" style={{ fontSize: 16 }} />
                    )}
                    {isExporting ? "Preparing file…" : "Export Excel"}
                  </button>

                  {/* <div className="text-muted fs-12 mt-3 d-flex align-items-center gap-1">
                    <i className="bx bx-file" />
                    Format: .xlsx
                  </div> */}
                </CardBody>
              </Card>
            </Col>

            {/* Right: What's included */}
            <Col xs={12} md={7}>
              <Card className="border-0 shadow-sm h-100">
                <CardBody className="p-4">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <span
                      className="text-uppercase fw-bold text-muted"
                      style={{ fontSize: 11, letterSpacing: "0.05em" }}
                    >
                      Columns included in this report
                    </span>
                    <span className="badge bg-light text-secondary border fs-11">
                      {COLUMNS.length} fields
                    </span>
                  </div>

                  <Row className="g-2">
                    {COLUMNS.map((col, idx) => (
                      <Col xs={12} sm={6} key={idx}>
                        <div className="dde-col-chip">
                          <i className={col.icon} />
                          {col.label}
                        </div>
                      </Col>
                    ))}
                  </Row>

                  <div
                    className="d-flex align-items-start gap-2 mt-4 p-3 rounded-3"
                    style={{ background: "#fffbeb", border: "1px solid #fde68a" }}
                  >
                    <i
                      className="bx bx-info-circle flex-shrink-0"
                      style={{ color: "#b45309", fontSize: 16, marginTop: 2 }}
                    />
                    <div className="text-muted fs-12">
                      One row per unique doctor. Visit counts and mismatch
                      counts reflect all recorded visits to date, across all
                      field agents.
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default DoctorDirectoryExport;