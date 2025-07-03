import React from "react";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import ListItem from "../Components/ListItem";
import { restoreMedicine } from "../../../store/actions";

const List = ({ medicines, setMedicine, setDeleteMedicine }) => {
  const dispatch = useDispatch();
  return (
    <React.Fragment>
      <div className="chat-message-list">
        <ul
          className="list-unstyled chat-list chat-user-list users-list px-2"
          id="userList"
        >
          {(medicines || []).map((medicine, idx) => (
            <ListItem
              key={medicine?._id}
              title={medicine?.drugName}
              viewDetails={() => setMedicine({ data: medicine, isOpen: true })}
              restore={() => dispatch(restoreMedicine({ id: medicine?._id }))}
              deleteItem={() =>
                setDeleteMedicine({ data: medicine?._id, isOpen: true })
              }
            />
          ))}
        </ul>
      </div>
    </React.Fragment>
  );
};

List.propTypes = {
  medicines: PropTypes.array,
};

export default List;
