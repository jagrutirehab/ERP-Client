import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
// import _ from "lodash";

import { connect, useDispatch, useSelector } from "react-redux";
import { Row } from "reactstrap";
import Wrapper from "../../Patient/Components/Wrapper";

import {
  getInternReceiptById,
  toggleInternForm,
  togglePrint,
  createEditInternBill,
  removeInternReceipt,
} from "../../../store/actions";
import DeleteModal from "../../../Components/Common/DeleteModal";
import InternReceipt from "./Receipt";

const Bills = ({ bills, toggleDateModal, internId, intern }) => {
  const dispatch = useDispatch();
  const { isOpen, data } = useSelector((state) => state.Intern.billForm || {});

  const [bill, setBill] = useState({
    bill: null,
    isOpen: false,
  });

  const cancelDelete = () => {
    setBill({
      bill: null,
      isOpen: false,
    });
  };

  const deleteBill = () => {
    dispatch(removeInternReceipt(bill.bill.receipt._id));
    setBill({
      bill: null,
      isOpen: false,
    });
  };

  const getBill = (bill) => {
    setBill({
      bill,
      isOpen: true,
    });
  };
  const editBill = (bill) => {
    dispatch(
      createEditInternBill({ data: bill, bill: bill.bill, isOpen: false })
    );
    toggleDateModal();
  };

  // const printBill = (chart, intern) => {
  //   dispatch(
  //     togglePrint({ data: chart, modal: true, intern,  })
  //   );
  // };
  useEffect(() => {
    if (internId) {
      dispatch(getInternReceiptById(internId));
    }
  }, [dispatch, internId]);

  const printBill = (bill) => {
    dispatch(togglePrint({ data: bill, modal: true, intern }));
  };

  console.log(bills, "bills");

  return (
    <>
      <div className="timeline-2">
        <div className="timeline-continue">
          <Row className="timeline-right">
            {(bills || []).length > 0 &&
              (bills || [])
                // .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((item) => (
                  <Wrapper
                    key={item._id}
                    item={item}
                    name="Billing"
                    editItem={editBill}
                    deleteItem={getBill}
                    printItem={printBill}
                    toggleDateModal={toggleDateModal}
                    itemId={`${item?.id?.prefix}${item?.id?.internId}-${item?.id?.value}`}
                  >
                    <InternReceipt data={item} />
                  </Wrapper>
                ))}
          </Row>
        </div>
      </div>
      <DeleteModal
        onCloseClick={cancelDelete}
        onDeleteClick={deleteBill}
        show={bill.isOpen}
      />

      {/* Edit modal driven by Redux */}
      {/* {isOpen && (
        <InternReceipt
          data={data}
          toggleForm={() =>
            dispatch(createUpdate({ data: null, bill: null, isOpen: false }))
          }
          type="edit"
        />
      )} */}
    </>
  );
};

Bills.propTypes = {
  bills: PropTypes.array,
  internId: PropTypes.string,
  data: PropTypes.array,
  toggleDateModal: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  const intern = state.Intern.intern;
  const bills = Array.isArray(state.Intern.bills) ? state.Intern.bills : [];

  return {
    user: state.User.user,
    intern,
    internId: intern?._id,
    bills,
  };
};

export default connect(mapStateToProps)(Bills);
