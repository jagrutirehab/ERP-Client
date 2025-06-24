import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { connect, useDispatch } from "react-redux";
import {
  getRemovedCenters,
  removeCenterPermanently,
} from "../../../store/actions";

//Import Scrollbar
import PerfectScrollbar from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";

//components
import List from "./List";
import DeleteModal from "../../../Components/Common/DeleteModal";
import Offcanvas from "./Offcanvas";

const Center = ({ centerAccess, centers }) => {
  const dispatch = useDispatch();
  const [center, setCenter] = useState({ data: null, isOpen: false });
  const [deleteCenter, setDeleteCenter] = useState({
    data: null,
    isOpen: false,
  });

  useEffect(() => {
    dispatch(getRemovedCenters(centerAccess));
  }, [dispatch, centerAccess]);

  const onCloseClick = () => {
    setDeleteCenter({ data: null, isOpen: false });
  };

  const onDeleteClick = () => {
    dispatch(removeCenterPermanently(deleteCenter?.data));
    onCloseClick();
  };

  return (
    <React.Fragment>
      <div className="w-100">
        <div className="p-4">
          <BreadCrumb title={"Deleted Centers"} />
        </div>
        <Offcanvas center={center} setCenter={setCenter} />
        <DeleteModal
          show={deleteCenter?.isOpen}
          onCloseClick={onCloseClick}
          onDeleteClick={onDeleteClick}
        />
        <div className="">
          <PerfectScrollbar className="chat-room-list">
            <List
              centers={centers}
              setCenter={setCenter}
              setDeleteCenter={setDeleteCenter}
            />
          </PerfectScrollbar>
        </div>
      </div>
    </React.Fragment>
  );
};

Center.propTypes = {
  centerAccess: PropTypes.array.isRequired,
  centers: PropTypes.array.isRequired,
};

const mapStateToProps = (state) => ({
  centers: state.Recyclebin.centers,
});

export default connect(mapStateToProps)(Center);
