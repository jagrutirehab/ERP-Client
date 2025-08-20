import { useForm } from "react-hook-form";
import Page1 from "./page1";
import Page2 from "./page2";
import SeriousnessConsent from "./SeriousnessConsent";
import MediactionConcent from "./MediactionConcent";
import Admissionpage1 from "./Admissionpage1";
import Admissionpage2 from "./Admissionpage2";
import IndependentAdmAdult from "./IndependentAdmAdult";
import IndependentAdmMinor from "./IndependentAdmMinor";
import AdmWithHighSupport from "./AdmWithHighSupport";
import DischargeIndependentAdult from "./DischargeIndependentAdult";
import DischargeIndependentMinor from "./DischargeIndependentMinor";
import IndipendentOpinion1 from "./IndipendentOpinion1";
import IndipendentOpinion2 from "./IndipendentOpinion2";
import IndipendentOpinion3 from "./IndipendentOpinion3";
import ECTConsentForm from "./ECTConsentForm";
import {
  Accordion,
  AccordionBody,
  AccordionItem,
  Button,
  Placeholder,
  Row,
  UncontrolledTooltip,
} from "reactstrap";
import GeneralCard from "../Components/GeneralCard";
import { useState } from "react";
import { useSelector } from "react-redux";
import AdmissionformModal from "../../Modals/Admissionform.modal";

const AddmissionForms = () => {
  const patient = useSelector((state) => state.Patient.patient);
  const [admission, setAdmission] = useState(null);
  const [dateModal, setDateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const toggleModal = () => setDateModal(!dateModal);
  const [addmissionId, setAddmissionId] = useState();

  const [open, setOpen] = useState("0");
  const toggleAccordian = (id) => {
    if (open === id) {
      setOpen();
    } else {
      setOpen(id);
    }
  };

  const { register, handleSubmit } = useForm();

  const onSubmit = (data) => {
    console.log("Full form data:", data);
  };

  return (
    <>
      <div style={{ marginTop: "4rem" }}>
        <Row className="timeline-right row-gap-5">
          {[1].map((test, idx) => (
            <GeneralCard key={idx} data="Admission Form">
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
                  {patient.isAdmit === true && (
                    <Button
                      onClick={() => {
                        toggleModal();
                      }}
                      size="sm"
                      color="primary"
                      className="mr-10"
                    >
                      Create new Admission
                    </Button>
                  )}
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
                            <Row className="timeline-right"></Row>
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
      {/* <form onSubmit={handleSubmit(onSubmit)}>
        <Page1 register={register} />
        <Page2 register={register} />
        <SeriousnessConsent register={register} />
        <MediactionConcent register={register} />
        <Admissionpage1 register={register} />
        <Admissionpage2 register={register} />
        <IndependentAdmAdult register={register} />
        <IndependentAdmMinor register={register} />
        <AdmWithHighSupport register={register} />
        <DischargeIndependentAdult register={register} />
        <DischargeIndependentMinor register={register} />
        <IndipendentOpinion1 register={register} />
        <IndipendentOpinion2 register={register} />
        <IndipendentOpinion3 register={register} />
        <ECTConsentForm register={register} />
        <div style={{ textAlign: "center", margin: "20px" }}>
          <button type="submit">Submit All</button>
        </div>
      </form> */}
      <AdmissionformModal
        isOpen={dateModal}
        toggle={toggleModal}
        admission={admission}
      />
    </>
  );
};

export default AddmissionForms;
