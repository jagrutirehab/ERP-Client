import React from "react";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import ListItem from "../Components/ListItem";
import { removedIntern } from "../../../store/actions";

const List = ({
  interns,
  setSelectedIntern,
  setDeleteIntern,
  setPage,
  page,
  totalPages,
  searchQuery,
  setSearchQuery,
  refresh,
}) => {
  const dispatch = useDispatch();

  const internList = Array.isArray(interns) ? interns : [];

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handleRestore = async (id) => {
    try {
      await dispatch(removedIntern(id));
      refresh();
    } catch (error) {
      console.error("Failed to restore intern", error);
    }
  };

  return (
    <div className="chat-message-list px-3">
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <ul
        className="list-unstyled chat-list chat-user-list users-list px-2"
        id="userList"
      >
        {internList.length > 0 ? (
          internList.map((intern) => (
            <ListItem
              key={intern?._id}
              profilePicture={intern?.profilePicture?.url}
              title={intern?.fullName || intern?.name || "Unnamed Intern"}
              viewDetails={() =>
                setSelectedIntern({ data: intern, isOpen: true })
              }
              restore={() => handleRestore(intern?._id)}
              deleteItem={() =>
                setDeleteIntern({ data: intern?._id, isOpen: true })
              }
            />
          ))
        ) : (
          <li className="text-muted text-center py-3">No interns found</li>
        )}
      </ul>
      <div className="d-flex justify-content-between align-items-center mt-3 px-2">
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={handlePrev}
          disabled={page === 1}
        >
          Previous
        </button>

        <span className="text-muted">
          Page {page} of {totalPages}
        </span>

        <button
          className="btn btn-sm btn-outline-primary"
          onClick={handleNext}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

List.propTypes = {
  interns: PropTypes.array.isRequired,
  setSelectedIntern: PropTypes.func.isRequired,
  setDeleteIntern: PropTypes.func.isRequired,
  setPage: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  searchQuery: PropTypes.string.isRequired,
  setSearchQuery: PropTypes.func.isRequired,
};

export default List;
