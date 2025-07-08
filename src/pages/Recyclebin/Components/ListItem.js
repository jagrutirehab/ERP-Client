import React from "react";
import PropTypes from "prop-types";
import { UncontrolledTooltip } from "reactstrap";

const ListItem = ({
  profilePicture,
  title,
  viewDetails,
  restore,
  deleteItem,
}) => {
  return (
    <li className="bg-white shadow-lg py-2">
      <div className="d-flex align-items-center px-3">
        <div className="flex-shrink-0 chat-user-img online align-self-center me-2 ms-0">
          <div className="avatar-xxs">
            {profilePicture ? (
              <img
                src={profilePicture}
                className="rounded-circle img-fluid userprofile"
                alt=""
              />
            ) : (
              <div className="avatar-title rounded-circle bg-success userprofile">
                C
              </div>
            )}
          </div>
          <span className="user-status"></span>
        </div>
        <div className="flex-grow-1 overflow-hidden">
          <p className="text-truncate font-semi-bold fs-15 mb-0">
            {title || ""}
          </p>
        </div>
        <div className="flex-shrink-0 gap-3 d-flex align-items-center">
          <button onClick={viewDetails} className="btn btn-info btn-sm">
            View details
          </button>
          <button
            onClick={restore}
            id="restore-patient"
            className="btn bg-light btn-sm"
          >
            <i className="bx bx-reset text-success align-bottom fs-4"></i>
            <UncontrolledTooltip target={"restore-patient"}>
              Restore
            </UncontrolledTooltip>
          </button>
          <button
            onClick={deleteItem}
            id="delete-permenantly"
            className="btn bg-light btn-sm"
          >
            <i className="ri-delete-bin-2-line text-danger align-bottom fs-6"></i>
            <UncontrolledTooltip target={"delete-permenantly"}>
              Delete Permanently
            </UncontrolledTooltip>
          </button>
        </div>
      </div>
    </li>
  );
};

ListItem.propTypes = {
  profilePicture: PropTypes.string,
  title: PropTypes.string,
  viewDetails: PropTypes.func,
  restore: PropTypes.func,
  deleteItem: PropTypes.func,
};

export default ListItem;
