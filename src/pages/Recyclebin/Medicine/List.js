import React from "react";
import PropTypes from "prop-types";
import { UncontrolledTooltip } from "reactstrap";
import { Link } from "react-router-dom";

//redux
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
              //   profilePicture={medicine?.profilePicture?.url}
              viewDetails={() => setMedicine({ data: medicine, isOpen: true })}
              restore={() => dispatch(restoreMedicine({ id: medicine?._id }))}
              deleteItem={() =>
                setDeleteMedicine({ data: medicine?._id, isOpen: true })
              }
            />
            // <li
            //   key={pt._id}
            //   className="bg-white shadow-lg  py-2"
            //   // className={patient?._id === pt._id ? "active" : ""}
            // >
            //   <Link onClick={() => {}} to={`#`}>
            //     <div className="d-flex align-items-center">
            //       <div className="flex-shrink-0 chat-user-img online align-self-center me-2 ms-0">
            //         <div className="avatar-xxs">
            //           {pt?.profilePicture ? (
            //             <img
            //               src={pt.profilePicture.url}
            //               className="rounded-circle img-fluid userprofile"
            //               alt=""
            //             />
            //           ) : (
            //             <div
            //               className={
            //                 "avatar-title rounded-circle bg-success userprofile"
            //               }
            //             >
            //               C
            //             </div>
            //           )}
            //         </div>
            //         <span className="user-status"></span>
            //       </div>
            //       <div className="flex-grow-1 overflow-hidden">
            //         <p className="text-truncate font-semi-bold fs-15 mb-0">
            //           {pt.name || ""}
            //         </p>
            //       </div>
            //       <div className="flex-shrink-0 gap-3 d-flex align-items-center">
            //         <button
            //           onClick={() => setMedicine({ data: pt, isOpen: true })}
            //           size="sm"
            //           className="btn btn-info btn-sm"
            //         >
            //           View details
            //         </button>
            //         <button
            //           onClick={() => dispatch(restorePatient({ id: pt?._id }))}
            //           id="restore-patient"
            //           className="btn bg-light btn-sm"
            //         >
            //           <i className="bx bx-reset text-success align-bottom fs-4"></i>{" "}
            //           <UncontrolledTooltip target={"restore-patient"}>
            //             Restore
            //           </UncontrolledTooltip>
            //         </button>
            //         <button
            //           onClick={() =>
            //             setDeleteMedicine({ data: pt?._id, isOpen: true })
            //           }
            //           id="delete-permenantly"
            //           className="btn bg-light btn-sm"
            //         >
            //           <i className="ri-delete-bin-2-line text-danger align-bottom fs-6"></i>{" "}
            //           <UncontrolledTooltip target={"delete-permenantly"}>
            //             Delete Permenantly
            //           </UncontrolledTooltip>
            //         </button>
            //       </div>
            //     </div>
            //   </Link>
            // </li>
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
