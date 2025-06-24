import React from "react";
import {
  Accordion,
  AccordionBody,
  AccordionItem,
  Row,
  UncontrolledTooltip,
  Button,
} from "reactstrap";
import GeneralCard from "./Components/GeneralCard";
import CheckPermission from "../../../Components/HOC/CheckPermission";
import RenderWhen from "../../../Components/Common/RenderWhen";
import { connect, useDispatch } from "react-redux";
import Placeholder from "./Components/Placeholder";
import { CLINIC_TEST } from "../../../Components/constants/patient"; // create if needed
import Wrapper from "../Components/Wrapper";
import ClinicalNote from "../Charts/ClinicalNote";
import CIWAResultComponent from "./Components/CIWAResultComponent ";

const ClinickTest = ({
  addmissionsCharts,
  open,
  patient,
  loading,
  toggleModal,
  setChartType,
  toggleAccordian,
  setAddmissionId,
  user,
}) => {
  const dispatch = useDispatch();

  return (
    <React.Fragment>
      <div className="">
        <Row className="timeline-right row-gap-5">
          {(addmissionsCharts || []).map((addmission, idx) => (
            <GeneralCard key={idx}>
              <div style={{ width: "100%" }} className="d-flex  align-items-center justify-content-between">
                <div style={{ width: "100%", display: "flex", justifyContent: "center" }} >
                  <Button
                    onClick={() => {
                      toggleModal(); // Opens the modal
                      setChartType(CLINIC_TEST); // Set your own type
                    }}
                    size="sm"
                    color="primary"
                    className="mr-10"
                  >
                    Create new test
                  </Button>

                </div>

                <div className="d-flex align-items-center">
                  <UncontrolledTooltip
                    placement="bottom"
                    target={`expand-test-${idx}`}
                  >
                    Expand/Collapse
                  </UncontrolledTooltip>
                  <Button
                    id={`expand-test-${idx}`}
                    onClick={() => {
                      toggleAccordian(idx.toString());
                      setAddmissionId(addmission?._id);
                    }}
                    size="sm"
                    outline
                  >
                    <i
                      className={`${open === idx.toString()
                        ? "ri-arrow-up-s-line"
                        : "ri-arrow-down-s-line"
                        } fs-6`}
                    ></i>
                  </Button>
                </div>
              </div>

              {/* ACCORDION */}
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
                    {loading ? (
                      <Placeholder />
                    ) : (
                      <div>
                        <Wrapper item={{ author: { name: "Ravi", role: "Doctor" }, date: "12/05/2025" }} />
                        <CIWAResultComponent resultData={{
                          totalScore: 13,
                          interpretation: "Moderate withdrawal: Close monitoring required.",
                          recommendation: "Monitor vital signs every 1–2 hours. Consider pharmacotherapy.",
                          answers: [
                            {
                              question: "1. Nausea and Vomiting: Do you feel sick to your stomach?",
                              selectedOption: "1: Mild nausea with no vomiting"
                            },
                            {
                              question: "2. Tremor: (Observe patient...)",
                              selectedOption: "2: Severe tremor with arms extended"
                            }
                          ]
                        }} />
                      </div>

                    )}
                  </AccordionBody>
                </AccordionItem>
              </Accordion>



            </GeneralCard>
          ))}
        </Row>
      </div>
    </React.Fragment>
  );
};

const mapStateToProps = (state) => ({
  user: state.User.user,
});

export default connect(mapStateToProps)(ClinickTest);
