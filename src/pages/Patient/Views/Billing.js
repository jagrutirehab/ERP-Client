import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Accordion,
  AccordionBody,
  AccordionItem,
  Alert,
  Button,
  Row,
  UncontrolledTooltip,
} from "reactstrap";
import Placeholder from "./Components/Placeholder";

import BillDate from "../Modals/BillDate";
import BillForm from "../BillForm";
import Bills from "../Bills";
import AddmissionCard from "./Components/AddmissionCard";
import RenderWhen from "../../../Components/Common/RenderWhen";

//redux
import { connect, useDispatch } from "react-redux";
import {
  admitDischargePatient,
  fetchBills,
  fetchDraftBills,
} from "../../../store/actions";
import {
  ADMIT_PATIENT,
  EDIT_ADMISSION,
  IPD,
} from "../../../Components/constants/patient";
import CheckPermission from "../../../Components/HOC/CheckPermission";
import DraftInvoice from "./Components/DraftInvoice";

const Billing = ({
  user,
  patient,
  addmissionsBills,
  loading,
  calculatedAdvance = 0,
  calculatedPayable = 0,
  totalAdvance = 0,
  totalPayable = 0,
  totalDeposit = 0,
  view,
  drafts,
}) => {
  const dispatch = useDispatch();
  const [showDraft, setDraft] = useState(false);
  const [dateModal, setDateModal] = useState(false);
  const [admission, setAdmission] = useState(null);
  const toggleModal = () => setDateModal(!dateModal);

  const handleAdmitPatient = () => {
    dispatch(admitDischargePatient({ data: null, isOpen: ADMIT_PATIENT }));
  };

  const [addmissionId, setAddmissionId] = useState();

  const [open, setOpen] = useState("");
  const toggleAccordian = (id) => {
    if (open === id) {
      setOpen();
    } else {
      setOpen(id);
    }
  };

  useEffect(() => {
    if (
      addmissionsBills.length &&
      !addmissionsBills.find((ch) => ch._id === addmissionId)
    ) {
      setOpen("0");
      setAddmissionId(addmissionsBills[0]?._id);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, patient, addmissionsBills]);
  useEffect(() => {
    if (addmissionId && patient?.addmissions?.includes(addmissionId)) {
      dispatch(fetchBills(addmissionId));
    }
  }, [dispatch, patient, addmissionId]);

  useEffect(() => {
    dispatch(fetchDraftBills({ patient: patient._id }));
  }, [dispatch, patient]);

  return (
    <div className="mt-3">
      <div className="d-flex align-items-center justify-content-between">
        <div className="flex">
          <CheckPermission permission={"create"} subAccess={"Billing"}>
            <RenderWhen isTrue={patient?.isAdmit}>
              <Button
                className="text-nowrap"
                onClick={() => {
                  setAdmission(null);
                  toggleModal();
                }}
                size="sm"
              >
                Create new Bill
              </Button>
            </RenderWhen>
            <RenderWhen isTrue={!patient?.isAdmit}>
              <Button className="ms-2" onClick={handleAdmitPatient} size="sm">
                Admit Patient
              </Button>
            </RenderWhen>
          </CheckPermission>
        </div>

        <div className="d-flex justify-content-aroun align-items-center gap-3">
          <RenderWhen isTrue={calculatedPayable > calculatedAdvance}>
            <h6
              id="payable-amount"
              className="display-6 fs-xs-12 fs-md-18 mb-0 me-4 text-danger"
            >
              {calculatedPayable}
            </h6>
          </RenderWhen>
          <RenderWhen isTrue={calculatedAdvance > calculatedPayable}>
            <h6
              id="payable-amount"
              className="display-6 fs-xs-12 fs-md-18 mb-0 me-4 text-success"
            >
              {calculatedAdvance}
            </h6>
          </RenderWhen>
          <RenderWhen isTrue={!calculatedAdvance && !calculatedPayable}>
            <h6
              id="payable-amount"
              className="display-6 fs-xs-12 fs-md-18 mb-0 me-4"
            >
              0
            </h6>
          </RenderWhen>
        </div>
      </div>

      <RenderWhen isTrue={Boolean(drafts?.length)}>
        <div className="draft d-flex mt-2 mb-n2">
          <div
            onClick={() => setDraft(!showDraft)}
            className="draft-invoice d-flex align-items-center"
            role="button"
          >
            <div></div>
            <div className="d-flex align-items-center justify-content-center">
              Draft
            </div>
          </div>
        </div>
      </RenderWhen>
      <RenderWhen isTrue={showDraft && Boolean(drafts?.length)}>
        <DraftInvoice toggleDateModal={toggleModal} />
      </RenderWhen>

      <RenderWhen isTrue={!patient?.isAdmit}>
        <Alert
          className="mt-3 justify-content-center py-1 d-flex align-items-center"
          color="warning"
        >
          <i className="ri-alert-line label-icon fs-5 me-3"></i>Please admit
          patient in order to create bills!
        </Alert>
      </RenderWhen>
      <BillDate isOpen={dateModal} toggle={toggleModal} admission={admission} />
      <BillForm type={IPD} />

      <div className="mt-3">
        <Row className="timeline-right row-gap-5">
          {(addmissionsBills || []).map((addmission, idx) => {
            const payable =
              idx === 0 ? totalPayable : addmission.totalInvoicePayable;
            const advancePayment =
              idx === 0 ? totalAdvance : addmission.totalAdvancePayment;
            const ttlDeposit =
              idx === 0
                ? totalDeposit
                : addmission.remainingDepositAfterInvoice;

            return (
              <AddmissionCard
                key={idx}
                id={idx}
                data={addmission}
                toggleModal={toggleModal}
              >
                <div className="d-flex align-items-center mt-2 flex-column">
                  <RenderWhen
                    isTrue={
                      (user?.email === "rijutarafder000@gmail.com" ||
                        user?.email === "owais@gmail.com" ||
                        user?.email === "bishal@gmail.com" ||
                        user?.email === "hemanthshinde@gmail.com" ||
                        user?.email === "surjeet.parida@gmail.com") &&
                      addmission.dischargeDate
                    }
                  >
                    <Button
                      className="text-nowrap"
                      onClick={() => {
                        setAdmission(addmission._id);
                        toggleModal();
                      }}
                      size="sm"
                    >
                      Create new Bill
                    </Button>
                  </RenderWhen>
                </div>

                <div className="d-flex gap-3 mt-2">
                  <div>
                    <div className="d-flex">
                      <span>Arreras:</span>
                      <h6 className="display-6 fs-6 mb-0 ms-2">{payable}</h6>
                    </div>
                    <div className="d-flex">
                      <span>Advance Payment:</span>
                      <h6 className="display-6 fs-6 mb-0 ms-2">
                        {advancePayment}
                      </h6>
                    </div>
                    {ttlDeposit > 0 && (
                      <div className="d-flex">
                        <span>Total Deposit Remaining:</span>
                        <h6 className="display-6 fs-6 mb-0 ms-2">
                          {ttlDeposit}
                        </h6>
                      </div>
                    )}
                  </div>
                </div>
                <div className="d-flex align-items-center mt-2 flex-column">
                  <h6 className={`display-6 fs-6`}>{addmission.totalBills}</h6>
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

                  <div className="d-flex align-items-center">
                    <UncontrolledTooltip
                      placement="bottom"
                      target="expand-bills"
                    >
                      Show Bills
                    </UncontrolledTooltip>
                    <Button
                      onClick={() => {
                        toggleAccordian(idx.toString());
                        setAddmissionId(addmission?.addmissionId);
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
                        <Bills
                          toggleDateModal={toggleModal}
                          data={addmission.bills ?? []}
                          addmission={addmission}
                        />
                      )}
                    </AccordionBody>
                  </AccordionItem>
                </Accordion>
              </AddmissionCard>
            );
          })}
        </Row>
      </div>
    </div>
  );
};

Billing.propTypes = {
  patient: PropTypes.object,
  addmissionsBills: PropTypes.array,
  loading: PropTypes.bool,
};

const mapStateToProps = (state) => ({
  user: state.User.user,
  patient: state.Patient.patient,
  addmissionsBills: state.Bill.data,
  calculatedAdvance: state.Bill.calculatedAdvance,
  calculatedPayable: state.Bill.calculatedPayable,
  totalAdvance: state.Bill.totalAdvance,
  totalPayable: state.Bill.totalPayable,
  totalDeposit: state.Bill.totalDeposit,
  loading: state.Bill.billLoading,
  drafts: state.Bill.draftData,
});

export default connect(mapStateToProps)(Billing);
