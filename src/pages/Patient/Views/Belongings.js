import { Row, Button, UncontrolledTooltip, Accordion, AccordionItem, AccordionBody } from "reactstrap"
import AddmissionCard from "./Components/AddmissionCard"
import { useState } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import BelongingsDate from "../Modals/BelongingsDate";
import BelongingsFormModal from "../Modals/BelongingsForm.modal";

const Belongings = ({ patient, admissions, addmissionsCharts }) => {
    const [dateModal, setDateModal] = useState(false);
    const [dateModal2, setDateModal2] = useState(false);
    const [formModal, setFormModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);

    const toggleModal = () => setDateModal(!dateModal);
    const toggleModal2 = () => setDateModal2(!dateModal2);
    const toggleFormModal = () => setFormModal(!formModal);

    const handleStartForm = (date) => {
        setSelectedDate(date);
        toggleFormModal();
    };

    const [chartType, setChartType] = useState("");
    const [open, setOpen] = useState(addmissionsCharts?.length > 0 ? "0" : null);
    const [addmissionId, setAddmissionId] = useState(null);

    const toggleAccordian = (id) => {
        if (open === id) {
            setOpen();
        } else {
            setOpen(id);
        }
    };
    return (
        <div style={{ marginTop: "4rem" }}>
            <Row className="timeline-right row-gap-5">
                {(addmissionsCharts || []).map((test, idx) => (
                    <AddmissionCard
                        key={idx}
                        id={idx}
                        data={test}
                        toggleModal={toggleModal}
                    >
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "space-between",
                                width: "100%",
                                alignItems: "center",
                            }}
                        >
                            {/* Empty spacer for left side */}
                            <div style={{ flex: 1 }}></div>

                            <div style={{ flex: 1, textAlign: "center" }}>
                                <Button
                                    onClick={() => {
                                        toggleModal2();
                                        setChartType("BELONGINGS");
                                    }}
                                    size="sm"
                                >
                                    Create New Form
                                </Button>
                            </div>

                            <div
                                className="d-flex align-items-center"
                                style={{ flex: 1, justifyContent: "flex-end" }}
                            >
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
                        <Accordion
                            className="timeline-date w-100"
                            open={open}
                            toggle={toggleAccordian}
                        >
                            <AccordionItem className="patient-accordion-item">
                                <AccordionBody className="patient-accordion border-0"
                                    accordionId={idx.toString()}>
                                    <div className="text-center py-3">
                                        <Button
                                            color="primary"
                                            className="text-white"
                                            onClick={() => { }}
                                            size="sm"
                                        >
                                            <i className="ri-upload-2-line me-1"></i>
                                            Upload Signed Copy of Belongings Form
                                        </Button>
                                    </div>
                                </AccordionBody>
                            </AccordionItem>
                        </Accordion>
                    </AddmissionCard>
                ))}
            </Row>
            <BelongingsDate onStartForm={handleStartForm} chartType={chartType} isOpen={dateModal2} toggle={toggleModal2} />
            <BelongingsFormModal isOpen={formModal} toggle={toggleFormModal} date={selectedDate} patient={patient} />
        </div>
    )
};

Belongings.propTypes = {
    patient: PropTypes.object,
    addmissionsCharts: PropTypes.array,
};

const mapStateToProps = (state) => ({
    chartDate: state.Chart.chartDate,
    patient: state.Patient.patient,
    addmissionsCharts: state.Chart.data,
    doctors: state.User?.doctor,
    psychologists: state.User?.counsellors,
    admissions: state.Chart.data,
    charts: state.Chart.charts,
})

export default connect(mapStateToProps)(Belongings);