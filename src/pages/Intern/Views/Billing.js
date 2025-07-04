import { useState } from "react";
import PropTypes from "prop-types";
import { Button, Row } from "reactstrap";
import BillDate from "../Modals/BillDate";
import BillForm from "../BillForm";
import Bills from "../Bills";
import RenderWhen from "../../../Components/Common/RenderWhen";
import { connect } from "react-redux";
import { GENERAL } from "../../../Components/constants/intern";
import CheckPermission from "../../../Components/HOC/CheckPermission";

const Billing = ({ drafts }) => {
  const [showDraft, setDraft] = useState(false);
  const [dateModal, setDateModal] = useState(false);
  const toggleModal = () => setDateModal(!dateModal);

  return (
    <div className="mt-3">
      <div></div>
      <div className="d-flex align-items-center justify-content-between">
        <div className="flex">
          <CheckPermission permission={"create"} subAccess={"Billing"}>
            <Button className="text-nowrap" onClick={toggleModal} size="sm">
              Create new Bill
            </Button>
          </CheckPermission>
        </div>

        <div className="d-flex justify-content-aroun align-items-center gap-3"></div>
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
      <BillDate isOpen={dateModal} toggle={toggleModal} />
      <BillForm type={GENERAL} />
      <Bills toggleDateModal={toggleModal} />
      <div className="mt-3">
        <Row className="timeline-right row-gap-5"></Row>
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
