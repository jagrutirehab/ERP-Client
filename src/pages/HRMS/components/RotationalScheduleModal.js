import { Modal, ModalHeader, ModalBody, Table } from "reactstrap";
import { format, parseISO } from "date-fns";

const timeToMinutes = (time) => {
  if (!time) return null;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const detectRotationalShiftName = (start, end) => {
  if (start == null || end == null) return "";
  if (start >= 360 && start <= 660 && end <= 1200) return "NORMAL";
  if (start < 720 && end <= 960) return "MORNING";
  if (start >= 720 && end <= 1320) return "AFTERNOON";
  if (start >= 1320) return "NIGHT";
  return "";
};

const SHIFT_COLORS = {
  MORNING:   { bg: "#fff3cd", text: "#856404" },
  AFTERNOON: { bg: "#cff4fc", text: "#055160" },
  NIGHT:     { bg: "#e2e3e5", text: "#383d41" },
  NORMAL:    { bg: "#d1e7dd", text: "#0f5132" },
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  try {
    return format(parseISO(dateStr), "dd MMM yyyy");
  } catch {
    return dateStr;
  }
};

const RotationalScheduleModal = ({ isOpen, toggle, record }) => {
  const shifts = record?.rotationalShifts || [];

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="xl">
      <ModalHeader toggle={toggle}>
        Rotational Schedule —{" "}
        {record?.employee?.name
          ? `${record.employee.name} (${record.employee.eCode})`
          : ""}
      </ModalHeader>
      <ModalBody>
        {shifts.length === 0 ? (
          <p className="text-muted text-center">No schedule data available.</p>
        ) : (
          <div className="table-responsive">
            <Table bordered size="sm">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Shift</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((s, idx) => {
                  const startMin = timeToMinutes(s.start);
                  const endMin = timeToMinutes(s.end);
                  const shiftName = detectRotationalShiftName(startMin, endMin);
                  const colors = SHIFT_COLORS[shiftName] || null;

                  return (
                    <tr key={idx}>
                      <td className="text-muted" style={{ width: "40px" }}>{idx + 1}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{formatDate(s.date)}</td>
                      <td>{s.start || "—"}</td>
                      <td>{s.end || "—"}</td>
                      <td>
                        {shiftName && colors ? (
                          <span
                            className="badge"
                            style={{ background: colors.bg, color: colors.text, fontSize: "11px", fontWeight: 600 }}
                          >
                            {shiftName}
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
      </ModalBody>
    </Modal>
  );
};

export default RotationalScheduleModal;
