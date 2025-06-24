import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Accordion,
  AccordionBody,
  AccordionItem,
  Button,
  Row,
  UncontrolledTooltip,
} from "reactstrap";
import Placeholder from "./Components/Placeholder";
import { connect, useDispatch } from "react-redux";
import {
  addClinicalNote,
  createEditBill,
  createEditChart,
  fetchPatientAppointmentData,
  fetchPatientAppointments,
  removeBill,
  removeChart,
  togglePrint,
  updateClinicalNote,
} from "../../../store/actions";
import AppointmentCard from "./Components/AppointmentCard";
import Wrapper from "../Components/Wrapper";
import Prescription from "../Charts/Prescription";
import OPDInvoice from "../Bills/OPDInvoice";
import {
  INVOICE,
  PRESCRIPTION,
  OPD,
  GENERAL,
} from "../../../Components/constants/patient";
import ChartForm from "../ChartForm";
import BillForm from "../BillForm";
import DeleteModal from "../../../Components/Common/DeleteModal";
import ClinicalNote from "../Charts/ClinicalNote";
import BillDate from "../Modals/BillDate";
import Charts from "../Charts";

const OPDView = ({
  view,
  charts,
  appointments,
  toggleModal,
  patient,
  loading,
}) => {
  const dispatch = useDispatch();

  const [appointment, setAppointment] = useState("");
  const [open, setOpen] = useState("");
  const toggleAccordian = (id) => {
    if (open === id) {
      setOpen();
    } else {
      setOpen(id);
    }
  };

  const [dateModal, setDateModal] = useState(false);
  const toggleDateModal = () => setDateModal(!dateModal);

  useEffect(() => {
    dispatch(fetchPatientAppointments({ patient: patient._id }));
  }, [dispatch, patient]);

  useEffect(() => {
    if (
      appointments.length &&
      !appointments.find((ch) => ch._id === appointment)
    ) {
      setOpen("0");
      setAppointment(appointments[0]?._id);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient, appointments]); //view,

  const [item, setItem] = useState({
    item: null,
    isOpen: false,
  });

  const getItem = (item) => {
    setItem({
      item,
      isOpen: true,
    });
  };

  const printChart = (chart, patient, center, doctor) => {
    dispatch(
      togglePrint({ data: chart, modal: true, patient, center, doctor })
    );
  };

  const printBill = (bill, patient) => {
    dispatch(togglePrint({ data: bill, modal: true, patient }));
  };

  const editChart = (chart, patient) => {
    dispatch(
      createEditChart({
        chart: chart.chart,
        isOpen: true,
        type: OPD,
        data: chart,
        patient: patient,
        appointment: appointments.find((_) => _._id === appointment),
        populatePreviousAppointment: false,
        shouldPrintAfterSave: false,
      })
    );
  };

  const editBill = (bill, patient) => {
    // dispatch(
    //   createEditBill({
    //     bill: INVOICE,
    //     isOpen: true,
    //     type: OPD,
    //     data: bill,
    //     patient: patient,
    //     appointment: appointments.find((_) => _._id === appointment),
    //     shouldPrintAfterSave: false,
    //   })
    // );

    dispatch(
      createEditBill({
        bill: INVOICE,
        type: OPD,
        data: bill,
        patient: patient,
        appointment: appointments.find((_) => _._id === appointment),
        shouldPrintAfterSave: false,
        isOpen: false,
      })
    );
    toggleDateModal();
  };

  const deleteItem = () => {
    if (item.item?.chart) {
      dispatch(removeChart(item.item._id));
    } else {
      dispatch(removeBill(item.item._id));
    }
    setItem({ item: null, isOpen: false });
  };

  const onSubmitClinicalForm = (
    values,
    files,
    editChartData,
    editClinicalNote
  ) => {
    const {
      author,
      patient,
      center,
      centerAddress,
      addmission,
      appointment,
      shouldPrintAfterSave,
      chart,
      type,
      date,
      complaints,
      observations,
      diagnosis,
      notes,
    } = values;
    const formData = new FormData();
    formData.append("shouldPrintAfterSave", true);
    formData.append("author", author);
    formData.append("patient", patient);
    formData.append("center", center);
    formData.append("centerAddress", centerAddress);
    if (appointment) formData.append("appointment", appointment);
    if (addmission) formData.append("addmission", addmission);
    formData.append("shouldPrintAfterSave", shouldPrintAfterSave);
    formData.append("chart", chart);
    formData.append("type", type);
    if (date) formData.append("date", date);
    formData.append("complaints", complaints);
    formData.append("observations", observations);
    formData.append("diagnosis", diagnosis);
    formData.append("notes", notes);
    files.forEach((file) => formData.append("file", file.file));

    if (editClinicalNote) {
      formData.append("id", editChartData._id);
      formData.append("chartId", editClinicalNote._id);
      dispatch(updateClinicalNote(formData));
    } else {
      dispatch(addClinicalNote(formData));
    }
  };

  return (
    <React.Fragment>
      <div className="mt-3">
        <ChartForm
          type={OPD}
          appointment={appointment}
          onSubmitClinicalForm={onSubmitClinicalForm}
        />
        <BillForm type={OPD} appointment={appointment} />
        <BillDate isOpen={dateModal} toggle={toggleDateModal} />
        <DeleteModal
          show={item.isOpen}
          onCloseClick={() => setItem({ item: null, isOpen: false })}
          onDeleteClick={deleteItem}
        />
        <div className="mt-3">
          {/* <div className="timeline-2">
          <div className="timeline-continue"> */}
          <Row className="timeline-right row-gap-5">
            {([...(charts || []), ...(appointments || [])] || [])
              .map((ch) => ({
                ...ch,
                date: ch.type === GENERAL ? ch.date : ch.startDate,
              }))
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((doc, idx) => {
                const payable = doc?.totalInvoicePayable;
                const advancePayment = doc?.totalAdvancePayment;
                const isPayable = payable > advancePayment;

                return doc.type === GENERAL ? (
                  <Charts toggleDateModal={toggleModal} charts={[doc] ?? []} />
                ) : doc.startDate ? (
                  <AppointmentCard
                    key={idx}
                    id={idx}
                    data={doc}
                    // toggleDateModal={toggleDateModal}
                  >
                    <div className="d-flex mt-2">
                      <div>
                        <div className="d-flex">
                          <span>Doctor:</span>
                          <h6 className="display-6 fs-6 mb-0 ms-2">
                            {doc.doctor?.name}
                          </h6>
                        </div>
                        {/* <div className="d-flex">
                        <span>Advance Payment:</span>
                        <h6 className="display-6 fs-6 mb-0 ms-2">
                          {advancePayment}
                        </h6>
                      </div> */}
                      </div>
                      {/* <div className="d-flex">
                      <span>Refund:</span>
                      <h6 className="display-6 fs-6 mb-0 ms-2">
                        {doc.totalRefund}
                      </h6>
                    </div> */}
                    </div>
                    <div className="d-flex align-items-center mt-2 flex-column">
                      <h6
                        className={`display-6 fs-6 ${
                          isPayable ? "text-danger" : "text-success"
                        }`}
                      >
                        {doc.calculatedAmount}
                      </h6>
                      <h6
                        className={`display-6 fs-6 ${
                          isPayable ? "text-danger" : "text-success"
                        }`}
                      >
                        {doc.totalBills}
                      </h6>
                    </div>
                    <div className="d-flex mt-2 align-items-center">
                      <UncontrolledTooltip
                        placement="bottom"
                        target="expand-bills"
                      >
                        Show Bills
                      </UncontrolledTooltip>
                      <Button
                        onClick={() => {
                          toggleAccordian(idx.toString());
                          setAppointment(doc._id);
                        }}
                        id="expand-bills"
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
                            <React.Fragment>
                              <div className="timeline-2">
                                <div className="timeline-continue">
                                  <Row className="timeline-right">
                                    {doc.chart?.prescription && (
                                      <Wrapper
                                        item={doc.chart}
                                        editItem={editChart}
                                        deleteItem={getItem}
                                        name="OPD"
                                        printItem={(item, patient) =>
                                          printChart(
                                            item,
                                            patient,
                                            doc.center,
                                            doc.doctor
                                          )
                                        }
                                        // disableEdit={doc?.dischargeDate ? true : false}
                                        // disableDelete={addmission?.dischargeDate ? true : false}
                                      >
                                        <Prescription
                                          data={doc.chart?.prescription}
                                        />
                                      </Wrapper>
                                    )}
                                    {doc.chart?.clinicalNote && (
                                      <Wrapper
                                        item={doc.chart}
                                        editItem={editChart}
                                        deleteItem={getItem}
                                        name="OPD"
                                        printItem={(item, patient) =>
                                          printChart(
                                            item,
                                            patient,
                                            doc.center,
                                            doc.doctor
                                          )
                                        }
                                        // disableEdit={doc?.dischargeDate ? true : false}
                                        // disableDelete={addmission?.dischargeDate ? true : false}
                                      >
                                        <ClinicalNote
                                          data={doc.chart?.clinicalNote}
                                        />
                                      </Wrapper>
                                    )}
                                    <div>
                                      {doc.bill?.receiptInvoice && (
                                        <Wrapper
                                          item={doc.bill}
                                          editItem={editBill}
                                          deleteItem={getItem}
                                          printItem={printBill}
                                          name="OPD"
                                          // disableEdit={doc?.dischargeDate ? true : false}
                                          // disableDelete={addmission?.dischargeDate ? true : false}
                                        >
                                          <OPDInvoice
                                            data={doc.bill?.receiptInvoice}
                                          />
                                        </Wrapper>
                                      )}
                                    </div>
                                  </Row>
                                </div>
                              </div>
                            </React.Fragment>
                          )}
                        </AccordionBody>
                      </AccordionItem>
                    </Accordion>
                  </AppointmentCard>
                ) : (
                  ""
                );
              })}
          </Row>
          {/* </div>
        </div> */}
        </div>
      </div>
    </React.Fragment>
  );
};

OPDView.propTypes = {};

const mapStateToProps = (state) => ({
  appointments: state.Booking.patient.appointments,
  loading: state.Booking.appointmentLoading,
  patient: state.Patient.patient,
});

export default connect(mapStateToProps)(OPDView);
