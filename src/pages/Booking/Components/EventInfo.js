import React from "react";
import PropTypes from "prop-types";
import { differenceInMinutes, format } from "date-fns";
import { useDispatch } from "react-redux";
import {
  addClinicalNote,
  createEditBill,
  createEditChart,
  setBillDate,
  setChartDate,
  setTotalAmount,
  togglePrint,
  updateClinicalNote,
  viewPatient,
} from "../../../store/actions";
import {
  CLINICAL_NOTE,
  INVOICE,
  OPD,
  PRESCRIPTION,
} from "../../../Components/constants/patient";
import MeetingComponent from "../../Meeting/Components";
import { Link } from "react-router-dom";

const EventInfo = ({
  data,
  setAppointment,
  toggleForm,
  toggleCancelEvent,
  toggleDeleteEvent,
}) => {
  const dispatch = useDispatch();
  const meetingId = data?.meetingId;
  const doctorName = data?.doctor?.name;
  const userType = "doctor";
  console.log(data, "data");
  return (
    <React.Fragment>
      <div>
        <div className="d-flex justify-content-end align-items-center">
          {/* {!data?.isCancelled && (
          <button type="button" className="btn btn-light btn-sm">
            <i className="ri-file-copy-line"></i>
          </button>
        )} */}
          {!data?.isCancelled && (
            <>
              {meetingId ? (
                <MeetingComponent
                  meetingId={meetingId}
                  name={doctorName}
                  userType={userType}
                />
              ) : null}
              <button
                onClick={() => {
                  toggleForm(data);
                }}
                type="button"
                className="btn btn-light ms-2 btn-sm"
              >
                <i className="ri-quill-pen-line fs-8"></i>
              </button>
            </>
          )}
          {!data?.isCancelled && (
            <button
              onClick={() => {
                toggleCancelEvent(data._id);
              }}
              type="button"
              className="btn btn-light ms-2 btn-sm"
            >
              <i className="ri-close-circle-line text-danger"></i>
            </button>
          )}
          {data?.isCancelled && (
            <div className="text-muted me-2 text-warning">Cancelled</div>
          )}
          {data?.isCancelled && (
            <button
              onClick={() => {
                toggleDeleteEvent(data._id);
              }}
              type="button"
              className="btn btn-light ms-2 btn-sm"
            >
              <i className="ri-delete-bin-6-line fs-8"></i>
            </button>
          )}
        </div>
        <div className="patient?-profile">
          {/* <Button
        id='profilePopover'
        type='button'
        className='p-0 btn-light me-3 rounded-circle shadow-none'
      > */}
          <img
            className="rounded-circle avatar-smm me-2 header-profile-user"
            src={
              data?.patient?.profilePicture?.url ||
              "//www.gravatar.com/avatar/d41d8cd98f00b204e9800998ecf8427e?s=200&r=pg&d=mm"
            }
            alt="Patient Avatar"
          />
          {/* </Button> */}
          <div>
            <h5 className="font-semi-bold text-capitalize font-size-16">
              <Link
                key={data?.patient?._id}
                to={`/patient/${data?.patient?._id}`}
                onClick={() => {
                  dispatch(viewPatient(data.patient));
                  dispatch(
                    setTotalAmount({
                      totalPayable: 0,
                      totalAdvance: 0,
                    })
                  );
                }}
                className="notify-item"
              >
                {data?.patient?.name || "Patient Name"}{" "}
                {`${data?.patient?.id?.prefix}${data?.patient?.id?.value}`}
              </Link>
            </h5>
            <div className="font-size-14">
              {data?.patient?.gender && <span>{data.patient.gender}</span>}
              {/* {data?.patient?.gender && data?.patient?.dateOfBirth && (
                <span className="ms-2 me-2">|</span>
              )}
              {data?.patient?.dateOfBirth && (
                <>
                  <span>
                    {format(new Date(data.patient.dateOfBirth), "d MMM yyyy")}
                  </span>
                </>
              )} */}
              {/* <span>|</span>
            <span>Blood Group</span> */}
            </div>
          </div>
        </div>
        <div className="text-muted mt-3">
          {data?.patient?.phoneNumber && <div>{data.patient.phoneNumber}</div>}
          {data?.patient?.email && <div>{data.patient.email}</div>}
        </div>
        <div className="d-flex justify-content-between pt-1 pb-1 mt-3 align-items-center border-top border-bottom">
          <div className="text-muted w-50">
            In-Clinic Appointment with {data?.doctor?.name} at{" "}
            {data?.startDate && format(new Date(data.startDate), "hh:mm a")} for{" "}
            {differenceInMinutes(
              new Date(data?.endDate),
              new Date(data?.startDate)
            )}{" "}
            mins
          </div>
          <div>
            {!data?.isCancelled && (
              <button
                onClick={() => {
                  toggleCancelEvent(data._id);
                }}
                className="btn btn-light btn-sm"
              >
                No Show
              </button>
            )}
          </div>
        </div>
        {/* <div>
        <h5 className="font-semi-bold mt-3 text-capitalize font-size-16">
          Medical History
        </h5>
        <p className="text-muted">Heart Disease</p>
      </div> */}
        <div className="d-flex justify-content-end mt-3">
          {data?.chart && data?.doctor?.role === "COUNSELLOR" ? (
            <>
              <button
                onClick={(e) => {
                  setAppointment(data);
                  dispatch(
                    createEditChart({
                      chart: CLINICAL_NOTE,
                      isOpen: true,
                      type: OPD,
                      data: data.chart,
                      patient: data.patient,
                      doctor: data.doctor,
                      appointment: data,
                      shouldPrintAfterSave: true,
                      populatePreviousAppointment: false,
                    })
                  );
                }}
                disabled={data?.isCancelled}
                // style={{ pointerEvents: 'auto' }}
                className="btn btn-primary btn-sm me-2 text-nowrap fs-10"
              >
                Edit Note
              </button>
              <button
                onClick={(e) => {
                  setAppointment(data);
                  dispatch(
                    togglePrint({
                      data: data.chart,
                      modal: true,
                      patient: data.patient,
                      center: data.center,
                      doctor: data.doctor,
                    })
                  );
                }}
                disabled={data?.isCancelled}
                // style={{ pointerEvents: 'auto' }}
                className="btn btn-primary btn-sm me-2 text-nowrap fs-10"
              >
                View Note
              </button>
            </>
          ) : data?.doctor?.role === "COUNSELLOR" ? (
            <button
              onClick={(e) => {
                // setAppointment(data);
                dispatch(setChartDate(new Date().toISOString()));
                dispatch(
                  createEditChart({
                    chart: CLINICAL_NOTE,
                    isOpen: true,
                    type: OPD,
                    patient: data.patient,
                    appointment: data,
                    shouldPrintAfterSave: true,
                    populatePreviousAppointment: true,
                  })
                );
              }}
              disabled={data?.isCancelled}
              // style={{ pointerEvents: 'auto' }}
              className="btn btn-primary btn-sm me-2 text-nowrap fs-10"
            >
              Create Note
            </button>
          ) : (
            ""
          )}
          {data?.chart && data?.doctor?.role === "DOCTOR" ? (
            <>
              <button
                onClick={(e) => {
                  setAppointment(data);
                  dispatch(
                    createEditChart({
                      chart: PRESCRIPTION,
                      isOpen: true,
                      type: OPD,
                      data: data.chart,
                      patient: data.patient,
                      center: data.center?._id,
                      doctor: data.doctor,
                      appointment: data,
                      shouldPrintAfterSave: true,
                      populatePreviousAppointment: false,
                    })
                  );
                }}
                disabled={data?.isCancelled}
                // style={{ pointerEvents: 'auto' }}
                className="btn btn-primary btn-sm me-2 text-nowrap fs-10"
              >
                Edit Prescription
              </button>
              <button
                onClick={(e) => {
                  setAppointment(data);
                  dispatch(
                    togglePrint({
                      data: data.chart,
                      modal: true,
                      patient: data.patient,
                      center: data.center,
                      doctor: data.doctor,
                    })
                  );
                }}
                disabled={data?.isCancelled}
                // style={{ pointerEvents: 'auto' }}
                className="btn btn-primary btn-sm me-2 text-nowrap fs-10"
              >
                View Prescription
              </button>
            </>
          ) : data?.doctor?.role === "DOCTOR" ? (
            <button
              onClick={(e) => {
                // setAppointment(data);
                dispatch(setChartDate(new Date().toISOString()));
                dispatch(
                  createEditChart({
                    chart: PRESCRIPTION,
                    isOpen: true,
                    type: OPD,
                    patient: data.patient,
                    center: data.center?._id,
                    appointment: data,
                    shouldPrintAfterSave: true,
                    populatePreviousAppointment: true,
                  })
                );
              }}
              disabled={data?.isCancelled}
              // style={{ pointerEvents: 'auto' }}
              className="btn btn-primary btn-sm me-2 text-nowrap fs-10"
            >
              Create Prescription
            </button>
          ) : (
            ""
          )}
          {data?.bill ? (
            <button
              onClick={() => {
                dispatch(
                  togglePrint({
                    data: data.bill,
                    modal: true,
                    patient: data.patient,
                    center: data.center?._id,
                    doctor: data.doctor,
                    appointment: data._id,
                  })
                );
              }}
              className="btn btn-primary btn-sm text-nowrap fs-10"
            >
              View Invoice
            </button>
          ) : (
            <button
              onClick={(e) => {
                // setAppointment(data);
                dispatch(setBillDate(new Date().toISOString()));
                dispatch(
                  createEditBill({
                    bill: INVOICE,
                    isOpen: true,
                    type: OPD,
                    patient: data.patient,
                    center: data.center?._id,
                    appointment: data,
                    shouldPrintAfterSave: true,
                  })
                );
              }}
              disabled={data?.isCancelled}
              className="btn btn-primary btn-sm text-nowrap fs-10"
            >
              Collect Payment
            </button>
          )}
        </div>
      </div>
    </React.Fragment>
  );
};

EventInfo.propTypes = {};

export default EventInfo;
