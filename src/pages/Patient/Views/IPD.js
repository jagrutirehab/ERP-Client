import React from "react";
import {
  Accordion,
  AccordionBody,
  AccordionItem,
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
import { EDIT_ADMISSION, IPD } from "../../../Components/constants/patient";

const IPDComponent = ({
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
            <AddmissionCard
              key={idx}
              id={idx}
              data={addmission}
              toggleModal={toggleModal}
            >
              <div className="d-flex align-items-center">
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
                <h6 className={`display-6 fs-6 mb-0`}>
                  Total Charts:
                  {/* {addmission.totalCharts} */}
                </h6>
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
                      })
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
                          })
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
                {/* </CheckPermission> */}

                <div className="d-flex align-items-center">
                  <UncontrolledTooltip
                    placement="bottom"
                    target="expand-charts"
                  >
                    Show Charts
                  </UncontrolledTooltip>
                  <Button
                    onClick={() => {
                      toggleAccordian(idx.toString());
                      setAddmissionId(addmission?._id);
                    }}
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
                    {loading ? (
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
        {/* </div>
        </div> */}
      </div>
    </React.Fragment>
  );
};

const mapStateToProps = (state) => ({
  user: state.User.user,
});

export default connect(mapStateToProps)(IPDComponent);
