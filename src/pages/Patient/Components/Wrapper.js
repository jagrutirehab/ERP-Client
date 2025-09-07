import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Row,
  Col,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
} from "reactstrap";

//framer motion
import { motion } from "framer-motion";

import { format } from "date-fns";
import RenderWhen from "../../../Components/Common/RenderWhen";
import {
  ADVANCE_PAYMENT,
  INVOICE,
  IPD,
} from "../../../Components/constants/patient";
import { connect, useDispatch } from "react-redux";
import { createEditBill } from "../../../store/actions";
import CheckPermission from "../../../Components/HOC/CheckPermission";

const Wrapper = ({
  item,
  children,
  editItem,
  deleteItem,
  printItem,
  name,
  toggleDateModal,
  showId = true,
  showPrint = true,
  disableEdit = false,
  disableDelete = false,
  patient,
  itemId,
  extraOptions,
  clinicalTest
}) => {

  const dispatch = useDispatch();
  const chart = item?.chart;
  const bill = item?.bill;

  const chartName = chart
    ? chart
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
    : bill
      ? bill
        .toLowerCase()
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
      : "";

  return (
    <motion.div
      whileHover={{
        scale: 1,
      }}
      // onCli
      transition={{ duration: 0.5 }}
    // transition={{
    //   layout: {
    //     duration: 1.5,
    //   },
    // }}
    >
      <Col xs={12}>
        <div className="px-3 bg-white timeline-date border border-dark py-2">
          <div className="d-flex justify-content-center gap-3 align-items-center">
            <RenderWhen isTrue={showId}>
              {" "}
              <h6 className="fs-md-12 fs-xs-9 text-info">{itemId}</h6>
            </RenderWhen>
            <h5 className="display-6 fs-14 text-start">{chartName}</h5>
          </div>
          <div className="d-flex justify-content-between ">
            <div>
              <div className="d-flex align-items-center">
                <span className="fs-xs-9">Author:</span>
                <h6 className="fs-xs-11 display-6 fs-6 mb-0 ms-2">
                  {item?.author?.name}
                </h6>
              </div>
              <div className="d-flex align-items-center">
                <span className="fs-xs-9">Role:</span>
                <h6 className="fs-xs-11 display-6 fs-6 mb-0 ms-2">
                  {item?.author?.role}
                </h6>
              </div>
            </div>
            <div className="d-flex ">
              <div>
                <div className="d-flex align-items-start">
                  <span className="fs-xs-9">
                    On:{" "}
                    <span className="font-semi-bold">
                      {item?.date &&
                        format(new Date(item?.date), "dd MMMM yyyy")}
                    </span>
                  </span>
                </div>
                <div className="d-flex align-items-start">
                  <span className="fs-xs-9">
                    At:{" "}
                    <span className="font-semi-bold">
                      {item?.date && format(new Date(item?.date), "hh:mm a")}
                    </span>
                  </span>
                </div>
              </div>
              <div className="ms-3">
                <UncontrolledDropdown
                  direction="start"
                  className="col text-end"
                >
                  {!item.clinicalTest && item.clinicalTest != "ClinicalTest" && <DropdownToggle tag="a" id="dropdownMenuLink14" role="button">
                    <i className="bx bx-dots-vertical-rounded fs-4"></i>
                  </DropdownToggle>}
                  <DropdownMenu>
                    <RenderWhen isTrue={showPrint}>
                      <DropdownItem
                        onClick={() => printItem(item, patient)}
                        href="#"
                      >
                        <i className="ri-printer-line align-bottom text-muted me-2"></i>{" "}
                        Print
                      </DropdownItem>
                    </RenderWhen>
                    { !disableEdit &&  <CheckPermission permission={"edit"} subAccess={name}>
                      <DropdownItem
                        disabled={disableEdit}
                        onClick={() => {
                          editItem(item, patient);
                        }}
                        href="#"
                      >
                        <i className="ri-quill-pen-line align-bottom text-muted me-2"></i>{" "}
                        Edit
                      </DropdownItem>
                    </CheckPermission> }

                     { !disableEdit &&   <CheckPermission permission={"delete"} subAccess={name}>
                      <DropdownItem
                        disabled={disableDelete}
                        onClick={() => deleteItem(item)}
                        href="#"
                      >
                        {" "}
                        <i className="ri-delete-bin-5-line align-bottom text-muted me-2"></i>{" "}
                        Delete
                      </DropdownItem>
                    </CheckPermission> }
                   
                  
                    <RenderWhen
                      isTrue={item?.bill === INVOICE && item.type === IPD}
                    >
                      <DropdownItem
                        disabled={disableDelete}
                        onClick={() => {
                          dispatch(
                            createEditBill({
                              bill: ADVANCE_PAYMENT,
                              isOpen: false,
                              paymentAgainstBillNo: itemId,
                            })
                          );
                          toggleDateModal();
                        }}
                        href="#"
                      >
                        {" "}
                        <i className="ri-delete-bin-5-line align-bottom text-muted me-2"></i>{" "}
                        Pay
                      </DropdownItem>
                    </RenderWhen>
                    {extraOptions instanceof Function && extraOptions(item)}
                  </DropdownMenu>
                </UncontrolledDropdown>
              </div>
            </div>
          </div>
        </div>
      </Col>
      <Col xs={12}>
        <div className="timeline-box bg-white border-dark chart-bill-wrapper">
          <div className="timeline-text w-100">
            <div className="d-flex">
              {/* <img src={avatar7} alt="" className="avatar-sm rounded" /> */}
              <div className="flex-grow-1 w-100">{children}</div>
            </div>
          </div>
        </div>
      </Col>
    </motion.div>
  );
};

Wrapper.propTypes = {
  item: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
  editItem: PropTypes.func.isRequired,
  deleteItem: PropTypes.func.isRequired,
  printItem: PropTypes.func.isRequired,
  patient: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  patient: state.Patient.patient,
});

export default connect(mapStateToProps)(Wrapper);
