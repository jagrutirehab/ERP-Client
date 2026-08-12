import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardBody, Table, Spinner, Alert, Row, Col } from "reactstrap";
import Select from "react-select";
import { fetchDoctorPsychologistStayRange } from "../../../store/features/miReporting/miReportingSlice";

const ROLE_OPTIONS = [
  { value: "DOCTOR", label: "Doctor" },
  { value: "PSYCHOLOGIST", label: "Psychologist" },
];

const DATA_OPTIONS = [
  { value: "COUNT", label: "No. of Patients" },
  { value: "AVG_DAYS", label: "Average Days" },
];

const FORMAT_OPTIONS = [
  { value: "NUMBER", label: "Number" },
  { value: "PERCENTAGE", label: "Percentage" },
];

const DAYS_RANGE_OPTIONS = [
  { value: "OVERALL", label: "Overall" },
  { value: "0-15", label: "0-15" },
  { value: "16-30", label: "16-30" },
  { value: "31-45", label: "31-45" },
  { value: "46-60", label: "46-60" },
  { value: ">60", label: ">60" },
];

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

const DoctorPsychologistStayRange = () => {
  const dispatch = useDispatch();
  const { doctorPsychologistStayRange, loading, error } = useSelector(
    (state) => state.MIReporting
  );
  const centerAccess = useSelector((state) => state.User?.centerAccess || []);
  const data = useMemo(() => doctorPsychologistStayRange?.data || [], [doctorPsychologistStayRange]);

  const [selectedRole, setSelectedRole] = useState("DOCTOR");
  const [selectedCenter, setSelectedCenter] = useState("ALL");
  const [selectedData, setSelectedData] = useState("COUNT");
  const [selectedFormat, setSelectedFormat] = useState("NUMBER");
  const [selectedDaysRange, setSelectedDaysRange] = useState("OVERALL");

  useEffect(() => {
    dispatch(fetchDoctorPsychologistStayRange({ centerAccess }));
  }, [dispatch, centerAccess]);

  const roleData = useMemo(
    () => data.filter((item) => item.role === selectedRole),
    [data, selectedRole]
  );

  const centerOptions = useMemo(() => [
    { value: "ALL", label: "All Centers" },
    ...[...new Set(roleData.map((item) => item.current_center))].filter(Boolean).sort().map((center) => ({
      value: center,
      label: center,
    })),
  ], [roleData]);

  useEffect(() => {
    if (selectedCenter === "ALL") return;
    if (!centerOptions.some((o) => o.value === selectedCenter)) {
      setSelectedCenter("ALL");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerOptions]);

  const filteredData = useMemo(() => {
    if (selectedCenter === "ALL") return roleData;
    return roleData.filter((item) => item.current_center === selectedCenter);
  }, [roleData, selectedCenter]);

  const months = useMemo(() => {
    return Array.from(
      new Set(filteredData.map((item) => item.month).filter(Boolean))
    ).sort((a, b) => new Date(b) - new Date(a));
  }, [filteredData]);

  const people = useMemo(() => {
    const map = new Map();
    filteredData.forEach((item) => {
      if (!map.has(item.user_id)) {
        map.set(item.user_id, {
          userId: item.user_id,
          name: item.name,
          center: item.current_center,
          currentPatientsCount: item.current_patients_count,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [filteredData]);

  const pivot = useMemo(() => {
    const map = {};
    filteredData.forEach((item) => {
      if (!item.month) return;
      if (!map[item.user_id]) map[item.user_id] = {};
      map[item.user_id][item.month] = item;
    });
    return map;
  }, [filteredData]);

  const getRawValue = (userId, month) => {
    const record = pivot[userId]?.[month];
    if (!record) return { value: 0, total: 0 };

    if (selectedData === "AVG_DAYS") {
      const value = selectedDaysRange === "OVERALL"
        ? record.overall ?? 0
        : record[`${selectedDaysRange}_avg`] ?? 0;
      return { value, total: record.total_patients ?? 0 };
    }

    const value = selectedDaysRange === "OVERALL"
      ? record.total_patients ?? 0
      : record[selectedDaysRange] ?? 0;
    return { value, total: record.total_patients ?? 0 };
  };

  const formatValue = (raw) => {
    if (selectedData === "AVG_DAYS") {
      return Number(raw.value ?? 0).toFixed(1);
    }
    if (selectedFormat === "PERCENTAGE") {
      if (!raw.total) return "0%";
      return `${Math.round((raw.value / raw.total) * 100)}%`;
    }
    return raw.value ?? 0;
  };

  const totals = useMemo(() => {
    const result = {};
    months.forEach((month) => {
      const totalRaw = people.reduce(
        (acc, person) => {
          const raw = getRawValue(person.userId, month);
          acc.value += Number(raw.value) || 0;
          acc.total += Number(raw.total) || 0;
          return acc;
        },
        { value: 0, total: 0 }
      );

      if (selectedData === "AVG_DAYS") {
        result[month] = people.length > 0 ? totalRaw.value / people.length : 0;
      } else {
        result[month] = totalRaw;
      }
    });
    return result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [people, months, pivot, selectedData, selectedDaysRange]);

  const formatTotal = (month) => {
    if (selectedData === "AVG_DAYS") {
      return Number(totals[month] ?? 0).toFixed(1);
    }
    const raw = totals[month] || { value: 0, total: 0 };
    if (selectedFormat === "PERCENTAGE") {
      if (!raw.total) return "0%";
      return `${Math.round((raw.value / raw.total) * 100)}%`;
    }
    return raw.value ?? 0;
  };

  document.title = "Doctor/Psychologist Stay Range";

  return (
    <div className="mt-4 mt-sm-0" style={{ flex: 1, width: "100%", maxWidth: "100%", minWidth: 0 }}>
      <div className="p-3 d-flex align-items-center">
        <i className="bx bx-time-five fs-1 me-3"></i>
        <h6 className="text-truncate mb-0 fs-18">Doctor/Psychologist Stay Range</h6>
      </div>

      <div className="px-3 pb-3">
        <Row className="g-2 align-items-center mb-3">
          <Col xs="auto">
            <Select
              value={ROLE_OPTIONS.find((o) => o.value === selectedRole)}
              onChange={(opt) => setSelectedRole(opt.value)}
              options={ROLE_OPTIONS}
              placeholder="Role..."
              styles={{ container: (b) => ({ ...b, minWidth: 160 }) }}
            />
          </Col>
          <Col xs="auto">
            <Select
              value={centerOptions.find((o) => o.value === selectedCenter) || centerOptions[0]}
              onChange={(opt) => setSelectedCenter(opt.value)}
              options={centerOptions}
              placeholder="Center..."
              styles={{ container: (b) => ({ ...b, minWidth: 180 }) }}
            />
          </Col>
          <Col xs="auto">
            <Select
              value={DATA_OPTIONS.find((o) => o.value === selectedData)}
              onChange={(opt) => setSelectedData(opt.value)}
              options={DATA_OPTIONS}
              placeholder="Data..."
              styles={{ container: (b) => ({ ...b, minWidth: 160 }) }}
            />
          </Col>
          <Col xs="auto">
            <Select
              value={FORMAT_OPTIONS.find((o) => o.value === selectedFormat)}
              onChange={(opt) => setSelectedFormat(opt.value)}
              options={FORMAT_OPTIONS}
              placeholder="Format..."
              isDisabled={selectedData === "AVG_DAYS"}
              styles={{ container: (b) => ({ ...b, minWidth: 150 }) }}
            />
          </Col>
          <Col xs="auto">
            <Select
              value={DAYS_RANGE_OPTIONS.find((o) => o.value === selectedDaysRange)}
              onChange={(opt) => setSelectedDaysRange(opt.value)}
              options={DAYS_RANGE_OPTIONS}
              placeholder="Days Range..."
              styles={{ container: (b) => ({ ...b, minWidth: 150 }) }}
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
                      <th className="text-start fw-bold px-1 py-1" style={{ ...headerStyle, minWidth: 160, position: "sticky", left: 0, zIndex: 3 }}>
                        {selectedRole === "PSYCHOLOGIST" ? "Psychologist Name" : "Doctor Name"}
                      </th>
                      <th className="text-center fw-bold px-1 py-1" style={{ ...headerStyle, minWidth: 110, position: "sticky", left: 160, zIndex: 3 }}>
                        Center Name
                      </th>
                      <th className="text-center fw-bold px-1 py-1" style={{ ...headerStyle, minWidth: 110, position: "sticky", left: 270, zIndex: 3 }}>
                        Current Patient Count
                      </th>
                      {months.map((month) => (
                        <th key={month} className="text-center fw-bold px-1 py-1" style={{ ...headerStyle, minWidth: 85 }}>
                          {month}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {people.length > 0 ? (
                      <>
                        {people.map((person, idx) => (
                          <tr key={person.userId}>
                            <td className="px-1 py-1 fw-semibold" style={{ ...cellStyle(idx), position: "sticky", left: 0, zIndex: 1 }}>
                              {person.name}
                            </td>
                            <td className="text-center px-1 py-1" style={{ ...cellStyle(idx), position: "sticky", left: 160, zIndex: 1 }}>
                              {person.center}
                            </td>
                            <td className="text-center px-1 py-1" style={{ ...cellStyle(idx), position: "sticky", left: 270, zIndex: 1 }}>
                              {person.currentPatientsCount ?? 0}
                            </td>
                            {months.map((month) => (
                              <td key={month} className="text-center px-1 py-1" style={cellStyle(idx)}>
                                {formatValue(getRawValue(person.userId, month))}
                              </td>
                            ))}
                          </tr>
                        ))}
                        <tr>
                          <td className="px-1 py-1 fw-bold" style={{ ...totalCellStyle, color: "black", position: "sticky", left: 0, zIndex: 1 }}>
                            Total
                          </td>
                          <td className="text-center px-1 py-1 fw-bold" style={{ ...totalCellStyle, position: "sticky", left: 160, zIndex: 1 }}></td>
                          <td className="text-center px-1 py-1 fw-bold" style={{ ...totalCellStyle, position: "sticky", left: 270, zIndex: 1 }}></td>
                          {months.map((month) => (
                            <td key={month} className="text-center px-1 py-1 fw-bold" style={totalCellStyle}>
                              {formatTotal(month)}
                            </td>
                          ))}
                        </tr>
                      </>
                    ) : (
                      <tr>
                        <td colSpan={months.length + 3} className="text-center text-muted py-4" style={{ border: "1px solid #d6dde8" }}>
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

export default DoctorPsychologistStayRange;
