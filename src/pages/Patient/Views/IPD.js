import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionBody,
  AccordionItem,
  Input,
  Label,
  Row,
  UncontrolledTooltip,
} from "reactstrap";
import AddmissionCard from "./Components/AddmissionCard";
import CheckPermission from "../../../Components/HOC/CheckPermission";
import RenderWhen from "../../../Components/Common/RenderWhen";
import { Button } from "reactstrap";
import { connect, useDispatch } from "react-redux";
import Placeholder from "./Components/Placeholder";
import Charts from "../Charts";
import { admitDischargePatient, togglePrint } from "../../../store/actions";
import {
  EDIT_ADMISSION,
  IPD,
  records,
  PRESCRIPTION,
  COUNSELLING_NOTE,
  DETAIL_ADMISSION,
  VITAL_SIGN,
} from "../../../Components/constants/patient";
import { toast } from "react-toastify";
import { assignEmergencyPatientType } from "../../../store/features/patient/patientSlice";
import { capitalizeWords } from "../../../utils/toCapitalize";
import {
  getChartsAddmissions,
  getCharts,
} from "../../../helpers/backend_helper";

const IPDComponent = ({ patient, toggleModal, setChartType, user }) => {
  const dispatch = useDispatch();
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(null);
  const [filterChartType, setFilterChartType] = useState({});
  const [chartsLoading, setChartsLoading] = useState({});

  const toggleAccordian = (id) => {
    if (open === id) {
      setOpen(null);
    } else {
      setOpen(id);
    }
  };

  const handlePatientTypeChange = async (patientId, patientType) => {
    try {
      await dispatch(
        assignEmergencyPatientType({ patientId, patientType }),
      ).unwrap();
      toast.success("Category assigned successfully");
    } catch (error) {
      toast.warn(error.message);
    }
  };

  // Fetch admissions directly
  const fetchAdmissions = async () => {
    if (!patient?.addmissions?.length) {
      setAdmissions([]);
      return;
    }
    setLoading(true);
    setOpen(null);
    try {
      const res = await getChartsAddmissions(patient.addmissions);
      setAdmissions(res.payload || []);
      setOpen("0");
    } catch (error) {
      console.log("fetchAdmissions error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmissions();
  }, [patient?._id]);

  useEffect(() => {
    const handleChartUpdate = () => fetchAdmissions();
    window.addEventListener("chartUpdated", handleChartUpdate);
    return () => window.removeEventListener("chartUpdated", handleChartUpdate);
  }, [patient?._id]);

  // Fetch charts when accordion opens
  useEffect(() => {
    if (open === null) return;
    const idx = parseInt(open);
    const admission = admissions[idx];
    if (!admission) return;
    if (admission.charts) return; // already loaded

    const fetchChartsForAdmission = async () => {
      setChartsLoading((prev) => ({ ...prev, [idx]: true }));
      try {
        const chartType = filterChartType[admission._id] || "All";
        const res = await getCharts({
          addmissionId: admission._id,
          chartType,
          _t: Date.now(),
        });
        setAdmissions((prev) =>
          prev.map((a, i) => (i === idx ? { ...a, charts: res.payload } : a)),
        );
      } catch (error) {
        console.log("fetchCharts error:", error);
      } finally {
        setChartsLoading((prev) => ({ ...prev, [idx]: false }));
      }
    };
    fetchChartsForAdmission();
  }, [open]);

  // Refetch charts when filter changes
  useEffect(() => {
    if (open === null) return;
    const idx = parseInt(open);
    const admission = admissions[idx];
    if (!admission) return;

    const fetchChartsForAdmission = async () => {
      setChartsLoading((prev) => ({ ...prev, [idx]: true }));
      try {
        const chartType = filterChartType[admission._id] || "All";
        const res = await getCharts({
          addmissionId: admission._id,
          chartType,
          _t: Date.now(),
        });
        setAdmissions((prev) =>
          prev.map((a, i) => (i === idx ? { ...a, charts: res.payload } : a)),
        );
      } catch (error) {
        console.log("fetchCharts error:", error);
      } finally {
        setChartsLoading((prev) => ({ ...prev, [idx]: false }));
      }
    };
    fetchChartsForAdmission();
  }, [filterChartType]);

  if (loading) return <Placeholder />;

  return (
    <React.Fragment>
      <div className="">
        <Row className="timeline-right row-gap-5">
          {(admissions || []).map((addmission, idx) => (
            <AddmissionCard
              key={idx}
              id={idx}
              data={addmission}
              toggleModal={toggleModal}
            >
              <div className="d-flex align-items-center flex-wrap gap-2 mt-2 mt-md-0">
                <div className="d-flex align-items-center gap-1">
                  <RenderWhen isTrue={!addmission.dischargeDate}>
                    <Label className="mb-0 text-nowrap">
                      Patient Category:
                    </Label>
                    <Input
                      className="form-control"
                      bsSize="sm"
                      type="select"
                      value={addmission.patientType || ""}
                      onChange={(e) =>
                        handlePatientTypeChange(
                          addmission.patient,
                          e.target.value,
                        )
                      }
                    >
                      <option value={"suicidal"}>Suicidal</option>
                      <option value={"runaway"}>Runaway</option>
                      <option value={"serious"}>Medically Serious</option>
                      <option value={"aggresive"}>Aggresive</option>
                      <option value={"normal"}>Normal</option>
                    </Input>
                  </RenderWhen>
                  <RenderWhen
                    isTrue={addmission.dischargeDate && addmission.patientType}
                  >
                    <div className="d-flex align-items-center">
                      <Label className="mb-0 text-nowrap me-2">
                        Patient Category:
                      </Label>
                      <p className="mb-0">
                        {capitalizeWords(addmission.patientType)}
                      </p>
                    </div>
                  </RenderWhen>
                </div>
                <div className="d-flex align-items-center gap-1 ms-2">
                  <Label className="mb-0 text-nowrap">Chart Type:</Label>
                  <Input
                    className="form-control"
                    bsSize="sm"
                    type="select"
                    value={filterChartType[addmission._id] || "All"}
                    onChange={(e) =>
                      setFilterChartType((prev) => ({
                        ...prev,
                        [addmission._id]: e.target.value,
                      }))
                    }
                  >
                    <option value="All">All</option>
                    {records
                      .filter((r) => {
                        if (user?.role === "NURSE") {
                          return ![
                            PRESCRIPTION,
                            COUNSELLING_NOTE,
                            DETAIL_ADMISSION,
                          ].includes(r.category);
                        }
                        if (
                          ["PSYCHOLOGIST", "MSW", "PSW"].includes(user?.role)
                        ) {
                          return ![PRESCRIPTION, VITAL_SIGN].includes(
                            r.category,
                          );
                        }
                        return true;
                      })
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((r) => (
                        <option key={r.category} value={r.category}>
                          {r.name}
                        </option>
                      ))}
                  </Input>
                </div>
                <CheckPermission permission={"create"} subAccess={"Charting"}>
                  <RenderWhen isTrue={!addmission.dischargeDate}>
                    <Button
                      onClick={() => {
                        toggleModal();
                        setChartType(IPD);
                      }}
                      size="sm"
                    >
                      Create new Chart
                    </Button>
                  </RenderWhen>
                </CheckPermission>
                <h6 className={`display-6 fs-6 mb-0`}>Total Charts:</h6>
                <Button
                  onClick={() => {
                    dispatch(
                      togglePrint({
                        data: {
                          printAdmissionCharts: addmission._id,
                          bulk: true,
                        },
                        modal: true,
                        patient,
                      }),
                    );
                  }}
                  size="sm"
                  color="success"
                  outline
                  className="text-white"
                >
                  <i className="ri-printer-line align-bottom text-dark"></i>
                </Button>
              </div>
              <div className="d-flex align-items-center gap-4">
                {(user?.email === "rijutarafder000@gmail.com" ||
                  user?.email === "owais@gmail.com" ||
                  user?.email === "bishal@gmail.com" ||
                  user?.email === "hemanthshinde@gmail.com") && (
                  <div className="d-flex align-items-center">
                    <UncontrolledTooltip
                      placement="bottom"
                      target="edit-admission"
                    >
                      Edit Admission
                    </UncontrolledTooltip>
                    <Button
                      onClick={() => {
                        dispatch(
                          admitDischargePatient({
                            data: addmission,
                            isOpen: EDIT_ADMISSION,
                          }),
                        );
                      }}
                      id="edit-admission"
                      size="sm"
                      outline
                    >
                      <i className="ri-quill-pen-line text-muted fs-6"></i>
                    </Button>
                  </div>
                )}

                <div className="d-flex align-items-center">
                  <UncontrolledTooltip
                    placement="bottom"
                    target="expand-charts"
                  >
                    Show Charts
                  </UncontrolledTooltip>
                  <Button
                    onClick={() => toggleAccordian(idx.toString())}
                    id="expand-charts"
                    size="sm"
                    outline
                  >
                    <i
                      className={`${
                        open === idx.toString()
                          ? " ri-arrow-up-s-line"
                          : "ri-arrow-down-s-line"
                      } fs-6`}
                    ></i>
                  </Button>
                </div>
              </div>
              <Accordion
                className="timeline-date w-100"
                open={open}
                toggle={toggleAccordian}
              >
                <AccordionItem className="patient-accordion-item">
                  <AccordionBody
                    className="patient-accordion border-0"
                    accordionId={idx.toString()}
                  >
                    {chartsLoading[idx] ? (
                      <Placeholder />
                    ) : (
                      <Charts
                        toggleDateModal={toggleModal}
                        charts={addmission.charts ?? []}
                        addmission={addmission}
                        doctor={addmission?.doctor}
                      />
                    )}
                  </AccordionBody>
                </AccordionItem>
              </Accordion>
            </AddmissionCard>
          ))}
        </Row>
      </div>
    </React.Fragment>
  );
};

const mapStateToProps = (state) => ({
  user: state.User.user,
});

export default connect(mapStateToProps)(IPDComponent);
