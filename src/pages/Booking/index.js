import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import EventForm from "./Components/Form";
import { connect, useDispatch } from "react-redux";
import {
  addClinicalNote,
  cancelAppointment,
  fetchAllDoctorSchedule,
  fetchAppointments,
  fetchCenters,
  fetchUserSchedule,
  removeAppointment,
  setCurrentEvent,
  setEventDate,
  toggleAppointmentForm,
  updateClinicalNote,
} from "../../store/actions";
import EventInfo from "./Components/EventInfo";
import DeleteModal from "../../Components/Common/DeleteModal";
import ChartForm from "../Patient/ChartForm";
import BillForm from "../Patient/BillForm";
import { OPD } from "../../Components/constants/patient";
import Print from "../../Components/Print";
import { endOfDay, startOfDay } from "date-fns";
import moment from "moment";
import Schedule from "./Components/Schedule";
import CustomModal from "../../Components/Common/Modal";
import { stringToRgbaColor } from "../../Components/Scheduler/utils/schedular";
import { EventItem, DetailEventItem } from "./Components/EventItem";

const localizer = momentLocalizer(moment);
const Booking = ({
  user,
  appointments,
  appointmentForm,
  centerAccess,
  patients,
  activeEvent,
}) => {
  const dispatch = useDispatch();
  const [range, setRange] = useState();
  const [view, setView] = useState(Views.DAY);
  const [appointment, setAppointment] = useState();
  const [scheduleModal, setScheduleModal] = useState(false);
  const toggleSchedule = () => setScheduleModal(!scheduleModal);
  const toggleInfo = (data) => {
    dispatch(setCurrentEvent({ isOpen: !activeEvent.isOpen, data }));
  };
  const [cancelEvent, setCancelEvent] = useState({
    isOpen: false,
    id: null,
  });
  const toggleCancelEvent = (id) =>
    setCancelEvent({ isOpen: !cancelEvent.isOpen, id });
  const [deleteEvent, setDeleteEvent] = useState({
    isOpen: false,
    id: null,
  });
  const toggleDeleteEvent = (id) =>
    setDeleteEvent({ isOpen: !deleteEvent.isOpen, id });

  useEffect(() => {
    dispatch(
      fetchAllDoctorSchedule({
        centerAccess: JSON.stringify(user.centerAccess),
      })
    );
    dispatch(
      fetchAppointments({
        centerAccess,
        start: startOfDay(new Date()),
        end: endOfDay(new Date()),
      })
    );
    dispatch(fetchCenters(user.centerAccess));
  }, [dispatch, user, centerAccess, patients]);

  useEffect(() => {
    dispatch(fetchUserSchedule(user._id));
  }, [dispatch, user]);

  const onSubmitClinicalForm = (
    values,
    files,
    editChartData,
    editClinicalNote
  ) => {
    const {
      author,
      patient,
      center,
      centerAddress,
      addmission,
      appointment,
      shouldPrintAfterSave,
      chart,
      type,
      date,
      complaints,
      observations,
      diagnosis,
      notes,
    } = values;
    const formData = new FormData();
    formData.append("shouldPrintAfterSave", true);
    formData.append("author", author);
    formData.append("patient", patient);
    formData.append("center", center);
    formData.append("centerAddress", centerAddress);
    if (appointment) formData.append("appointment", appointment);
    if (addmission) formData.append("addmission", addmission);
    formData.append("shouldPrintAfterSave", shouldPrintAfterSave);
    formData.append("chart", chart);
    formData.append("type", type);
    if (date) formData.append("date", date);
    formData.append("complaints", complaints);
    formData.append("observations", observations);
    formData.append("diagnosis", diagnosis);
    formData.append("notes", notes);
    files.forEach((file) => formData.append("file", file.file));

    if (editClinicalNote) {
      formData.append("id", editChartData._id);
      formData.append("chartId", editClinicalNote._id);
      dispatch(updateClinicalNote(formData));
    } else {
      dispatch(addClinicalNote(formData));
    }
  };

  const toggleForm = (data) => {
    dispatch(
      toggleAppointmentForm({
        isOpen: !appointmentForm.isOpen,
        data: data,
      })
    );
  };

  useEffect(() => {
    const handleClick = (e) => {
      const time = e.currentTarget.parentElement.getAttribute("data-start");
      if (time) {
        dispatch(setEventDate(time));
        toggleForm();
      }
    };

    const slots = document.querySelectorAll(".rbc-time-slot");

    slots.forEach((slot) => {
      if (!slot.querySelector(".rbc-time-slot-overlay")) {
        const overlay = document.createElement("div");
        overlay.className = "rbc-time-slot-overlay";
        overlay.addEventListener("click", handleClick);
        slot.appendChild(overlay);
      }
    });

    return () => {
      slots.forEach((slot) => {
        const overlay = slot.querySelector(".rbc-time-slot-overlay");
        if (overlay) {
          overlay.removeEventListener("click", handleClick);
          overlay.remove();
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, range]);

  console.log(appointments, "appointments");

  return (
    <React.Fragment>
      <div className="page-content">
        {(user.role === "DOCTOR" || user.role === "COUNSELLOR") && (
          <div className="d-flex justify-content-end mb-2">
            <button
              onClick={() => setScheduleModal(!scheduleModal)}
              className="btn btn-secondary btn-sm"
            >
              <i className="ri-settings-3-line text-white fs-5"></i>
            </button>
          </div>
        )}
        <Calendar
          events={appointments.map((app) => ({
            ...app,
            startDate: new Date(app.startDate),
            endDate: new Date(app.endDate),
          }))}
          step={15}
          min={new Date(2025, 1, 19, 6, 0)}
          max={new Date(2025, 1, 19, 22, 0)}
          scrollToTime={new Date(2025, 1, 19, 9, 0)}
          timeslots={1}
          localizer={localizer}
          startAccessor="startDate"
          endAccessor="endDate"
          dayLayoutAlgorithm={"no-overlap"}
          view={view}
          onView={(view) => setView(view)}
          slotPropGetter={(date) => {
            return {
              "data-start": date.toISOString(),
              style: {
                height: "30px",
                position: "relative",
              },
            };
          }}
          components={{
            event: view === Views.MONTH ? EventItem : DetailEventItem,
          }}
          onRangeChange={(range) => {
            setRange(range);
            if (range?.length === 1)
              dispatch(
                fetchAppointments({
                  centerAccess,
                  start: startOfDay(range[0]),
                  end: endOfDay(range[0]),
                })
              );
            else if (range?.length > 1)
              dispatch(
                fetchAppointments({
                  centerAccess,
                  start: startOfDay(range[0]),
                  end: endOfDay(range[range.length - 1]),
                })
              );
            else
              dispatch(
                fetchAppointments({
                  centerAccess,
                  start: startOfDay(range.start),
                  end: endOfDay(range.end),
                })
              );
          }}
          eventPropGetter={(event, start, end, isSelected) => {
            const backgroundColor =
              event.doctor?._id && stringToRgbaColor(event.doctor?._id, 0.7);

            return {
              style: {
                backgroundColor:
                  event.isCancelled || (event.chart && event.bill)
                    ? "rgba(0, 0, 0, 0.3)"
                    : event.chart
                    ? ""
                    : backgroundColor,
                ...(event.chart &&
                  !event.bill && {
                    background: "linear-gradient(to right, #bdc3c7, #2c3e50)",
                  }),
              },
            };
          }}
          onSelecting={(slot) => {}}
          draggableAccessor={(event) => false}
          resizableAccessor={(event) => false}
          longPressThreshold={10000}
          onSelectEvent={(event) => {
            toggleInfo(event);
          }}
          titleAccessor={(prop) => prop?.patient?.name || "Dummy"}
          style={{ height: 600 }}
          selectable
        />
        <CustomModal
          size={"lg"}
          centered
          isOpen={appointmentForm.isOpen}
          toggle={toggleForm}
        >
          <EventForm editEvent={appointmentForm.data} toggleForm={toggleForm} />
        </CustomModal>
        <CustomModal
          size={"lg"}
          centered
          isOpen={activeEvent.isOpen}
          toggle={toggleInfo}
        >
          <EventInfo
            data={activeEvent.data}
            setAppointment={setAppointment}
            toggleForm={toggleForm}
            toggleCancelEvent={toggleCancelEvent}
            toggleDeleteEvent={toggleDeleteEvent}
          />
        </CustomModal>
        <DeleteModal
          show={cancelEvent.isOpen}
          onCloseClick={toggleCancelEvent}
          onDeleteClick={() => {
            setCancelEvent({
              isOpen: false,
              id: null,
            });
            toggleInfo();
            dispatch(cancelAppointment({ id: cancelEvent.id }));
          }}
        />
        <DeleteModal
          show={deleteEvent.isOpen}
          onCloseClick={toggleDeleteEvent}
          onDeleteClick={() => {
            setDeleteEvent({
              isOpen: false,
              id: null,
            });
            toggleInfo();
            dispatch(removeAppointment(deleteEvent.id));
            dispatch(
              setCurrentEvent({
                isOpen: false,
                data: null,
              })
            );
          }}
        />
        <ChartForm type={OPD} onSubmitClinicalForm={onSubmitClinicalForm} />
        <BillForm type={OPD} />
        <CustomModal
          title={"User Schedule"}
          centered
          isOpen={scheduleModal}
          toggle={toggleSchedule}
          size={"xl"}
          className={"h-100"}
        >
          <Schedule
            doctor={user}
            isOpen={scheduleModal}
            toggle={toggleSchedule}
          />
        </CustomModal>
        <Print />
      </div>
    </React.Fragment>
  );
};

Booking.propTypes = {
  appointments: PropTypes.array,
  user: PropTypes.object.isRequired,
  currentEvent: PropTypes.object,
  centerAccess: PropTypes.array,
};

const mapStateToProps = (state) => ({
  appointmentForm: state.Booking.form,
  appointments: state.Booking.data,
  activeEvent: state.Booking.event,
  user: state.User.user,
  userSchedule: state.User.schedule,
  currentEvent: state.Booking.event,
  patients: state.Patient.allPatients,
  centerAccess: state.User.centerAccess,
});

export default connect(mapStateToProps)(Booking);
