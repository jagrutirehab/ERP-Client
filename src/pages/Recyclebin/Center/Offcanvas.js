import React, { useEffect } from "react";
import PropTypes from "prop-types";
import {
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  Label,
  Offcanvas as CenterOffCanvas,
  OffcanvasBody,
  Row,
  UncontrolledDropdown,
} from "reactstrap";
import { Link } from "react-router-dom";

import smallImage9 from "../../../assets/images/small/img-9.jpg";

//redux
import { connect, useDispatch } from "react-redux";
import { countPatientDocuments } from "../../../store/actions";

const Offcanvas = ({ center, setCenter }) => {
  const dispatch = useDispatch();
  const toggleOffCanvas = () => {
    setCenter({ data: null, isOpen: false });
  };

  const data = center?.data;

  useEffect(() => {
    if (center?.data) dispatch(countPatientDocuments(center.data._id));
  }, [dispatch, center]);

  return (
    <React.Fragment>
      <CenterOffCanvas
        isOpen={center?.isOpen}
        direction="end"
        toggle={toggleOffCanvas}
        className="offcanvas-end border-0"
        tabIndex="-1"
      >
        <OffcanvasBody className="profile-offcanvas p-0">
          <div className="team-cover">
            <img src={smallImage9} alt="" className="img-fluid" />
          </div>
          <div className="p-3">
            <div className="team-settings">
              <Row>
                <Col>
                  <div className="bookmark-icon flex-shrink-0 me-2">
                    <Input
                      type="checkbox"
                      id="favourite13"
                      className="bookmark-input bookmark-hide"
                    />
                    <Label htmlFor="favourite13" className="btn-star">
                      <svg width="20" height="20">
                        {/* <use xlink:href="#icon-star"/> */}
                      </svg>
                    </Label>
                  </div>
                </Col>
                <UncontrolledDropdown
                  direction="start"
                  className="col text-end"
                >
                  <DropdownToggle tag="a" id="dropdownMenuLink14" role="button">
                    <i className="ri-more-fill fs-17"></i>
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem>
                      <i className="ri-eye-line me-2 align-middle" />
                      View
                    </DropdownItem>
                    <DropdownItem>
                      <i className="ri-star-line me-2 align-middle" />
                      Favorites
                    </DropdownItem>
                    <DropdownItem>
                      <i className="ri-delete-bin-5-line me-2 align-middle" />
                      Delete
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              </Row>
            </div>
          </div>
          <div className="p-3 text-center">
            <img
              src={data?.profilePicture?.url}
              alt=""
              className="avatar-lg img-thumbnail rounded-circle mx-auto"
            />
            <div className="mt-3">
              <h5 className="fs-15">
                <Link to="#" className="link-primary">
                  {data?.title}
                </Link>
              </h5>
            </div>
          </div>

          <div className="p-3">
            <h5 className="fs-15 mb-3">Center Details</h5>
            <div className="mb-3">
              <p className="text-muted text-uppercase fw-semibold fs-12 mb-2">
                Address
              </p>
              <h6>{data?.address}</h6>
            </div>
            <div className="mb-3">
              <p className="text-muted text-uppercase fw-semibold fs-12 mb-2">
                Bank Name
              </p>
              <h6>{data?.bankName}</h6>
            </div>
            <div>
              <p className="text-muted text-uppercase fw-semibold fs-12 mb-2">
                Account Number
              </p>
              <h6 className="mb-0">{data?.accountNumber}</h6>
            </div>
            <div>
              <p className="text-muted text-uppercase fw-semibold fs-12 mb-2">
                Account Holder Name
              </p>
              <h6 className="mb-0">{data?.accountHolderName}</h6>
            </div>
            <div>
              <p className="text-muted text-uppercase fw-semibold fs-12 mb-2">
                Branch Name
              </p>
              <h6 className="mb-0">{data?.branchName}</h6>
            </div>
          </div>
        </OffcanvasBody>
      </CenterOffCanvas>
    </React.Fragment>
  );
};

Offcanvas.propTypes = {
  center: PropTypes.object,
  setCenter: PropTypes.func,
};

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps)(Offcanvas);
