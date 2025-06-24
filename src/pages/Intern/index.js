import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Container } from "reactstrap";
import { connect, useDispatch } from "react-redux";
import {
removedIntern
} from "../../store/actions";
import { Route, Routes } from "react-router-dom";
import Sidebar from "./Sidebar";
import Main from "./Main";
import AddIntern from "./InternForm/AddInternform";
import Offcanvas from "./Offcanvas";
import DeleteModal from "../../Components/Common/DeleteModal";
import { ALL_INTERNS } from "../../Components/constants/intern";
import Print from "../../Components/Print";

const Intern = ({ centerAccess }) => {
  const dispatch = useDispatch();
  const [deleteIntern, setDeleteIntern] = useState({
    data: null,
    isOpen: false,
  });

  const [customActiveTab, setcustomActiveTab] = useState(ALL_INTERNS);
  const toggleCustom = (tab) => {
    if (customActiveTab !== tab) {
      setcustomActiveTab(tab);
    }
  };

  const onCloseClick = () => {
    setDeleteIntern({ data: null, isOpen: false });
  };

  const onDeleteClick = () => {
    // dispatch(removeIntern(deleteIntern?.data));
    dispatch(removedIntern(deleteIntern?.data));

    onCloseClick();
  };

  useEffect(() => {
    // dispatch();
    // fetchInterns({
    //   type: customActiveTab,
    //   centerAccess,
    //   skip: 0,
    // })
  }, [dispatch, centerAccess, customActiveTab]);

  document.title = "Intern";

  return (
    <React.Fragment>
      <div className="page-conten overflow-hidden">
        <div className="intern-page">
          <Container fluid>
            <div className="chat-wrapper d-lg-flex gap-1 mx-n4 my-n4 mb-n5 p-1">
              <Sidebar
                customActiveTab={customActiveTab}
                toggleCustom={toggleCustom}
              />
              <Print />
              <Offcanvas />
              <AddIntern />
              <DeleteModal
                show={deleteIntern?.isOpen}
                onCloseClick={onCloseClick}
                onDeleteClick={onDeleteClick}
              />
              <Routes>
                <Route
                  path={`/:id`}
                  element={
                    <Main
                      deleteIntern={deleteIntern}
                      setDeleteIntern={setDeleteIntern}
                    />
                  }
                />
              </Routes>
            </div>
          </Container>
        </div>
      </div>
    </React.Fragment>
  );
};

Intern.propTypes = {
  centerAccess: PropTypes.array.isRequired,
};

const mapStateToProps = (state) => ({
  centerAccess: state.User.centerAccess,
});

export default connect(mapStateToProps)(Intern);
