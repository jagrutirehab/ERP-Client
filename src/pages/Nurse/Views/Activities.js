import React, { useEffect, useState } from "react";
import GeneralCard from "../../Patient/Views/Components/GeneralCard";
import { Row, Nav, NavItem, NavLink, Button, Badge, Spinner, Collapse } from "reactstrap";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getRemainigActiveMedicines,
  getTodayCompletedActiveMedicines,
  markPendingMedicineAsGiven,
} from "../../../store/features/nurse/nurseSlice";
import Placeholder from "../../Patient/Views/Components/Placeholder";
import { CheckCircle, Clock, CheckCheck, ChevronDown, ChevronUp, Calendar, XCircle } from "lucide-react";
import { toast } from "react-toastify";

const Activities = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { medicineLoading, medicines } = useSelector((state) => state.Nurse);
  const [activeTab, setActiveTab] = useState("PENDING");
  const [markingId, setMarkingId] = useState(null);
  const [expandedDates, setExpandedDates] = useState({});

  const toggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  const toggleDate = (date) => {
    setExpandedDates(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
  };

  useEffect(() => {
    if (!id || id === "*") return;
    // if (activeTab === "PENDING") {
    //   dispatch(getRemainigActiveMedicines(id));
    // } else
       if (activeTab === "COMPLETED") {
      dispatch(
        getTodayCompletedActiveMedicines({ patientId: id, status: "COMPLETED" })
      );
    }
    //  else if (activeTab === "MISSED") {
    //   dispatch(
    //     getTodayCompletedActiveMedicines({ patientId: id, status: "MISSED" })
    //   );
    // }
  }, [activeTab, id, dispatch]);

  const handleMarkAsGiven = async ({ medicineId, timeSlot }) => {
    setMarkingId(medicineId);
    try {
      await dispatch(
        markPendingMedicineAsGiven({
          medicineId: medicineId,
          timeSlot,
        })
      ).unwrap();
      toast.success("Medicine marked as given");
    } catch (error) {
      console.error("Failed to mark medicine as given:", error);
    } finally {
      setMarkingId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div>
      <Row className="timeline-right" style={{ rowGap: "2rem" }}>
        <GeneralCard data="Daily Medication Record">
          <div style={{ padding: "1rem" }}>
            <Nav tabs className="mb-4">
              {/* <NavItem>
                <NavLink
                  className={`cursor-pointer ${
                    activeTab === "PENDING" ? "active" : ""
                  }`}
                  onClick={() => toggle("PENDING")}
                >
                  <div className="d-flex align-items-center gap-2">
                    <Clock size={16} />
                    Pending
                  </div>
                </NavLink>
              </NavItem> */}
              <NavItem>
                <NavLink
                  className={`cursor-pointer ${
                    activeTab === "COMPLETED" ? "active" : ""
                  }`}
                  onClick={() => toggle("COMPLETED")}
                >
                  <div className="d-flex align-items-center gap-2">
                    <CheckCheck size={16} />
                    Completed
                  </div>
                </NavLink>
              </NavItem> <NavItem>
                <NavLink
                  className={`cursor-pointer ${
                    activeTab === "MISSED" ? "active" : ""
                  }`}
                  onClick={() => toggle("MISSED")}
                >
                  <div className="d-flex align-items-center gap-2">
                    <XCircle size={16} />
                    Missed
                  </div>
                </NavLink>
              </NavItem>
            </Nav>

            {medicineLoading ? (
              <Placeholder />
            ) 
            // : activeTab === "PENDING" ?
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
            :
             activeTab==="COMPLETED"? medicines?.completed?.length > 0 ? (
              <div className="space-y-4">
                {medicines.completed.map((dateGroup) => (
                  <div key={dateGroup.date} className="border rounded-lg overflow-hidden">
                    <div 
                      className="d-flex justify-content-between align-items-center p-3 bg-light cursor-pointer"
                      onClick={() => toggleDate(dateGroup.date)}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <Calendar size={18} className="text-primary" />
                        <h6 className="mb-0 fw-bold">{formatDate(dateGroup.date)}</h6>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <Badge color="primary" pill>
                          {dateGroup.medicines.length} medication(s)
                        </Badge>
                        {expandedDates[dateGroup.date] ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </div>
                    </div>
                    
                    <Collapse isOpen={expandedDates[dateGroup.date]}>
                      <div className="p-3 space-y-3">
                        {dateGroup.medicines.map((med) => (
                          <div
                            key={med._id}
                            className="border rounded-lg p-3 bg-white shadow-sm"
                          >
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="flex-grow-1">
                                <div className="d-flex align-items-center gap-2 mb-1">
                                  <CheckCheck size={16} className="text-success" />
                                  <h6 className="fw-bold text-dark mb-0">
                                    {med?.medicineName}
                                  </h6>
                                </div>

                                <small className="text-muted d-flex flex-wrap align-items-center gap-2">
                                  <span>
                                    <strong>Dosage:</strong> x{med?.dosage}
                                  </span>
                                  <span>
                                    <strong>Intake:</strong> {med?.intake}
                                  </span>
                                  <span>
                                    <strong>Time:</strong>
                                    <Badge
                                      color="light"
                                      className="ms-1 border text-primary"
                                      style={{
                                        fontSize: "0.6rem",
                                        fontWeight: "600",
                                        padding: "0.15rem 0.4rem",
                                      }}
                                    >
                                      {med?.timeSlot?.toUpperCase() || ""}
                                    </Badge>
                                  </span>
                                  <span>
                                    <strong>Given at:</strong>{" "}
                                    {new Date(med.dateTime).toLocaleTimeString()}
                                  </span>
                                </small>

                                {med.instructions && (
                                  <div className="mt-2 p-2 bg-light border rounded">
                                    <small className="text-muted">
                                      <strong>Note:</strong> {med.instructions}
                                    </small>
                                  </div>
                                )}
                              </div>

                              <Badge
                                color="success"
                                pill
                                className="ms-3 d-flex align-items-center gap-1"
                                style={{
                                  padding: "0.5rem 0.75rem",
                                  fontSize: "0.75rem",
                                }}
                              >
                                <CheckCircle size={14} />
                                Given
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Collapse>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Clock size={48} className="text-muted mb-2 opacity-75" />
                <h6 className="text-muted">No completed medications</h6>
                <p className="text-muted small">
                  Medications will appear here once marked as given
                </p>
              </div>
            ):(
              <div className="text-center py-4">
                  <CheckCircle
                    size={48}
                    className="text-success mb-2 opacity-75"
                  />
                  <h6 className="text-muted">No Missed medications</h6>
                  <p className="text-muted small">
                    All medications have been administered
                  </p>
                </div>
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