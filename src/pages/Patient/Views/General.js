import React from "react";
import Placeholder from "./Components/Placeholder";
import Charts from "../Charts";

const General = ({ generalLoading, toggleModal, charts }) => {
  return (
    <React.Fragment>
      <div className="">
        {generalLoading ? (
          <Placeholder />
        ) : (
          <Charts toggleDateModal={toggleModal} charts={charts ?? []} />
        )}
      </div>
    </React.Fragment>
  );
};

export default General;

// {
  /* <div className="">
<GeneralCard>
  <div className="d-flex align-items-center ">
    <div className="d-fle">
      <UncontrolledTooltip placement="bottom" target="expand-charts">
        Show Charts
      </UncontrolledTooltip>
      <Button
        onClick={() => {
          setToggleGeneral(toggleGeneral === "0" ? "1" : "0");
          setOpen("");
        }}
        id="expand-charts"
        size="sm"
        outline
      >
        <i
          className={`${
            toggleGeneral === "1"
              ? "ri-arrow-up-s-line"
              : "ri-arrow-down-s-line"
          } fs-6`}
        ></i>
      </Button>
    </div>
  </div>
  <Accordion
    className="timeline-date w-100"
    open={toggleGeneral}
    toggle={() => setToggleGeneral(toggleGeneral === "0" ? "1" : "0")}
  >
    <AccordionItem className="patient-accordion-item">
      <AccordionBody
        className="patient-accordion border-0"
        accordionId={"1"}
      >
        {generalLoading ? (
          <Placeholder />
        ) : (
          <Charts toggleDateModal={toggleModal} charts={charts ?? []} />
        )}
      </AccordionBody>
    </AccordionItem>
  </Accordion>
</GeneralCard>
</div> */
// }
