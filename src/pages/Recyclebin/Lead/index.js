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
import { getRemovedLeads, removeLeadPermanently } from "../../../store/actions";

const Lead = ({ centerAccess, leads }) => {
  const dispatch = useDispatch();
  const [lead, setLead] = useState({ data: null, isOpen: false });
  const [deleteLead, setDeleteLead] = useState({
    data: null,
    isOpen: false,
  });

  useEffect(() => {
    dispatch(getRemovedLeads());
  }, [dispatch]);

  const onCloseClick = () => {
    setDeleteLead({ data: null, isOpen: false });
  };

  const onDeleteClick = () => {
    dispatch(removeLeadPermanently(deleteLead?.data));
    onCloseClick();
  };

  return (
    <React.Fragment>
      <div className="w-100">
        <div className="p-4">
          <BreadCrumb title={"Deleted Leads"} />
        </div>
        <DeleteModal
          show={deleteLead?.isOpen}
          onCloseClick={onCloseClick}
          onDeleteClick={onDeleteClick}
        />
        <div className="">
          <PerfectScrollbar className="chat-room-list">
            <List
              leads={leads}
              setLead={setLead}
              setDeleteLead={setDeleteLead}
            />
          </PerfectScrollbar>
        </div>
      </div>
    </React.Fragment>
  );
};

Lead.propTypes = {
  centerAccess: PropTypes.array.isRequired,
  leads: PropTypes.array,
};

const mapStateToProps = (state) => ({
  leads: state.Recyclebin.leads,
});

export default connect(mapStateToProps)(Lead);
