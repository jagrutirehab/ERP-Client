import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardBody, Table, Spinner, Alert, Button, Row, Col } from "reactstrap";
import { CSVLink } from "react-csv";
import Select from "react-select";
import { fetchTrainingFormsWeekly, fetchAuditDaily } from "../../../store/features/miReporting/miReportingSlice";

const AUDIT_FIELD_OPTIONS = [
  { value: "audit_sod", label: "SOD" },
  { value: "audit_eod", label: "EOD" },
];

const formatChecklistDate = (dateStr) => {
  if (!dateStr) return "";
  const [, month, day] = dateStr.split("-");
  const monthIdx = parseInt(month, 10) - 1;
  return `${day}-${MONTHS[monthIdx]}`;
};

const FORM_ROWS = [
  { label: "Frisking", key: "frisking" },
  { label: "Form-1 Nursing Staff Training", key: "form_1" },
  { label: "Form-2 Patient Care Training", key: "form_2" },
  { label: "Form-3 Psychologist Training Pointers", key: "form_3" },
  { label: "Form-4 MSW/New Joinee Training", key: "form_4" },
  { label: "Multidisciplinary Meeting", key: "multidisciplinary_meeting" },
  
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const ordinal = (day) => {
  if (day > 3 && day < 21) return `${day}th`;
  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
};

const formatWeekRange = (weekStr) => {
  if (!weekStr) return "";
  const [startPart, endPart] = weekStr.split(" - ");
  if (!startPart || !endPart) return weekStr;

  const formatPart = (part) => {
    const [day, month] = part.trim().split(" ");
    return `${ordinal(parseInt(day, 10))} ${month}`;
  };

  return `${formatPart(startPart)}–${formatPart(endPart)}`;
};

const parseWeekEndDate = (weekStr) => {
  if (!weekStr) return new Date(0);
  const [, endPart] = weekStr.split(" - ");
  if (!endPart) return new Date(0);
  const [day, month, year] = endPart.trim().split(" ");
  const monthIdx = MONTHS.indexOf(month);
  return new Date(parseInt(year, 10), monthIdx, parseInt(day, 10));
};

const headerStyle = {
  border: "1px solid #cfd8e3",
  background: "#004d00",
  color: "white",
  whiteSpace: "nowrap",
  position: "sticky",
  top: 0,
  zIndex: 2,
};

const cellStyle = (idx) => ({
  border: "1px solid #d6dde8",
  background: idx % 2 === 0 ? "#f8fafc" : "#fff",
  whiteSpace: "nowrap",
});

const totalCellStyle = {
  border: "1px solid #9bbcf3",
  background: "#dbeafe",
  color: "#1d4ed8",
};

const AuditForms = () => {
  const dispatch = useDispatch();
  const { trainingFormsWeekly, auditDaily, loading, error } = useSelector(
    (state) => state.MIReporting
  );
  const centerAccess = useSelector((state) => state.User?.centerAccess || []);
  const data = trainingFormsWeekly?.data;
  const checklistData = auditDaily?.data;

  const [selectedCenter, setSelectedCenter] = useState("");
  const [selectedFormType, setSelectedFormType] = useState(FORM_ROWS[0].key);
  const [selectedAuditField, setSelectedAuditField] = useState("audit_eod");
  const [csvData, setCsvData] = useState([]);
  const [csvLoading, setCsvLoading] = useState(false);
  const csvRef = useRef();

  useEffect(() => {
    dispatch(fetchTrainingFormsWeekly({ centerAccess }));
    dispatch(fetchAuditDaily({ centerAccess }));
  }, [dispatch, centerAccess]);

  const centers = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    return Array.from(new Set(data.map((item) => item.center_name))).sort();
  }, [data]);

  const weeks = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    const map = new Map();
    data.forEach((item) => {
      if (!map.has(item.week)) {
        map.set(item.week, { week: item.week, week_name: item.week_name });
      }
    });
    return Array.from(map.values()).sort(
      (a, b) => parseWeekEndDate(b.week) - parseWeekEndDate(a.week)
    );
  }, [data]);

  const pivot = React.useMemo(() => {
    const map = {};
    (data || []).forEach((item) => {
      if (!map[item.center_name]) map[item.center_name] = {};
      map[item.center_name][item.week] = item;
    });
    return map;
  }, [data]);

  const centerOptions = [
    { value: "ALL", label: "All Centers" },
    ...centers.map((center) => ({
      value: center,
      label: center,
    })),
  ];

  const activeCenter = selectedCenter || "ALL";

  const getValue = (formKey, week) => {
    if (activeCenter === "ALL") {
      return centers.reduce(
        (sum, center) => sum + (pivot[center]?.[week]?.[formKey] ?? 0),
        0
      );
    }
    return pivot[activeCenter]?.[week]?.[formKey] ?? 0;
  };

  const formOptions = FORM_ROWS.map(({ label, key }) => ({
    value: key,
    label,
  }));

  const getCenterWeekValue = (center, week) =>
    pivot[center]?.[week]?.[selectedFormType] ?? 0;

  const weekTotals = React.useMemo(() => {
    const totals = {};
    weeks.forEach(({ week }) => {
      totals[week] = centers.reduce(
        (sum, center) => sum + (pivot[center]?.[week]?.[selectedFormType] ?? 0),
        0
      );
    });
    return totals;
  }, [centers, weeks, pivot, selectedFormType]);

  const checklistDates = React.useMemo(() => {
    if (!checklistData || checklistData.length === 0) return [];
    return Array.from(new Set(checklistData.map((item) => item.date))).sort(
      (a, b) => (a < b ? 1 : -1)
    );
  }, [checklistData]);

  const checklistCenters = React.useMemo(() => {
    if (!checklistData || checklistData.length === 0) return [];
    return Array.from(new Set(checklistData.map((item) => item.center_name))).sort();
  }, [checklistData]);

  const checklistPivot = React.useMemo(() => {
    const map = {};
    (checklistData || []).forEach((item) => {
      if (!map[item.center_name]) map[item.center_name] = {};
      map[item.center_name][item.date] = item;
    });
    return map;
  }, [checklistData]);

  const getChecklistValue = (center, date) =>
    checklistPivot[center]?.[date]?.[selectedAuditField] ?? "";

  const checklistTotals = React.useMemo(() => {
    const totals = {};
    checklistDates.forEach((date) => {
      totals[date] = checklistCenters.reduce(
        (sum, center) =>
          sum + (checklistPivot[center]?.[date]?.[selectedAuditField] === "Yes" ? 1 : 0),
        0
      );
    });
    return totals;
  }, [checklistCenters, checklistDates, checklistPivot, selectedAuditField]);

  const csvHeaders = React.useMemo(() => {
    const headers = [{ label: "Form Type", key: "form" }];
    weeks.forEach(({ week, week_name }) => {
      headers.push({ label: `${week_name} (${formatWeekRange(week)})`, key: week });
    });
    return headers;
  }, [weeks]);

  const prepareCsvData = () => {
    setCsvLoading(true);

    const rows = FORM_ROWS.map(({ label, key }) => {
      const row = { form: label };
      weeks.forEach(({ week }) => {
        row[week] = getValue(key, week);
      });
      return row;
    });

    setCsvData(rows);

    setTimeout(() => {
      csvRef.current.link.click();
      setCsvLoading(false);
    }, 100);
  };

  document.title = "Forms Data";

  return (
    <div className="mt-4 mt-sm-0">
      <div className="p-3 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <i className="bx bx-clipboard fs-1 me-3"></i>
          <h6 className="text-truncate mb-0 fs-18">Training Forms - Weekly</h6>
        </div>

        <Button
          color="info"
          size="sm"
          onClick={prepareCsvData}
          disabled={csvLoading || loading || weeks.length === 0}
        >
          {csvLoading ? "Preparing CSV..." : "Export CSV"}
        </Button>
        <CSVLink
          data={csvData || []}
          filename="training-forms-weekly.csv"
          headers={csvHeaders}
          className="d-none"
          ref={csvRef}
        />
      </div>

      <div className="px-3 pb-3">
        {centerAccess.length > 1 && (
          <Row className="g-2 align-items-center mb-3">
            <Col xs="auto" className="fw-semibold">
              Select Centre--&gt;
            </Col>
            <Col xs="auto">
              <Select
                value={centerOptions.find((o) => o.value === activeCenter) || null}
                onChange={(opt) => setSelectedCenter(opt?.value || "")}
                options={centerOptions}
                placeholder="Center..."
                styles={{ container: (b) => ({ ...b, minWidth: 200 }) }}
              />
            </Col>
          </Row>
        )}

        <Card className="shadow-sm" style={{ border: "1px solid #cfd8e3", borderRadius: 10, display: "inline-block", width: "auto", maxWidth: "100%" }}>
          <CardBody className="p-0">
            {loading && (
              <div className="text-center py-4">
                <Spinner color="primary" />
                <p className="mt-2 text-muted mb-0">Loading data...</p>
              </div>
            )}

            {error && !loading && <Alert color="danger" className="m-3">{error}</Alert>}

            {!loading && !error && (
              <div style={{ overflowX: "auto" }}>
                <Table
                  className="mb-0"
                  style={{ borderCollapse: "collapse", fontSize: "0.7rem", width: "max-content" }}
                >
                  <thead>
                    <tr>
                      <th className="text-center fw-bold px-1 py-1" style={{ ...headerStyle, minWidth: 180 }}></th>
                      {weeks.map(({ week }) => (
                        <th key={week} className="text-center fw-bold px-1 py-1" style={{ ...headerStyle, minWidth: 85 }}>
                          {formatWeekRange(week)}
                        </th>
                      ))}
                    </tr>
                    <tr>
                      <th className="text-start fw-bold px-1 py-1" style={{ ...headerStyle, minWidth: 180 }}>
                        Form Type
                      </th>
                      {weeks.map(({ week, week_name }) => (
                        <th key={week} className="text-center fw-bold px-1 py-1" style={{ ...headerStyle, minWidth: 85 }}>
                          {week_name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {weeks.length > 0 ? (
                      FORM_ROWS.map(({ label, key }, idx) => (
                        <tr key={key}>
                          <td className="px-1 py-1 fw-semibold" style={cellStyle(idx)}>
                            {label}
                          </td>
                          {weeks.map(({ week }) => (
                            <td key={week} className="text-center px-1 py-1" style={cellStyle(idx)}>
                              {getValue(key, week)}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={1} className="text-center text-muted py-4" style={{ border: "1px solid #d6dde8" }}>
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            )}
          </CardBody>
        </Card>

        <h6 className="mt-4 mb-0">Training Data</h6>
        <Row className="g-2 align-items-center mb-3 mt-2">
          <Col xs="auto" className="fw-semibold">
            Select Data--&gt;
          </Col>
          <Col xs="auto">
            <Select
              value={formOptions.find((o) => o.value === selectedFormType) || formOptions[0]}
              onChange={(opt) => setSelectedFormType(opt.value)}
              options={formOptions}
              placeholder="Select data..."
              styles={{ container: (b) => ({ ...b, minWidth: 260 }) }}
            />
          </Col>
        </Row>

        <Card className="shadow-sm" style={{ border: "1px solid #cfd8e3", borderRadius: 10, display: "inline-block", width: "auto", maxWidth: "100%" }}>
          <CardBody className="p-0">
            {loading && (
              <div className="text-center py-4">
                <Spinner color="primary" />
                <p className="mt-2 text-muted mb-0">Loading data...</p>
              </div>
            )}

            {error && !loading && <Alert color="danger" className="m-3">{error}</Alert>}

            {!loading && !error && (
              <div style={{ overflowX: "auto" }}>
                <Table
                  className="mb-0"
                  style={{ borderCollapse: "collapse", fontSize: "0.7rem", width: "max-content" }}
                >
                  <thead>
                    <tr>
                      <th className="text-center fw-bold px-1 py-1" style={{ ...headerStyle, minWidth: 130 }}></th>
                      {weeks.map(({ week }) => (
                        <th key={week} className="text-center fw-bold px-1 py-1" style={{ ...headerStyle, minWidth: 85 }}>
                          {formatWeekRange(week)}
                        </th>
                      ))}
                    </tr>
                    <tr>
                      <th className="text-start fw-bold px-1 py-1" style={{ ...headerStyle, minWidth: 130 }}>
                        Center name
                      </th>
                      {weeks.map(({ week, week_name }) => (
                        <th key={week} className="text-center fw-bold px-1 py-1" style={{ ...headerStyle, minWidth: 85 }}>
                          {week_name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {centers.length > 0 ? (
                      <>
                        {centers.map((center, idx) => (
                          <tr key={center}>
                            <td className="px-1 py-1 fw-semibold" style={cellStyle(idx)}>
                              {center}
                            </td>
                            {weeks.map(({ week }) => (
                              <td key={week} className="text-center px-1 py-1" style={cellStyle(idx)}>
                                {getCenterWeekValue(center, week)}
                              </td>
                            ))}
                          </tr>
                        ))}
                        <tr>
                          <td className="px-1 py-1 fw-bold" style={{ ...totalCellStyle, color: "black" }}>
                            Total
                          </td>
                          {weeks.map(({ week }) => (
                            <td key={week} className="text-center px-1 py-1 fw-bold" style={totalCellStyle}>
                              {weekTotals[week] ?? 0}
                            </td>
                          ))}
                        </tr>
                      </>
                    ) : (
                      <tr>
                        <td colSpan={1} className="text-center text-muted py-4" style={{ border: "1px solid #d6dde8" }}>
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            )}
          </CardBody>
        </Card>

        <h6 className="mt-4 mb-0">Checklist Data</h6>
        <Row className="g-2 align-items-center mb-3 mt-2">
          <Col xs="auto" className="fw-semibold">
            Select Data--&gt;
          </Col>
          <Col xs="auto">
            <Select
              value={AUDIT_FIELD_OPTIONS.find((o) => o.value === selectedAuditField) || AUDIT_FIELD_OPTIONS[1]}
              onChange={(opt) => setSelectedAuditField(opt.value)}
              options={AUDIT_FIELD_OPTIONS}
              placeholder="Select data..."
              styles={{ container: (b) => ({ ...b, minWidth: 160 }) }}
            />
          </Col>
        </Row>

        <Card className="shadow-sm" style={{ border: "1px solid #cfd8e3", borderRadius: 10 }}>
          <CardBody className="p-0">
            {loading && (
              <div className="text-center py-4">
                <Spinner color="primary" />
                <p className="mt-2 text-muted mb-0">Loading data...</p>
              </div>
            )}

            {error && !loading && <Alert color="danger" className="m-3">{error}</Alert>}

            {!loading && !error && (
              <div style={{ overflowX: "scroll", overflowY: "auto", maxHeight: "60vh", width: "100%" }}>
                <Table
                  className="mb-0"
                  style={{ borderCollapse: "separate", borderSpacing: 0, fontSize: "0.68rem", width: "max-content" }}
                >
                  <thead>
                    <tr>
                      <th className="text-start fw-bold px-1 py-1" style={{ ...headerStyle, minWidth: 130, position: "sticky", left: 0, zIndex: 3 }}>
                        Center Name
                      </th>
                      {checklistDates.map((date) => (
                        <th key={date} className="text-center fw-bold px-1 py-1" style={headerStyle}>
                          {formatChecklistDate(date)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {checklistCenters.length > 0 ? (
                      <>
                        {checklistCenters.map((center, idx) => (
                          <tr key={center}>
                            <td className="px-1 py-1 fw-semibold" style={{ ...cellStyle(idx), position: "sticky", left: 0, zIndex: 1 }}>
                              {center}
                            </td>
                            {checklistDates.map((date) => (
                              <td key={date} className="text-center px-1 py-1" style={cellStyle(idx)}>
                                {getChecklistValue(center, date)}
                              </td>
                            ))}
                          </tr>
                        ))}
                        <tr>
                          <td className="px-1 py-1 fw-bold" style={{ ...totalCellStyle, color: "black", position: "sticky", left: 0, zIndex: 1 }}>
                            Total
                          </td>
                          {checklistDates.map((date) => (
                            <td key={date} className="text-center px-1 py-1 fw-bold" style={totalCellStyle}>
                              {checklistTotals[date] ?? 0}
                            </td>
                          ))}
                        </tr>
                      </>
                    ) : (
                      <tr>
                        <td colSpan={1} className="text-center text-muted py-4" style={{ border: "1px solid #d6dde8" }}>
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default AuditForms;
