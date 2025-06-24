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
import {
  getRemovedCharts,
  removeChartPermanently,
} from "../../../store/actions";
import { Button } from "reactstrap";

const Chart = ({ centerAccess, charts }) => {
  const dispatch = useDispatch();
  const [chart, setChart] = useState({ data: null, isOpen: false });
  const [deleteChart, setDeleteChart] = useState({
    data: null,
    isOpen: false,
  });

  const [deleteCharts, setDeleteCharts] = useState({
    data: null,
    isOpen: false,
  });

  useEffect(() => {
    dispatch(getRemovedCharts());
  }, [dispatch]);

  const onCloseClick = () => {
    setDeleteChart({ data: null, isOpen: false });
    setDeleteCharts({ data: null, isOpen: false });
  };

  const onDeleteClick = () => {
    dispatch(removeChartPermanently(deleteChart?.data));
    onCloseClick();
  };

  const onChartsDeleteClick = () => {
    dispatch(
      removeChartPermanently(charts.map((bl) => bl._id)) //JSON.stringify(bills.map((bl) => bl._id))
    );
    onCloseClick();
  };

  const renderList = useMemo(() => {
    return (
      <div className="">
        <PerfectScrollbar className="chat-room-list">
          <List
            charts={charts}
            setChart={setChart}
            setDeleteChart={setDeleteChart}
          />
        </PerfectScrollbar>
      </div>
    );
  }, [charts]);

  return (
    <React.Fragment>
      <div className="w-100">
        <div className="p-4">
          <BreadCrumb title={"Deleted Charts"} />
        </div>
        <div className="px-2 mb-2 text-end">
          <Button
            onClick={() => setDeleteCharts({ data: null, isOpen: true })}
            className="text-white"
            size="sm"
            color="danger"
          >
            Clear bin
          </Button>
        </div>
        <DeleteModal
          show={deleteCharts?.isOpen}
          onCloseClick={onCloseClick}
          onDeleteClick={onChartsDeleteClick}
        />
        <DeleteModal
          show={deleteChart?.isOpen}
          onCloseClick={onCloseClick}
          onDeleteClick={onDeleteClick}
        />
        {renderList}
      </div>
    </React.Fragment>
  );
};

Chart.propTypes = {
  centerAccess: PropTypes.array.isRequired,
  charts: PropTypes.array,
};

const mapStateToProps = (state) => ({
  charts: state.Recyclebin.charts,
});

export default connect(mapStateToProps)(Chart);
