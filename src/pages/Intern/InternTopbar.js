import React, { useEffect } from "react";
import PropTypes from "prop-types";
import {
  Button,
  UncontrolledTooltip,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import CheckPermission from "../../Components/HOC/CheckPermission";
import { toggleInternForm } from "../../store/actions";
const InternTopbar = ({ setDeleteIntern }) => {
  const { id } = useParams();

  useEffect(() => {}, [id]);
  const dispatch = useDispatch();
  const intern = useSelector((state) => state.Intern.intern);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const toggle = () => setDropdownOpen((prevState) => !prevState);

  const handleEdit = () => {
    dispatch(toggleInternForm({ data: intern, isOpen: true }));
  };

  const handleDelete = () => {
    setDeleteIntern({ data: intern?._id, isOpen: true });
  };

  return (
    <div className="p-3 p-lg-4 border-bottom user-chat-topbar">
      <br></br>
      <br></br>
      <br></br>
      <div className="row align-items-center">
        <div className="col-sm-4 col-8">
          <div className="d-flex align-items-center">
            <div className="flex-shrink-0 d-block d-lg-none me-2">
              <Link to="/intern" className="user-chat-remove text-muted p-2">
                <i className="ri-arrow-left-s-line"></i>
              </Link>
            </div>
            <div className="flex-grow-1 overflow-hidden">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0 chat-user-img online user-own-img align-self-center me-3">
                  <div className="avatar-xxs">
                    {intern?.profilePicture ? (
                      <img
                        src={intern?.profilePicture.url}
                        className="rounded-circle img-fluid userprofile"
                        alt=""
                      />
                    ) : (
                      <div className="avatar-title rounded-circle bg-success userprofile">
                        {intern?.name?.slice(0, 1)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-grow-1 overflow-hidden">
                  <h5 className="font-size-16 mb-0 text-truncate">
                    {intern?.name}
                    <span className="ms-2 text-muted fs-14">
                      ({`${intern?.id?.prefix}${intern?.id?.value}`})
                    </span>
                  </h5>
                  <p className="text-truncate mb-0">
                    <small className="text-success">
                      {intern?.courseProgram}
                    </small>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-8 col-4">
          <ul className="list-inline user-chat-nav text-end mb-0">
            <li className="list-inline-item">
              <CheckPermission permission="update">
                <UncontrolledTooltip placement="bottom" target="edit">
                  Edit Intern
                </UncontrolledTooltip>
                <Button
                  color=""
                  id="edit"
                  className="btn btn-soft-primary btn-sm"
                  onClick={handleEdit}
                >
                  <i className="ri-pencil-line"></i>
                </Button>
              </CheckPermission>
            </li>
            <li className="list-inline-item">
              <CheckPermission permission="delete">
                <Dropdown isOpen={dropdownOpen} toggle={toggle}>
                  <DropdownToggle
                    color=""
                    className="bx bx-dots-vertical-rounded fs-4"
                    id="delete"
                  ></DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem onClick={handleEdit}>
                      <i className="ri-quill-pen-line align-bottom text-muted me-2"></i>
                      Edit
                    </DropdownItem>
                    <DropdownItem onClick={handleDelete}>
                      <i className="ri-delete-bin-2-line me-2"></i>
                      Delete
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </CheckPermission>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

InternTopbar.propTypes = {
  deleteIntern: PropTypes.object,
  setDeleteIntern: PropTypes.func,
};

export default InternTopbar;
