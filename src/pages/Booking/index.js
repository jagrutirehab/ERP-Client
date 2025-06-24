import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Button,
  ButtonGroup,
  Container,
  UncontrolledTooltip,
} from "reactstrap";
// import Scheduler from "../../Components/Scheduler/index";
import { Scheduler } from "react-scheduler-pro";
// import { Scheduler } from "react-scheduler-pro";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import EventForm from "./Components/Form";
import { connect, useDispatch } from "react-redux";
// import "react-big-calendar/lib/sass/styles";
import {
  addClinicalNote,
  cancelAppointment,
  fetchAllDoctorSchedule,
  fetchAllPatients,
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
import {
  differenceInMinutes,
  endOfDay,
  format,
  isSameDay,
  isWithinInterval,
  parseISO,
  startOfDay,
} from "date-fns";
import moment from "moment";
import Schedule from "./Components/Schedule";
import CustomModal from "../../Components/Common/Modal";
import { stringToRgbaColor } from "../../Components/Scheduler/utils/schedular";
import { EventItem, DetailEventItem } from "./Components/EventItem";
import AppointmentSchedule from "./Components/AppointmentSchedule";

const localizer = momentLocalizer(moment);
const Booking = ({
  user,
  userSchedule,
  appointments,
  appointmentForm,
  centerAccess,
  patients,
  activeEvent,
}) => {
  const dispatch = useDispatch();

  const [formTab, setFormTab] = useState(0);
  const [range, setRange] = useState();
  const [view, setView] = useState(Views.DAY);
  /* Current Appointment */
  const [appointment, setAppointment] = useState();
  const [scheduleModal, setScheduleModal] = useState(false);
  const toggleSchedule = () => setScheduleModal(!scheduleModal);

  /* Scheduler Form Modal */
  // const [isForm, setForm] = useState({
  //   isOpen: false,
  //   data: null,
  // });
  // const toggleForm = (data) => setForm({ isOpen: !isForm.isOpen, data });

  // Event Info Modal
  const toggleInfo = (data) => {
    dispatch(setCurrentEvent({ isOpen: !activeEvent.isOpen, data }));
  };

  /* Scheduler Event Cancel */
  const [cancelEvent, setCancelEvent] = useState({
    isOpen: false,
    id: null,
  });
  const toggleCancelEvent = (id) =>
    setCancelEvent({ isOpen: !cancelEvent.isOpen, id });

  /* Scheduler Event Delete */
  const [deleteEvent, setDeleteEvent] = useState({
    isOpen: false,
    id: null,
  });
  const toggleDeleteEvent = (id) =>
    setDeleteEvent({ isOpen: !deleteEvent.isOpen, id });

  useEffect(() => {
    // if (!patients || patients.length === 0) dispatch(fetchAllPatients());
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

  const onRange = (date) => {
    dispatch(
      fetchAppointments({
        centerAccess,
        start: startOfDay(date),
        end: endOfDay(date),
      })
    );
  };

  // useEffect(() => {
  //   // const slots = document.querySelectorAll(".rbc-time-slot");
  //   const slots = document.querySelectorAll(".rbc-timeslot-group");

  //   console.log(slots, "slots");

  //   const handleClick = (e) => {
  //     const isoDate = e.currentTarget.getAttribute("data-start");

  //     console.log(isoDate, "slot clicked");

  //     if (isoDate) {
  //       dispatch(setEventDate(isoDate));
  //       toggleForm(); // Your function to open the form
  //     }
  //   };

  //   slots.forEach((slot) => {
  //     slot.addEventListener("click", handleClick);
  //   });

  //   return () => {
  //     slots.forEach((slot) => {
  //       slot.removeEventListener("click", handleClick);
  //     });
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // useEffect(() => {
  //   const observer = new MutationObserver(() => {
  //     const slots = document.querySelectorAll(".rbc-time-slot");

  //     if (slots.length > 0) {
  //       slots.forEach((slot) => {
  //         // Prevent multiple bindings
  //         slot.removeEventListener("click", handleClick);
  //         slot.addEventListener("click", handleClick);
  //       });
  //     }
  //   });

  //   const handleClick = (e) => {
  //     const isoDate = e.currentTarget.getAttribute("data-start");
  //     console.log("hello");

  //     if (isoDate) {
  //       dispatch(setEventDate(isoDate));
  //       toggleForm();
  //     }
  //   };

  //   const calendarRoot = document.querySelector(".rbc-time-view"); // or a wrapper around your calendar
  //   if (calendarRoot) {
  //     observer.observe(calendarRoot, {
  //       childList: true,
  //       subtree: true,
  //     });
  //   }

  //   return () => {
  //     observer.disconnect();
  //     const slots = document.querySelectorAll(".rbc-time-slot");
  //     slots.forEach((slot) => {
  //       slot.removeEventListener("click", handleClick);
  //     });
  //   };
  // }, []);

  useEffect(() => {
    const handleClick = (e) => {
      const time = e.currentTarget.parentElement.getAttribute("data-start");

      console.log(time, "slot");

      if (time) {
        dispatch(setEventDate(time));
        toggleForm();
      }
    };

    const slots = document.querySelectorAll(".rbc-time-slot");

    slots.forEach((slot) => {
      // Avoid adding multiple overlays
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

  console.log({ appointments }, "appointments");

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

        {/* <Container> */}
        {/* <Scheduler
          step={15}
          events={appointments}
          startHour={6}
          fields={{
            id: "_id",
            subject: "patient.name",
            start: "startDate",
            end: "endDate",
          }}
        /> */}
        {/* <Scheduler
          events={appointments.map((app) => ({
            ...app,
            startDate: new Date(app.startDate),
            endDate: new Date(app.endDate),
          }))}
          step={15}
          fields={{
            id: "_id",
            subject: "patient.name",
            start: "startDate",
            end: "endDate",
            // allDay: "isAllDay",
          }}
        /> */}
        <Calendar
          events={appointments.map((app) => ({
            ...app,
            startDate: new Date(app.startDate),
            endDate: new Date(app.endDate),
          }))}
          step={15}
          min={new Date(2025, 1, 19, 6, 0)} // 6:00 AM
          max={new Date(2025, 1, 19, 22, 0)}
          scrollToTime={new Date(2025, 1, 19, 9, 0)} // view start from
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
                position: "relative", // make sure we can absolutely position overlay
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
          onSelecting={(slot) => {
            console.log(slot, "slot");

            // return false;
            // if (e.action === "select") return;
          }}
          draggableAccessor={(event) => false}
          resizableAccessor={(event) => false}
          longPressThreshold={10000}
          // onSelectSlot={(slotInfo) => {
          //   dispatch(setEventDate(slotInfo.start.toISOString()));
          //   toggleForm();
          // }}
          onSelectEvent={(event) => {
            toggleInfo(event);
          }}
          titleAccessor={(prop) => prop?.patient?.name || "Dummy"}
          style={{ height: 600 }}
          selectable
        />

        {/* <Scheduler
          events={appointments}
          openForm={isForm.isOpen}
          toggleForm={toggleForm}
          EventFormContext={
            <EventForm editEvent={isForm.data} toggleForm={toggleForm} />
          }
          onRange={onRange}
          EventInfoRenderer={(event) => {
            return (
              <>
                <EventInfo
                  data={event}
                  setAppointment={setAppointment}
                  toggleForm={toggleForm}
                  toggleCancelEvent={toggleCancelEvent}
                  toggleDeleteEvent={toggleDeleteEvent}
                />
              </>
            );
          }}
        /> */}
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
        {/* Cancel Event */}
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
        {/* Delete Event */}
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
        {/* appointment={appointment} */}
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
        {/* appointment={appointment?._id} */}
        <Print />
        {/* </Container> */}
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

// import React, { useEffect, useState } from "react";
// import PropTypes from "prop-types";
// import { Container } from "reactstrap";
// import Scheduler from "../../Components/Scheduler/index";
// // import { Scheduler } from "react-scheduler-pro";
// import EventForm from "./Components/Form";
// import { connect, useDispatch } from "react-redux";
// import {
//   addClinicalNote,
//   cancelAppointment,
//   fetchAllDoctorSchedule,
//   fetchAllPatients,
//   fetchAppointments,
//   fetchCenters,
//   removeAppointment,
//   setCurrentEvent,
//   updateClinicalNote,
// } from "../../store/actions";
// import EventInfo from "./Components/EventInfo";
// import DeleteModal from "../../Components/Common/DeleteModal";
// import ChartForm from "../Patient/ChartForm";
// import BillForm from "../Patient/BillForm";
// import { OPD } from "../../Components/constants/patient";
// import Print from "../../Components/Print";
// import { endOfDay, startOfDay } from "date-fns";
// import Schedule from "./Components/Schedule";

// const Booking = ({ user, appointments, centerAccess, patients }) => {
//   const dispatch = useDispatch();

//   /* Current Appointment */
//   const [appointment, setAppointment] = useState();
//   const [scheduleModal, setScheduleModal] = useState(false);
//   const toggleSchedule = () => setScheduleModal(!scheduleModal);

//   /* Scheduler Form Modal */
//   const [isForm, setForm] = useState({
//     isOpen: false,
//     data: null,
//   });
//   const toggleForm = (data) => setForm({ isOpen: !isForm.isOpen, data });

//   /* Scheduler Event Cancel */
//   const [cancelEvent, setCancelEvent] = useState({
//     isOpen: false,
//     id: null,
//   });
//   const toggleCancelEvent = (id) =>
//     setCancelEvent({ isOpen: !cancelEvent.isOpen, id });

//   /* Scheduler Event Delete */
//   const [deleteEvent, setDeleteEvent] = useState({
//     isOpen: false,
//     id: null,
//   });
//   const toggleDeleteEvent = (id) =>
//     setDeleteEvent({ isOpen: !deleteEvent.isOpen, id });

//   useEffect(() => {
//     // if (!patients || patients.length === 0) dispatch(fetchAllPatients());
//     dispatch(fetchAllDoctorSchedule());
//     dispatch(
//       fetchAppointments({
//         centerAccess,
//         start: startOfDay(new Date()),
//         end: endOfDay(new Date()),
//       })
//     );
//     dispatch(fetchCenters(user.centerAccess));
//   }, [dispatch, user, centerAccess, patients]);

//   const onSubmitClinicalForm = (
//     values,
//     files,
//     editChartData,
//     editClinicalNote
//   ) => {
//     const {
//       author,
//       patient,
//       center,
//       centerAddress,
//       addmission,
//       appointment,
//       shouldPrintAfterSave,
//       chart,
//       type,
//       date,
//       complaints,
//       observations,
//       diagnosis,
//       notes,
//     } = values;
//     const formData = new FormData();
//     formData.append("shouldPrintAfterSave", true);
//     formData.append("author", author);
//     formData.append("patient", patient);
//     formData.append("center", center);
//     formData.append("centerAddress", centerAddress);
//     if (appointment) formData.append("appointment", appointment);
//     if (addmission) formData.append("addmission", addmission);
//     formData.append("shouldPrintAfterSave", shouldPrintAfterSave);
//     formData.append("chart", chart);
//     formData.append("type", type);
//     if (date) formData.append("date", date);
//     formData.append("complaints", complaints);
//     formData.append("observations", observations);
//     formData.append("diagnosis", diagnosis);
//     formData.append("notes", notes);
//     files.forEach((file) => formData.append("file", file.file));

//     if (editClinicalNote) {
//       formData.append("id", editChartData._id);
//       formData.append("chartId", editClinicalNote._id);
//       dispatch(updateClinicalNote(formData));
//     } else {
//       dispatch(addClinicalNote(formData));
//     }
//   };

//   const onRange = (date) => {
//     dispatch(
//       fetchAppointments({
//         centerAccess,
//         start: startOfDay(date),
//         end: endOfDay(date),
//       })
//     );
//   };

//   return (
//     <React.Fragment>
//       <div className="page-content">
//         {/* Un comment This after pull b/c we don't want the users to open Schedule modal */}
//         <div className="d-flex justify-content-end mb-2">
//           <button
//             onClick={() => setScheduleModal(!scheduleModal)}
//             className="btn btn-secondary btn-sm"
//           >
//             <i className="ri-settings-3-line text-white fs-5"></i>
//           </button>
//         </div>
//         <Scheduler
//           events={appointments}
//           openForm={isForm.isOpen}
//           toggleForm={toggleForm}
//           EventFormContext={
//             <EventForm editEvent={isForm.data} toggleForm={toggleForm} />
//           }
//           onRange={onRange}
//           EventInfoRenderer={(event) => {
//             return (
//               <>
//                 <EventInfo
//                   data={event}
//                   setAppointment={setAppointment}
//                   toggleForm={toggleForm}
//                   toggleCancelEvent={toggleCancelEvent}
//                   toggleDeleteEvent={toggleDeleteEvent}
//                 />
//               </>
//             );
//           }}
//         />
//         {/* Cancel Event */}
//         <DeleteModal
//           show={cancelEvent.isOpen}
//           onCloseClick={toggleCancelEvent}
//           onDeleteClick={() => {
//             setCancelEvent({
//               isOpen: false,
//               id: null,
//             });
//             dispatch(cancelAppointment({ id: cancelEvent.id }));
//           }}
//         />
//         {/* Delete Event */}
//         <DeleteModal
//           show={deleteEvent.isOpen}
//           onCloseClick={toggleDeleteEvent}
//           onDeleteClick={() => {
//             setDeleteEvent({
//               isOpen: false,
//               id: null,
//             });
//             dispatch(removeAppointment(deleteEvent.id));
//             dispatch(
//               setCurrentEvent({
//                 isOpen: false,
//                 data: null,
//               })
//             );
//           }}
//         />
//         <ChartForm type={OPD} onSubmitClinicalForm={onSubmitClinicalForm} />
//         <Schedule isOpen={scheduleModal} toggle={toggleSchedule} />
//         {/* appointment={appointment} */}
//         <BillForm type={OPD} />
//         {/* appointment={appointment?._id} */}
//         <Print />
//         {/* </Container> */}
//       </div>
//     </React.Fragment>
//   );
// };

// Booking.propTypes = {
//   appointments: PropTypes.array,
//   user: PropTypes.object.isRequired,
//   currentEvent: PropTypes.object,
//   centerAccess: PropTypes.array,
// };

// const mapStateToProps = (state) => ({
//   appointments: state.Booking.data,
//   user: state.User.user,
//   currentEvent: state.Booking.event,
//   patients: state.Patient.allPatients,
//   centerAccess: state.User.centerAccess,
// });

// export default connect(mapStateToProps)(Booking);
