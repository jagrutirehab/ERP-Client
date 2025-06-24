import React from "react";
import PropTypes from "prop-types";
// import { UncontrolledTooltip } from "reactstrap";
// import { Link } from "react-router-dom";

//redux
import { useDispatch } from "react-redux";
import ListItem from "../Components/ListItem";
import { restoreChart } from "../../../store/actions";
// import { restoreMedicine } from "../../../store/actions";

const List = ({ charts, setChart, setDeleteChart }) => {
  const dispatch = useDispatch();
  return (
    <React.Fragment>
      <div className="chat-message-list">
        <ul
          className="list-unstyled chat-list chat-user-list users-list px-2"
          id="userList"
        >
          {(charts || []).map((chart, idx) => (
            <ListItem
              key={chart?._id}
              title={`${chart?.chart} (${chart?.id?.prefix}${chart?.id?.patientId}-${chart?.id?.value}) - ${chart.patient?.name} (${chart.center?.title})`}
              //   profilePicture={chart?.profilePicture?.url}
              viewDetails={() => setChart({ data: chart, isOpen: true })}
              restore={() => dispatch(restoreChart({ id: chart?._id }))}
              deleteItem={() =>
                setDeleteChart({ data: chart?._id, isOpen: true })
              }
            />
          ))}
        </ul>
      </div>
    </React.Fragment>
  );
};

List.propTypes = {
  charts: PropTypes.array,
};

export default List;
