import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionBody,
  AccordionItem,
  Row,
  UncontrolledTooltip,
  Button,
} from "reactstrap";
import { toast } from "react-toastify";
import GeneralCard from "./Components/GeneralCard";
import { connect, useDispatch, useSelector } from "react-redux";
import Placeholder from "./Components/Placeholder";
import { CLINIC_TEST } from "../../../Components/constants/patient";
import Wrapper from "../Components/Wrapper";
import CIWAResultComponent from "./Components/CIWAResultComponent ";
import { fetchClinicalTest, togglePrint } from "../../../store/actions";
import CSSRSResultComponent from "./Components/SsrsResult";
import YmscResult from "./Components/YmscResult";
import MPQ9ResultComponent from "./Components/MPQ9Result";
import MMSEResultComponent from "./Components/MMSEResult";
import YBOCSResultComponent from "./Components/YBOCSResult";
import ACDSResultComponent from "./Components/ACDSResult";
import HAMAResultComponent from "./Components/HAMAResult";
import HAMDResultComponent from "./Components/HAMDResult";
import PANSSResultComponent from "./Components/PANSSResult";
import MorseResultComponent from "./Components/Morsefallresult";
import RamsayResultComponent from "./Components/Ramsayresult";
import GCSResultComponent from "./Components/Gcsresult";
import { useAuthError } from "../../../Components/Hooks/useAuthError";

const ClinicalTest = ({
  open,
  patient,
  loading,
  toggleModal,
  setChartType,
  toggleAccordian,
  setAddmissionId,
}) => {
  const dispatch = useDispatch();
  const handleAuthError = useAuthError();
  const testResult = useSelector((state) => state.ClinicalTest.testResult);

  const loadClinialTests = async () => {
    try {
      await dispatch(fetchClinicalTest({ patientId: patient._id })).unwrap();
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error.message || "Failed to load clinical test");
      }
    }
  };

  useEffect(() => {
    loadClinialTests();
  }, [patient]);

  const handlePrint = (test) => {
    dispatch(
      togglePrint({
        modal: true,
        clinicalTest: test,
        doctor: test.doctorId,
        patient: test.patientId,
      })
    );
  };

  const handleEdit = () => {};
  const handleDelete = () => {};

  return (
    <React.Fragment>
      <div className="">
        <Row className="timeline-right row-gap-5">
          {[1].map((test, idx) => (
            <GeneralCard key={idx} data="Clinical Test">
              <div
                style={{ width: "100%" }}
                className="d-flex align-items-center justify-content-between"
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
                      toggleModal();
                      setChartType(CLINIC_TEST);
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
                      className={`${
                        open === idx.toString()
                          ? "ri-arrow-up-s-line"
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
                                    <div key={index}>
                                      <Wrapper
                                        printItem={() => handlePrint(test)}
                                        editItem={handleEdit}
                                        deleteItem={handleDelete}
                                        disableEdit={true}
                                        disableDelete={true}
                                        item={{
                                          clinicalTest: "ClinicalTest",
                                          author: {
                                            name: test.doctorId?.name,
                                            role: test.doctorId?.role,
                                          },
                                          date: test.createdAt,
                                        }}
                                      >
                                        {test?.testType === 7 && (
                                          <CSSRSResultComponent
                                            resultData={test}
                                          />
                                        )}
                                        {test?.testType === 8 && (
                                          <YmscResult resultData={test} />
                                        )}
                                        {test?.testType === 6 && (
                                          <CIWAResultComponent
                                            resultData={test}
                                          />
                                        )}
                                        {test?.testType === 9 && (
                                          <MPQ9ResultComponent
                                            resultData={test}
                                          />
                                        )}
                                        {test?.testType === 10 && (
                                          <MMSEResultComponent
                                            resultData={test}
                                          />
                                        )}
                                        {test?.testType === 11 && (
                                          <YBOCSResultComponent
                                            resultData={test}
                                          />
                                        )}
                                        {test?.testType === 12 && (
                                          <ACDSResultComponent
                                            resultData={test}
                                          />
                                        )}
                                        {test?.testType === 13 && (
                                          <HAMAResultComponent
                                            resultData={test}
                                          />
                                        )}
                                        {test?.testType === 14 && (
                                          <HAMDResultComponent
                                            resultData={test}
                                          />
                                        )}
                                        {test?.testType === 15 && (
                                          <PANSSResultComponent
                                            resultData={test}
                                          />
                                        )}
                                        {test?.testType === 16 && (
                                          <MorseResultComponent
                                            resultData={test}
                                          />
                                        )}
                                        {test?.testType === 17 && (
                                          <RamsayResultComponent
                                            resultData={test}
                                          />
                                        )}
                                        {test?.testType === 18 && (
                                          <GCSResultComponent
                                            resultData={test}
                                          />
                                        )}
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