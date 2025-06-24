import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import BreadCrumb from "../../../Components/Common/BreadCrumb";

//Import Scrollbar
import PerfectScrollbar from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";
import List from "./List";
import DeleteModal from "../../../Components/Common/DeleteModal";

//redux
import { connect, useDispatch } from "react-redux";
import {
  getRemovedMedicines,
  removeMedicinePermanently,
} from "../../../store/actions";

const Medicine = ({ centerAccess, medicines }) => {
  const dispatch = useDispatch();
  const [medicine, setMedicine] = useState({ data: null, isOpen: false });
  const [deleteMedicine, setDeleteMedicine] = useState({
    data: null,
    isOpen: false,
  });

  useEffect(() => {
    dispatch(getRemovedMedicines());
  }, [dispatch]);

  const onCloseClick = () => {
    setDeleteMedicine({ data: null, isOpen: false });
  };

  const onDeleteClick = () => {
    dispatch(removeMedicinePermanently(deleteMedicine?.data));
    onCloseClick();
  };

  return (
    <React.Fragment>
      <div className="w-100">
        <div className="p-4">
          <BreadCrumb title={"Deleted Medicines"} />
        </div>
        <DeleteModal
          show={deleteMedicine?.isOpen}
          onCloseClick={onCloseClick}
          onDeleteClick={onDeleteClick}
        />
        <div className="">
          <PerfectScrollbar className="chat-room-list">
            <List
              medicines={medicines}
              setMedicine={setMedicine}
              setDeleteMedicine={setDeleteMedicine}
            />
          </PerfectScrollbar>
        </div>
      </div>
    </React.Fragment>
  );
};

Medicine.propTypes = {
  centerAccess: PropTypes.array.isRequired,
  medicines: PropTypes.array,
};

const mapStateToProps = (state) => ({
  medicines: state.Recyclebin.medicines,
});

export default connect(mapStateToProps)(Medicine);
