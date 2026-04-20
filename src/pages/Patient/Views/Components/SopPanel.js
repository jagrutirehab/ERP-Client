import { useEffect, useState } from "react";
import { Collapse } from "reactstrap";
import { connect, useDispatch } from "react-redux";
import { format } from "date-fns";
import { fetchSopOverview } from "../../../../store/features/patient/patientSlice";

const DAILY_TYPES = ["VITAL_SIGN", "COUNSELLING_NOTE"];

const chartTypeLabels = {
  VITAL_SIGN: "Vital Sign",
  COUNSELLING_NOTE: "Counselling Note",
  CLINICAL_NOTE: "Clinical Note",
  RELATIVE_VISIT: "Family Update",
  PRESCRIPTION: "Prescription",
  LAB_REPORT: "Lab Report",
  DETAIL_ADMISSION: "Admission Form",
  MENTAL_EXAMINATION: "Mental Examination",
  DISCHARGE_SUMMARY: "Discharge Summary",
};

const DISPLAY_ORDER = [
  "VITAL_SIGN",
  "COUNSELLING_NOTE",
  "CLINICAL_NOTE",
  "RELATIVE_VISIT",
  "PRESCRIPTION",
  "LAB_REPORT",
  "DETAIL_ADMISSION",
  "MENTAL_EXAMINATION",
  "DISCHARGE_SUMMARY",
];

const statusColors = {
  yes: { bg: "#9AD872", text: "#fff" },
  no: { bg: "#FF8383", text: "#fff" },
};

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  try {
    return format(new Date(dateStr), "dd MMM yyyy");
  } catch {
    return null;
  }
};

const SkeletonItem = () => (
  <div
    className="d-flex flex-column align-items-center gap-1 px-2"
    style={{ minWidth: 90 }}
  >
    <span className="placeholder col-10" style={{ height: 10 }}></span>
    <span className="placeholder col-8" style={{ height: 8 }}></span>
  </div>
);

const SopPanel = ({ patient, addmissionsCharts, sopOverview, sopLoading }) => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(true);

  const activeAdmission = (addmissionsCharts || []).find(
    (a) => !a.dischargeDate,
  );

  useEffect(() => {
    if (activeAdmission?._id) {
      dispatch(
        fetchSopOverview({
          admissionId: activeAdmission._id,
          currentDate: new Date().toISOString(),
        }),
      );
    }
  }, [dispatch, activeAdmission?._id]);

  if (!patient?.isAdmit || !activeAdmission) {
    return null;
  }

  const overview = sopOverview?.sopOverview;

  return (
    <div className="position-relativ">
      <div
        className="position-absolut border rounded py-2 px-3"
        style={{ backgroundColor: "#fafbfc" }}
      >
        <div
          className="d-flex align-items-center justify-content-between"
          style={{ cursor: "pointer" }}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <h6
            className="mb-0 fw-semibold text-muted"
            style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}
          >
            SOP OVERVIEW
          </h6>
          <i
            className={`ri-arrow-${isOpen ? "up" : "down"}-s-line text-muted`}
            style={{ fontSize: "1rem" }}
          ></i>
        </div>
        <Collapse className="" isOpen={isOpen}>
          <div className="d-flex flex-wrap gap-3 mt-2">
            {sopLoading || !overview
              ? Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="placeholder-glow">
                    <SkeletonItem />
                  </div>
                ))
              : DISPLAY_ORDER.map((chartType) => {
                  const data = overview[chartType];
                  if (!data) return null;
                  const isDaily = DAILY_TYPES.includes(chartType);
                  const lastDate = formatDate(data.lastDate);

                  let statusKey = null;
                  if (isDaily && data.lastDate) {
                    statusKey = data.doneYesterday ? "yes" : "no";
                  }
                  const showDot = statusKey !== null;
                  const statusStyle = showDot ? statusColors[statusKey] : null;

                  return (
                    <div
                      key={chartType}
                      className="d-flex flex-column align-items-start"
                      style={{ minWidth: 100 }}
                    >
                      <div className="d-flex align-items-center gap-1">
                        {showDot && (
                          <span
                            className="rounded-circle d-inline-block"
                            style={{
                              width: 8,
                              height: 8,
                              backgroundColor: statusStyle.bg,
                              flexShrink: 0,
                            }}
                          ></span>
                        )}
                        <span
                          className="fw-medium text-dark"
                          style={{ fontSize: "0.75rem" }}
                        >
                          {chartTypeLabels[chartType]}
                        </span>
                      </div>
                      <span
                        className="text-muted"
                        style={{
                          fontSize: "0.7rem",
                          paddingLeft: showDot ? 14 : 0,
                        }}
                      >
                        {lastDate || "Not yet"}
                      </span>
                    </div>
                  );
                })}
          </div>
        </Collapse>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  patient: state.Patient.patient,
  addmissionsCharts: state.Chart.data,
  sopOverview: state.Patient.sopOverview,
  sopLoading: state.Patient.sopLoading,
});

export default connect(mapStateToProps)(SopPanel);
