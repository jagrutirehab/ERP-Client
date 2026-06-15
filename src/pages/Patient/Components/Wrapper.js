import React, { useState as useReactState } from "react";
import PropTypes from "prop-types";
import {
  Col,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  Input,
  Label,
} from "reactstrap";
import { APIClient } from "../../../helpers/api_helper";
import { toast } from "react-toastify";
 
//framer motion
import { motion } from "framer-motion";

import { format } from "date-fns";
import RenderWhen from "../../../Components/Common/RenderWhen";
import {
  ADVANCE_PAYMENT,
  INVOICE,
  IPD,
  WRITE_OFF,
} from "../../../Components/constants/patient";
import { connect, useDispatch } from "react-redux";
import { createEditBill, fetchCharts, fetchGeneralCharts, fetchChartsAddmissions } from "../../../store/actions";
import { validateChart, validateAISummary, validateAIExpirySummary } from "../../../helpers/backend_helper";
import CheckPermission from "../../../Components/HOC/CheckPermission";
import ValidateConfirmationModal from "../ChartForm/Components/ValidateConfirmationModal";

const Wrapper = ({
  item,
  data,
  children,
  editItem,
  deleteItem,
  printItem,
  name,
  toggleDateModal,
  hideDropDown = false,
  showId = true,
  showPrint = true,
  disableEdit = false,
  disableDelete = false,
  patient,
  itemId,
  extraOptions,
  clinicalTest,
  geminiResponseIsVerified,
  geminiResponseGeneratedBy,
  validatorId,
  doctorValidatorId,
  user,
}) => {
  const dispatch = useDispatch();
  const [showRelatives, setShowRelatives] = React.useState(
    item?.showToRelatives || false,
  );
  const [copied, setCopied] = useReactState(false);
  const chart = item?.chart;
  const bill = item?.bill;

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(item?._id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Failed to copy ID");
    }
  };

  const needsValidation = chart && item.needsValidation && !item.doctorValidatorId;
  const needsAIValidation = !!item.geminiResponseGeneratedBy && !item.validatorId;
  const canPrint = showPrint &&
    (!item.needsValidation || !!item.doctorValidatorId) &&
    (!item.geminiResponseGeneratedBy || !!item.validatorId);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [pendingAction, setPendingAction] = React.useState(null); // 'doctor' | 'ai'
  const [loading, setLoading] = React.useState(false);

  const openModal = (action) => {
    setPendingAction(action);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setPendingAction(null);
  };

  const refreshCharts = () => {
    if (item.type === "GENERAL") {
      dispatch(fetchGeneralCharts({ patient: item.patient, type: "GENERAL" }));
    } else if (item.type === "OPD") {
      dispatch(fetchGeneralCharts({ patient: item.patient, type: "OPD" }));
    } else {
      dispatch(fetchCharts({ addmissionId: item.addmission, chartType: "All" }));
      if (item.addmission) {
        dispatch(fetchChartsAddmissions([item.addmission]));
      }
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      if (pendingAction === "ai") {
        const summaryId = item.chart === "EXPIRY_SUMMARY"
          ? item.expirySummary?._id
          : item.dischargeSummary?._id;
        if (item.chart === "EXPIRY_SUMMARY") {
          await validateAIExpirySummary({ summary: summaryId });
        } else {
          await validateAISummary({ summary: summaryId });
        }
        toast.success("AI content validated successfully");
      } else {
        await validateChart(item._id);
        toast.success("Chart validated successfully");
      }
      refreshCharts();
    } catch (err) {
      toast.error(err.message || "Failed to validate");
    } finally {
      setLoading(false);
      closeModal();
    }
  };

  const handleToggleRelatives = async (e) => {
    e.stopPropagation();
    const newValue = e.target.checked;
    setShowRelatives(newValue);
    try {
      const api = new APIClient();
      await api.update(`/chart/${item._id}/toggle-relatives`, {
        showToRelatives: newValue,
      });
      toast.success("Chart visibility updated");
    } catch (error) {
      setShowRelatives(!newValue);
      toast.error("Failed to update chart visibility");
    }
  };


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
            {user?.email === "owais@gmail.com" && (
              <button
                type="button"
                onClick={handleCopyId}
                title="Copy ID"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "2px 4px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <i
                  className={`ri-${copied ? "check" : "file-copy"}-line fs-6 ${
                    copied ? "text-success" : "text-muted"
                  }`}
                />
              </button>
            )}
            <h5 className="display-6 fs-14 text-start d-flex align-items-center gap-2">
              {chartName === "Mental Examination" ? "Clinical Note" : chartName}

              {geminiResponseGeneratedBy && (
                <span
                  className="rounded-circle d-inline-flex align-items-center justify-content-center bg-success text-white"
                  style={{
                    width: "18px",
                    height: "18px",
                    fontSize: "10px",
                  }}
                >
                  AI
                </span>
              )}

              {needsAIValidation && (
                <span
                  className="badge badge-soft-info d-inline-flex align-items-center py-1 px-2 ms-2"
                  style={{ fontSize: "11px" }}
                >
                  <i className="ri-robot-line me-1"></i> AI-Summary Validation Pending
                </span>
              )}
              {needsValidation && !needsAIValidation && (
                <span
                  className="badge badge-soft-warning d-inline-flex align-items-center py-1 px-2 ms-2"
                  style={{ fontSize: "11px" }}
                >
                  <i className="ri-time-line me-1"></i> Pending Validation By Doctor
                </span>
              )}
            </h5>
            <RenderWhen isTrue={!bill && chart && item.type === "IPD"}>
              <div className="form-check form-switch ms-3 d-flex align-items-center">
                <Input
                  type="checkbox"
                  role="switch"
                  id={`switch-relatives-${item?._id}`}
                  checked={showRelatives}
                  onChange={handleToggleRelatives}
                />
                <Label
                  className="form-check-label fs-xs-11 ms-2 mb-0"
                  htmlFor={`switch-relatives-${item?._id}`}
                >
                  Show to relatives
                </Label>
              </div>
            </RenderWhen>
          </div>
          <div className="d-flex justify-content-between ">
            <div>
              {validatorId && (
                <div className="d-flex align-items-center">
                  <span className="fs-xs-9">AI-Summary Validated By:</span>
                  <h6 className="fs-xs-11 display-6 fs-6 mb-0 ms-2">
                    {validatorId?.name}
                  </h6>
                </div>
              )}
              {doctorValidatorId && (
                <div className="d-flex align-items-center">
                  <span className="fs-xs-9">Doctor Validated By:</span>
                  <h6 className="fs-xs-11 display-6 fs-6 mb-0 ms-2">
                    {doctorValidatorId?.name}
                  </h6>
                </div>
              )}
              {geminiResponseGeneratedBy && (
                <div className="d-flex align-items-center">
                  <span className="fs-xs-9">Ai-Summary Generated By:</span>
                  <h6 className="fs-xs-11 display-6 fs-6 mb-0 ms-2">
                    {geminiResponseGeneratedBy?.name}
                  </h6>
                </div>
              )}
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

            {/* <div>
              <div className="d-flex align-items-center">
                <span className="fs-xs-9">From :</span>
                <h6 className="fs-xs-9 display-6 fs-6 mb-0 ms-2">
                  {data?.fromDate &&
                    format(new Date(data?.fromDate), "dd MMM yyyy") || "--"}
                </h6>
              </div>
              <div className="d-flex align-items-center">
                <span className="fs-xs-9">To :</span>
                <h6 className="fs-xs-9 display-6 fs-6 mb-0 ms-2">
                  {data?.toDate &&
                    format(new Date(data?.toDate), "dd MMM yyyy") || "--"}
                </h6>
              </div>
            </div> */}

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
                  {!hideDropDown && (
                    <DropdownToggle
                      tag="a"
                      id="dropdownMenuLink14"
                      role="button"
                    >
                      <i className="bx bx-dots-vertical-rounded fs-4"></i>
                    </DropdownToggle>
                  )}
                  <DropdownMenu>
                    {needsAIValidation && (
                      <DropdownItem
                        onClick={() => openModal("ai")}
                        href="#"
                      >
                        <i className="ri-robot-line align-bottom text-info me-2"></i>{" "}
                        Validate AI Summary
                      </DropdownItem>
                    )}
                    {needsValidation && !needsAIValidation && user?.role === "DOCTOR" && (
                      <DropdownItem
                        onClick={() => openModal("doctor")}
                        href="#"
                      >
                        <i className="ri-checkbox-circle-line align-bottom text-success me-2"></i>{" "}
                        Validate
                      </DropdownItem>
                    )}
                    <RenderWhen isTrue={canPrint}>
                      <DropdownItem
                        onClick={() => printItem(item, patient)}
                        href="#"
                      >
                        <i className="ri-printer-line align-bottom text-muted me-2"></i>{" "}
                        Print
                      </DropdownItem>
                    </RenderWhen>
                    {disableEdit || item?.bill === WRITE_OFF ? (
                      ""
                    ) : (
                      <CheckPermission permission={"edit"} subAccess={name}>
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
                      </CheckPermission>
                    )}

                    {disableEdit ? (
                      ""
                    ) : (
                      <CheckPermission permission={"delete"} subAccess={name}>
                        <DropdownItem
                          disabled={disableDelete}
                          onClick={() => deleteItem(item)}
                          href="#"
                        >
                          {" "}
                          <i className="ri-delete-bin-5-line align-bottom text-muted me-2"></i>{" "}
                          Delete
                        </DropdownItem>
                      </CheckPermission>
                    )}

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
                            }),
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
      <ValidateConfirmationModal
        isOpen={isModalOpen}
        toggle={closeModal}
        loading={loading}
        onConfirm={handleConfirm}
      />
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
  hideDropDown: PropTypes.bool,
};

const mapStateToProps = (state) => ({
  patient: state.Patient.patient,
  user: state.User.user,
});

export default connect(mapStateToProps)(Wrapper);
