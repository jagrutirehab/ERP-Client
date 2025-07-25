import React, { useEffect } from "react";
import {
  Accordion,
  AccordionBody,
  AccordionItem,
  Row,
  UncontrolledTooltip,
  Button,
} from "reactstrap";
import GeneralCard from "./Components/GeneralCard";
import { connect, useDispatch, useSelector } from "react-redux";
import Placeholder from "./Components/Placeholder";
import { CLINIC_TEST } from "../../../Components/constants/patient"; // create if needed
import Wrapper from "../Components/Wrapper";
import CIWAResultComponent from "./Components/CIWAResultComponent ";
import { fetchClinicalTest } from "../../../store/actions";
import CSSRSResultComponent from "./Components/SsrsResult";
import YmscResult from "./Components/YmscResult";
import MPQ9ResultComponent from "./Components/MPQ9Result";
import MMSEResultComponent from "./Components/MMSEResult";

const ClinicalTest = ({
  // addmissionsCharts,
  open,
  patient,
  loading,
  toggleModal,
  setChartType,
  toggleAccordian,
  setAddmissionId,
}) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchClinicalTest({ patientId: patient._id }));
  }, [patient]);

  const testResult = useSelector((state) => state.ClinicalTest.testResult);


  return (
    <React.Fragment>
      <div className="">
        <Row className="timeline-right row-gap-5">
          {[1].map((test, idx) => (
            <GeneralCard key={idx} data="Clinical Test">
              <div
                style={{ width: "100%" }}
                className="d-flex  align-items-center justify-content-between"
              >
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
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
                      setAddmissionId(test?._id);
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
                        <div className="timeline-2">
                          <div className="timeline-continue">
                            <Row className="timeline-right">
                              {testResult &&
                                testResult.length > 0 &&
                                testResult.map((test, index) => {
                                  return (
                                    <div>
                                      <Wrapper
                                        item={{
                                          clinicalTest: "ClinicalTest",
                                          author: {
                                            name: test.doctorId.name,
                                            role: test.doctorId.role,
                                          },
                                          date: test.createdAt,
                                        }}
                                      >
                                        {test?.testType === 7 && <CSSRSResultComponent resultData={test} />}
                                        {test?.testType === 8 && <YmscResult resultData={test} />}
                                        {test?.testType === 6 && <CIWAResultComponent resultData={test} />}
                                        {test?.testType === 9 && <MPQ9ResultComponent resultData={test} />}
                                        {test?.testType === 10 && <MMSEResultComponent resultData={test} />}
                                      </Wrapper>
                                    </div>
                                  );
                                })}
                            </Row>
                          </div>
                        </div>
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

export default connect(mapStateToProps)(ClinicalTest);
