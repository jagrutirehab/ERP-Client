import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { Container } from "reactstrap";
import { connect, useDispatch } from "react-redux";
import { fetchInterns, removedIntern } from "../../store/actions";
import { Route, Routes } from "react-router-dom";
import Sidebar from "./Sidebar";
import Main from "./Main";
import AddIntern from "./InternForm/AddInternform";
import Offcanvas from "./Offcanvas";
import DeleteModal from "../../Components/Common/DeleteModal";
import Print from "../../Components/Print";

const Intern = ({ centerAccess }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const LIMIT = 20;

  const [deleteIntern, setDeleteIntern] = useState({
    data: null,
    isOpen: false,
  });

  const [customActiveTab, setcustomActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const isFirstLoad = useRef(true);

  const toggleCustom = (tab) => {
    if (customActiveTab !== tab) {
      setcustomActiveTab(tab);
      setPage(1);
    }
  };

  const onCloseClick = () => {
    setDeleteIntern({ data: null, isOpen: false });
  };

  const getFilterParams = (pageNumber = 1) => {
    const base = {
      page: pageNumber,
      limit: LIMIT,
      name: searchQuery,
    };
    if (customActiveTab === "active") base.internStatus = "active";
    else if (customActiveTab === "completed") base.internStatus = "completed";
    return base;
  };

  const onDeleteClick = async () => {
    await dispatch(removedIntern(deleteIntern?.data));
    await dispatch(fetchInterns(getFilterParams(1)));
    setPage(1);
    navigate("/intern");
    onCloseClick();
  };

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      dispatch(fetchInterns(getFilterParams(page)));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  document.title = "Intern";

  return (
    <React.Fragment>
      <div className="page-content overflow-hidden">
        <div className="intern-page">
          <Container fluid>
            <div className="chat-wrapper d-lg-flex gap-1 mx-n4 my-n4 mb-n5 p-1">
              <Sidebar
                customActiveTab={customActiveTab}
                toggleCustom={toggleCustom}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                page={page}
                setPage={setPage}
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
  centerAccess: state.User?.centerAccess,
});

export default connect(mapStateToProps)(Intern);
