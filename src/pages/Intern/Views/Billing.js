import React, { useEffect, useMemo, useState } from "react";
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
// import AddmissionCard from "./Components/AddmissionCard";
import RenderWhen from "../../../Components/Common/RenderWhen";

//redux
import { connect, useDispatch } from "react-redux";
import {
  InternAdmission,
  fetchBills,
  fetchDraftBills,
} from "../../../store/actions";
import {
  ADD_INTERN,
  EDIT_ADMISSION,
  GENERAL,
  RECEIPT,
} from "../../../Components/constants/intern";
import CheckPermission from "../../../Components/HOC/CheckPermission";

const Billing = ({
  user,
  intern,
  calculatedAdvance = 0,
  calculatedPayable = 0,
  drafts,
}) => {
  const dispatch = useDispatch();

  const [showDraft, setDraft] = useState(false);
  const [dateModal, setDateModal] = useState(false);
  const toggleModal = () => setDateModal(!dateModal);

  const handleAdmitPatient = () => {
    dispatch(InternAdmission({ data: null, isOpen: ADD_INTERN }));
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

  //   useEffect(() => {
  //     if (
  //       addmissionsBills.length &&
  //       !addmissionsBills.find((ch) => ch._id === addmissionId)
  //     ) {
  //       setOpen("0");
  //       setAddmissionId(addmissionsBills[0]?._id);
  //     }

  //     // eslint-disable-next-line react-hooks/exhaustive-deps
  //   }, [view, intern, addmissionsBills]);
  // useEffect(()=>{
  //       dispatch(fetchBills(addmissionId));

  //     // eslint-disable-next-line react-hooks/exhaustive-deps
  //   }, [dispatch, intern, addmissionId]);

  // useEffect(() => {
  //   dispatch(fetchDraftBills({ intern: intern._id }));
  // }, [dispatch, intern]);

  return (
    <div className="mt-3">
      <div></div>
      <div className="d-flex align-items-center justify-content-between">
        <div className="flex">
          <CheckPermission permission={"create"} subAccess={"Billing"}>
            {/* <RenderWhen isTrue={patient?.isAdmit}> */}
            <Button className="text-nowrap" onClick={toggleModal} size="sm">
              Create new Bill
            </Button>
            {/* </RenderWhen> */}
            {/* <RenderWhen isTrue={!patient?.isAdmit}>
              <Button className="ms-2" onClick={handleAdmitPatient} size="sm">
                Intern Admission
              </Button>
            </RenderWhen> */}
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

      {/* <RenderWhen isTrue={!patient?.isAdmit}> */}
      {/* <Alert
        className="mt-3 justify-content-center py-1 d-flex align-items-center"
        color="warning"
      >
        <i className="ri-alert-line label-icon fs-5 me-3"></i>Please add intern
        in order to create bills!
      </Alert> */}
      {/* </RenderWhen> */}
      <BillDate isOpen={dateModal} toggle={toggleModal} />
      <BillForm type={GENERAL} />
      <Bills toggleDateModal={toggleModal} />
      <div className="mt-3">
        {/* <div className="timeline-2">
          <div className="timeline-continue"> */}
        <Row className="timeline-right row-gap-5"></Row>
        {/* </div>
        </div> */}
      </div>
    </div>
  );
};

Billing.propTypes = {
  intern: PropTypes.object,
  loading: PropTypes.bool,
};

const mapStateToProps = (state) => ({
  user: state.User.user,
  intern: state.Intern.intern,
  calculatedAdvance: state.Bill.calculatedAdvance,
  calculatedPayable: state.Bill.calculatedPayable,
  totalAdvance: state.Bill.totalAdvance,
  totalPayable: state.Bill.totalPayable,
  totalDeposit: state.Bill.totalDeposit,
  loading: state.Bill.billLoading,
  drafts: state.Bill.draftData,
});

export default connect(mapStateToProps)(Billing);
