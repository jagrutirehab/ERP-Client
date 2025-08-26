import {
  Accordion,
  AccordionBody,
  AccordionItem,
  Button,
  Row,
  UncontrolledTooltip,
} from "reactstrap";
import { useState } from "react";
import { connect } from "react-redux";
import GeneralCard from "../../../Patient/Views/Components/GeneralCard";
import { useForm } from "react-hook-form";
import InternUndertakingForm from "./InternUndertakingForm";
import InternUndertakingFormPage2 from "./InternUndertakingForm2";
import InternUndertakingFormPage3 from "./InternUndertakingForm3";

const InternAddmissionForms = (intern) => {
  const [dateModal, setDateModal] = useState(false);
  const toggleModal = () => setDateModal(!dateModal);
  const { register, handleSubmit } = useForm();

  const [open, setOpen] = useState("0");
  const toggleAccordian = (id) => {
    if (open === id) {
      setOpen();
    } else {
      setOpen(id);
    }
  };

  const onSubmit = async (data) => {
    // console.log("Full form data:", data);
  };

  return (
    <>
      <div style={{ marginTop: "4rem" }}>
        <Row className="timeline-right row-gap-5">
          {[1].map((test, idx) => (
            <GeneralCard key={idx} data="Admission Form">
              <div
                style={{ width: "100%" }}
                className="d-flex align-items-center justify-content-between"
              >
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
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
                    <div>
                      <div className="timeline-2">
                        <div className="timeline-continue">
                          <Row className="timeline-right"></Row>
                        </div>
                      </div>
                    </div>
                  </AccordionBody>
                </AccordionItem>
              </Accordion>
            </GeneralCard>
          ))}
        </Row>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <InternUndertakingForm register={register} intern={intern?.intern}/>
        <InternUndertakingFormPage2 register={register} intern={intern?.intern}/>
        <InternUndertakingFormPage3 register={register} intern={intern?.intern}/>
      </form>
    </>
  );
};


const mapStateToProps = (state) => ({
  intern: state.Intern.intern,
});

export default connect(mapStateToProps)(InternAddmissionForms);
