import { format } from "date-fns";
import { Badge, Button, Card, CardBody } from "reactstrap";
import { usePermissions } from "../../Components/Hooks/useRoles";
import RenderWhen from "../../Components/Common/RenderWhen";
import { Sun, Moon, Sunset, CloudSun } from "lucide-react";

const getSessionTheme = (session) => {
  const normalizedSession = session?.toLowerCase() || "";
  switch (normalizedSession) {
    case "morning":
      return {
        background: "linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)",
        icon: <Sun size={24} className="text-white" />,
        textColor: "text-dark",
        badgeColor: "warning",
        borderColor: "#FF9A9E",
        shadow: "0 4px 15px rgba(255, 154, 158, 0.4)",
      };
    case "afternoon":
      return {
        background: "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)",
        icon: <CloudSun size={24} className="text-white" />,
        textColor: "text-dark",
        badgeColor: "info",
        borderColor: "#66a6ff",
        shadow: "0 4px 15px rgba(102, 166, 255, 0.4)",
      };
    case "evening":
      return {
        background:
          "linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)", // Adjusted for sunset vibe
        // Let's try a better sunset gradient
        background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
        icon: <Sunset size={24} className="text-white" />,
        textColor: "text-dark",
        badgeColor: "danger",
        borderColor: "#fa709a",
        shadow: "0 4px 15px rgba(250, 112, 154, 0.4)",
      };
    case "night":
      return {
        background: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
        icon: <Moon size={24} className="text-white" />,
        textColor: "text-white",
        badgeColor: "primary",
        borderColor: "#330867",
        shadow: "0 4px 15px rgba(51, 8, 103, 0.5)",
        isDark: true,
      };
    default:
      return {
        background: "#ffffff",
        icon: <Sun size={24} className="text-black" />,
        textColor: "text-dark",
        badgeColor: "secondary",
        borderColor: "#e9ecef",
        shadow: "0 4px 6px rgba(0,0,0,0.1)",
      };
  }
};

const RoundNoteCard = ({ round, onEdit, onDelete }) => {
  const staffNames = round.roundTakenBy
    ?.map((member) => member?.name)
    .filter(Boolean)
    .join(", ");

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const { loading: permissionLoader, hasPermission } = usePermissions(token);
  const hasIncidentUpdatePermission = hasPermission("ROUND_NOTES", "", "WRITE");
  const hasIncidentDeletePermission = hasPermission(
    "ROUND_NOTES",
    "",
    "DELETE"
  );

  const theme = getSessionTheme(round.roundSession);

  return (
    <Card
      className="mb-4 border-0"
      style={{
        boxShadow: theme.shadow,
        borderRadius: "16px",
        overflow: "hidden",
        transition: "transform 0.2s ease-in-out",
      }}
    >
      {/* Header Section with Gradient */}
      <div
        className="p-3 d-flex justify-content-between align-items-center"
        style={{
          // background: theme.background,
          borderBottom: `1px solid ${theme.borderColor}`,
          color: theme.isDark ? "#fff" : "#343a40",
        }}
      >
        <div className="d-flex align-items-center gap-3">
          <div
            className="d-flex align-items-center justify-content-center bg-white rounded-circle shadow-sm"
            style={{
              background: theme.background,
              width: 45,
              height: 45,
            }}
          >
            {theme.icon}
          </div>
          <div>
            <h5 className="mb-0 fw-bold" style={{ fontSize: "1.1rem" }}>
              {round.roundSession || "Session"} Round
            </h5>
            <small
              className="opacity-75 fw-semibold"
              style={{ fontSize: "0.85rem" }}
            >
              {round.occursAt
                ? format(new Date(round.occursAt), "dd MMM yyyy • hh:mm a")
                : "—"}
            </small>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          {round.center?.title && (
            <Badge
              color="light"
              className="text-dark shadow-sm px-3 py-2 rounded-pill"
            >
              {round.center.title}
            </Badge>
          )}
          <div className="d-flex gap-1">
            <RenderWhen isTrue={hasIncidentUpdatePermission}>
              <Button
                color="light"
                size="sm"
                className="btn-icon rounded-circle shadow-sm"
                onClick={() => onEdit(round)}
                style={{ width: 32, height: 32, padding: 0 }}
                title="Edit"
              >
                <i className="ri-pencil-line align-middle"></i>
              </Button>
            </RenderWhen>
            <RenderWhen isTrue={hasIncidentDeletePermission}>
              <Button
                color="danger"
                size="sm"
                className="btn-icon rounded-circle shadow-sm"
                onClick={() => onDelete(round)}
                style={{ width: 32, height: 32, padding: 0 }}
                title="Delete"
              >
                <i className="ri-delete-bin-line align-middle"></i>
              </Button>
            </RenderWhen>
          </div>
        </div>
      </div>

      <CardBody className="p-0">
        {/* Notes Table */}
        <div className="table-responsive">
          <table className="table table-borderless mb-0">
            <thead className="bg-light text-muted">
              <tr>
                <th className="ps-4 py-3" style={{ width: "15%" }}>
                  Floor
                </th>
                <th className="py-3" style={{ width: "20%" }}>
                  Patient
                </th>
                <th className="py-3" style={{ width: "15%" }}>
                  Notes Applicable To
                </th>
                <th className="pe-4 py-3" style={{ width: "50%" }}>
                  Note
                </th>
              </tr>
            </thead>
            <tbody>
              {round.notes?.length > 0 ? (
                round.notes.map((n, i) => (
                  <tr
                    key={i}
                    className="border-bottom"
                    style={{
                      borderBottom:
                        i === round.notes.length - 1
                          ? "0px solid transparent"
                          : "",
                    }}
                  >
                    <td className="ps-4 py-3 align-middle">
                      <Badge
                        color="primary"
                        className="bg-soft-primary text-primary rounded-pill px-2"
                      >
                        {n.floor || "—"}
                      </Badge>
                    </td>
                    <td className="py-3 align-middle fw-medium text-dark">
                      {n.patient?.name || "General / All"}
                    </td>
                    <td className="py-3 align-middle text-muted">
                      {n.patientsCategory}
                    </td>
                    <td
                      className="pe-4 py-3 align-middle text-muted"
                      style={{ whiteSpace: "pre-wrap", lineHeight: "1.5" }}
                    >
                      {n.note}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-4">
                    <div className="d-flex flex-column align-items-center">
                      <i className="ri-file-list-3-line fs-1 opacity-25 mb-2"></i>
                      <span>No notes added for this round</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-light bg-opacity-50 border-top d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <div className="avatar-xs bg-soft-primary rounded-circle d-flex align-items-center justify-content-center">
              <i className="ri-user-star-line text-primary"></i>
            </div>
            <div>
              <small
                className="text-muted d-block"
                style={{ fontSize: "0.7rem", lineHeight: 1 }}
              >
                Round Taken By
              </small>
              <span
                className="fw-semibold text-dark"
                style={{ fontSize: "0.85rem" }}
              >
                {staffNames || "—"}
              </span>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2 text-end">
            <div>
              <small
                className="text-muted d-block"
                style={{ fontSize: "0.7rem", lineHeight: 1 }}
              >
                Logged by
              </small>
              <span
                className="fw-medium text-dark"
                style={{ fontSize: "0.85rem" }}
              >
                {round.author?.name || "—"}
              </span>
            </div>
            <div className="avatar-xs bg-soft-success rounded-circle d-flex align-items-center justify-content-center">
              <i className="ri-quill-pen-line text-success"></i>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default RoundNoteCard;
