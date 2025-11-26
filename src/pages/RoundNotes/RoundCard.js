import { format } from "date-fns";
import { Badge, Button, Card, CardBody } from "reactstrap";
import { usePermissions } from "../../Components/Hooks/useRoles";
import RenderWhen from "../../Components/Common/RenderWhen";

const RoundNoteCard = ({ round, onEdit, onDelete }) => {
  console.log({ round });

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

  return (
    <Card className="mb-3 shadow-sm">
      <CardBody>
        {/* Header */}
        <div className="d-flex justify-content-between flex-wrap gap-2">
          <div>
            <h5 className="mb-1">
              {round.occursAt
                ? format(new Date(round.occursAt), "dd MMM yyyy hh:mm a")
                : "—"}{" "}
              • {round.roundSession}
            </h5>

            <div className="d-flex gap-2 flex-wrap mt-1">
              {/* Center */}
              {round.center?.title && (
                <Badge color="light" className="text-dark border">
                  {round.center.title}
                </Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="d-flex flex-wrap gap-2">
            <RenderWhen isTrue={hasIncidentUpdatePermission}>
              <Button color="light" size="sm" onClick={() => onEdit(round)}>
                Edit
              </Button>
            </RenderWhen>
            <RenderWhen isTrue={hasIncidentDeletePermission}>
              <Button color="danger" size="sm" onClick={() => onDelete(round)}>
                Delete
              </Button>
            </RenderWhen>
          </div>
        </div>

        {/* Notes Table */}
        <div className="mt-3">
          <table className="table table-bordered table-sm">
            <thead>
              <tr>
                <th>Floor</th>
                <th>Patient</th>
                <th>Notes Applicable To</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {round.notes?.length > 0 ? (
                round.notes.map((n, i) => (
                  <tr key={i}>
                    <td>{n.floor || "—"}</td>
                    <td>{n.patient?.name || "General / All"}</td>
                    <td>{n.patientsCategory}</td>
                    <td style={{ whiteSpace: "pre-wrap" }}>{n.note}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-2">
                    No notes added
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="d-flex justify-content-between flex-wrap gap-2 mt-3">
          <div>
            <small className="text-muted d-block fw-semibold">
              Round Taken By
            </small>
            <span>{staffNames || "—"}</span>
          </div>

          <div className="text-end">
            <small className="text-muted d-block">Logged by</small>
            <span>{round.author?.name || "—"}</span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default RoundNoteCard;

// import { format } from "date-fns";
// import { Badge, Button, Card, CardBody } from "reactstrap";

// const RoundNoteCard = ({
//   note,
//   onEdit,
//   onDelete,
//   onCarryForward,
//   onCloseCarryForward,
// }) => {
//   const staffNames = note.roundTakenBy
//     ?.map((member) => member?.name)
//     .filter(Boolean)
//     .join(", ");

//   return (
//     <Card className="mb-3 shadow-sm">
//       <CardBody>
//         <div className="d-flex justify-content-between flex-wrap gap-2">
//           <div>
//             <h5 className="mb-1">
//               {format(new Date(note.occursAt, "dd MMM yyyy hh:mm a"))}{" "}
//               {note.roundSession || "Sess"}
//             </h5>
//             <div className="d-flex gap-2 flex-wrap">
//               <Badge color="light" className="text-dark border">
//                 {note.patient?.name || "General Round"}
//               </Badge>
//               {note.floor && (
//                 <Badge color="info" className="bg-soft">
//                   {note.floor}
//                 </Badge>
//               )}
//               {note.carryForward && (
//                 <Badge
//                   color={
//                     note.carryForwardStatus === "open" ? "warning" : "secondary"
//                   }
//                 >
//                   Carry Forward{" "}
//                   {note.carryForwardStatus === "open" ? "Open" : "Closed"}
//                 </Badge>
//               )}
//             </div>
//           </div>
//           <div className="d-flex flex-wrap gap-2">
//             <Button
//               color="light"
//               size="sm"
//               onClick={() => onCarryForward(note)}
//             >
//               Carry Forward
//             </Button>
//             {note.carryForward && note.carryForwardStatus === "open" && (
//               <Button
//                 color="light"
//                 size="sm"
//                 onClick={() => onCloseCarryForward(note)}
//               >
//                 Mark Closed
//               </Button>
//             )}
//             <Button color="light" size="sm" onClick={() => onEdit(note)}>
//               Edit
//             </Button>
//             <Button color="danger" size="sm" onClick={() => onDelete(note)}>
//               Delete
//             </Button>
//           </div>
//         </div>
//         <p className="text-muted mt-3" style={{ whiteSpace: "pre-wrap" }}>
//           {note.notes}
//         </p>
//         <div className="d-flex justify-content-between flex-wrap gap-2">
//           <div>
//             <small className="text-muted d-block fw-semibold">
//               Round Taken By
//             </small>
//             <span>{staffNames || "—"}</span>
//           </div>
//           <div className="text-end">
//             <small className="text-muted d-block">Logged by</small>
//             <span>{note.createdBy?.name || "—"}</span>
//           </div>
//         </div>
//       </CardBody>
//     </Card>
//   );
// };
