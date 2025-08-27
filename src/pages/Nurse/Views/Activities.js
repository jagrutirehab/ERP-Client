import { useEffect, useState } from "react";
import GeneralCard from "../../Patient/Views/Components/GeneralCard";
import { Row, Nav, NavItem, NavLink, Badge, Collapse } from "reactstrap";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getMedicineActivitiesByStatus, getTodayCompletedActiveMedicines } from "../../../store/features/nurse/nurseSlice";
import Placeholder from "../../Patient/Views/Components/Placeholder";
import {
  CheckCircle,
  Clock,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  Calendar,
  XCircle,
} from "lucide-react";
import ActivityCard from "./Components/ActivityCard";

const Activities = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { medicineLoading, medicines } = useSelector((state) => state.Nurse);
  const [activeTab, setActiveTab] = useState("COMPLETED");

  const toggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  useEffect(() => {
    if (!id || id === "*") return;
    if (activeTab === "COMPLETED") {
      dispatch(
        getMedicineActivitiesByStatus({ patientId: id, status: "completed" })
      );
    } else if (activeTab === "MISSED") {
      dispatch(
        getMedicineActivitiesByStatus({ patientId: id, status: "missed" })
      );
    }
  }, [activeTab, id, dispatch]);

  return (
    <div>
      <Row className="timeline-right" style={{ rowGap: "2rem" }}>
        <GeneralCard data="Daily Medication Record">
          <div style={{ padding: "1rem" }}>
            <Nav tabs className="mb-4">
              <NavItem>
                <NavLink
                  className={`cursor-pointer ${
                    activeTab === "COMPLETED" ? "active" : ""
                  }`}
                  onClick={() => toggle("COMPLETED")}
                >
                  <div className="d-flex align-items-center gap-2">
                    <CheckCheck size={16} className="text-success" />
                    Completed
                  </div>
                </NavLink>
              </NavItem>{" "}
              <NavItem>
                <NavLink
                  className={`cursor-pointer ${
                    activeTab === "MISSED" ? "active" : ""
                  }`}
                  onClick={() => toggle("MISSED")}
                >
                  <div className="d-flex align-items-center gap-2">
                    <XCircle size={16} className="text-danger"/>
                    Missed
                  </div>
                </NavLink>
              </NavItem>
            </Nav>

            {medicineLoading ? (
              <Placeholder />
            ) : // : activeTab === "PENDING" ?
            //  (
            //   medicines?.pending?.length > 0 ? (
            //     <div className="space-y-3">
            //       {medicines?.pending.map((med) => (
            //         <div
            //           key={med?._id}
            //           className="border rounded-lg p-3 bg-white shadow-sm"
            //         >
            //           <div className="d-flex justify-content-between align-items-start">
            //             <div className="flex-grow-1">
            //               <h6 className="fw-bold text-dark mb-1">
            //                 {med?.medicineName}
            //               </h6>

            //               <small className="text-muted d-flex flex-wrap align-items-center gap-2">
            //                 <span>
            //                   <strong>Dosage:</strong> x{med?.dosage}
            //                 </span>
            //                 <span>
            //                   <strong>Intake:</strong> {med?.intake}
            //                 </span>
            //                 <span>
            //                   <strong>Time:</strong>
            //                   <Badge
            //                     color="light"
            //                     className="ms-1 border text-primary"
            //                     style={{
            //                       fontSize: "0.6rem",
            //                       fontWeight: "600",
            //                       padding: "0.15rem 0.4rem",
            //                     }}
            //                   >
            //                     {med?.timeSlot?.toUpperCase() || ""}
            //                   </Badge>
            //                 </span>
            //               </small>

            //               {med.instructions && (
            //                 <div className="mt-2 p-2 bg-light border rounded">
            //                   <small className="text-muted">
            //                     <strong>Note:</strong> {med.instructions}
            //                   </small>
            //                 </div>
            //               )}
            //             </div>

            //             <Button
            //               color="success"
            //               size="sm"
            //               className="ms-3 d-flex align-items-center gap-1 text-white"
            //               onClick={() =>
            //                 handleMarkAsGiven({
            //                   medicineId: med._id,
            //                   timeSlot: med.timeSlot,
            //                 })
            //               }
            //               disabled={markingId === med._id}
            //             >
            //               {markingId === med._id ? (
            //                 <Spinner size="sm">Loading...</Spinner>
            //               ) : (
            //                 <CheckCircle size={16} />
            //               )}
            //               Mark Given
            //             </Button>
            //           </div>
            //         </div>
            //       ))}
            //     </div>
            //   ) : (
            //     <div className="text-center py-4">
            //       <CheckCircle
            //         size={48}
            //         className="text-success mb-2 opacity-75"
            //       />
            //       <h6 className="text-muted">No pending medications</h6>
            //       <p className="text-muted small">
            //         All medications have been administered
            //       </p>
            //     </div>
            //   )
            // )
            activeTab === "COMPLETED" ? (
              <ActivityCard medicines={medicines} status={"completed"} />
            ) : (
              <ActivityCard medicines={medicines} status={"missed"} />
            )}
          </div>
        </GeneralCard>
      </Row>

      <style jsx>{`
        .spinner-border {
          width: 1rem;
          height: 1rem;
          border: 2px solid currentColor;
          border-right-color: transparent;
          border-radius: 50%;
          animation: spinner-border 0.75s linear infinite;
        }

        @keyframes spinner-border {
          to {
            transform: rotate(360deg);
          }
        }

        .space-y-3 > * + * {
          margin-top: 0.75rem;
        }

        .space-y-4 > * + * {
          margin-top: 1rem;
        }

        .nav-tabs .nav-link.active {
          background-color: #fff;
          border-color: #dee2e6 #dee2e6 #fff;
          color: #495057;
          font-weight: 600;
        }

        .nav-tabs .nav-link {
          border: 1px solid transparent;
          border-top-left-radius: 0.25rem;
          border-top-right-radius: 0.25rem;
          color: #6c757d;
          padding: 0.75rem 1rem;
        }

        .nav-tabs .nav-link:hover {
          border-color: #e9ecef #e9ecef #dee2e6;
          isolation: isolate;
        }

        .cursor-pointer {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default Activities;
