import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import BreadCrumb from "../../../Components/Common/BreadCrumb";

//Import Scrollbar
import PerfectScrollbar from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";
import List from "./List";
import DeleteModal from "../../../Components/Common/DeleteModal";

//redux
import { connect, useDispatch } from "react-redux";
import { getRemovedBills, removeBillPermanently } from "../../../store/actions";
import { Button, Spinner } from "reactstrap";

const Bill = ({ centerAccess, bills }) => {
  const dispatch = useDispatch();
  const [bill, setBill] = useState({ data: null, isOpen: false });
  const [deleteBill, setDeleteBill] = useState({
    data: null,
    isOpen: false,
  });
  const [loading, setLoading] = useState(false);

  const [deleteBills, setDeleteBills] = useState({
    data: null,
    isOpen: false,
  });

  useEffect(() => {
    if(bills && bills.length > 0) return;
    const loadDeletedBills = async () => {
      try {
        setLoading(true);
        await dispatch(getRemovedBills()).unwrap();
      } catch (error) {
        setLoading(false);
      }
    };

    loadDeletedBills();
  }, [dispatch]);

  const onCloseClick = () => {
    setDeleteBill({ data: null, isOpen: false });
    setDeleteBills({ data: null, isOpen: false });
  };

  const onDeleteClick = () => {
    dispatch(
      removeBillPermanently([deleteBill?.data]) //JSON.stringify([deleteBill?.data])
    );
    onCloseClick();
  };

  const onBillsDeleteClick = () => {
    dispatch(
      removeBillPermanently(bills.map((bl) => bl._id)) //JSON.stringify(bills.map((bl) => bl._id))
    );
    onCloseClick();
  };

  const renderList = useMemo(() => {
    if (loading) {
      return (
        <div className="d-flex justify-content-center align-items-center p-3">
          <Spinner color="primary" />
        </div>
      );
    }
    return (
      <div className="">
        <PerfectScrollbar className="chat-room-list">
          <List bills={bills} setBill={setBill} setDeleteBill={setDeleteBill} />
        </PerfectScrollbar>
      </div>
    );
  }, [bills, loading]);

  return (
    <React.Fragment>
      <div className="w-100">
        <div className="p-4">
          <BreadCrumb title={"Deleted Bills"} />
        </div>
        <div className="px-2 mb-2 text-end">
          <Button
            onClick={() => setDeleteBills({ data: null, isOpen: true })}
            className="text-white"
            size="sm"
            color="danger"
          >
            Clear bin
          </Button>
        </div>
        <DeleteModal
          show={deleteBills?.isOpen}
          onCloseClick={onCloseClick}
          onDeleteClick={onBillsDeleteClick}
        />
        <DeleteModal
          show={deleteBill?.isOpen}
          onCloseClick={onCloseClick}
          onDeleteClick={onDeleteClick}
        />
        {renderList}
      </div>
    </React.Fragment>
  );
};

Bill.propTypes = {
  centerAccess: PropTypes.array.isRequired,
  bills: PropTypes.array,
};

const mapStateToProps = (state) => ({
  bills: state.Recyclebin.bills,
});

export default connect(mapStateToProps)(Bill);
