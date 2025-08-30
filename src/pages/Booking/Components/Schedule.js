import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  memo,
} from "react";
//flatpicker
import Flatpicker from "react-flatpickr";
import "flatpickr/dist/themes/material_green.css";

//react-select
import Select, { components } from "react-select";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";
import {
  Button,
  Col,
  Form,
  Input,
  Label,
  Nav,
  NavItem,
  NavLink,
  FormGroup,
  Row,
} from "reactstrap";
import { connect, useDispatch } from "react-redux";
import { v4 as uuid } from "uuid";
import {
  addUserIncrementalSchedule,
  fetchUserSchedule,
} from "../../../store/actions";
import {
  addDays,
  eachDayOfInterval,
  endOfDay,
  format,
  setHours,
  setMilliseconds,
  setMinutes,
  startOfDay,
  addMinutes,
  setSeconds,
} from "date-fns";
import Pricing from "./Pricing";
import WeeklySchedule from "../../Setting/Calender/Components/DoctorSchedule";
import { markedUserActiveOrInactive } from "../../../store/features/auth/user/userSlice";

export const generateTimes = ({
  date,
  startHour = 0,
  startMinutes = 0,
  endHour = 0,
  endMinutes = 0,
}) => {
  const start =
    startHour > 0
      ? setMinutes(
          setHours(setSeconds(new Date(date), 0), startHour),
          startMinutes + 15 || 0
        )
      : startOfDay(new Date(date));

  const end =
    endHour > 0
      ? setMinutes(
          setHours(setSeconds(new Date(date), 0), endHour),
          endMinutes - 15 || 0
        )
      : endOfDay(new Date(date));

  const times = [];
  let current = start;

  while (current <= end) {
    times.push({
      label: format(current, "h:mm a"),
      value: current.toISOString(),
    });
    current = addMinutes(current, 15);
  }

  return times;
};

export const Option = (props) => {
  const ref = useRef();

  useEffect(() => {
    props.isSelected &&
      ref.current.scrollIntoView({ behavior: "instant", block: "center" });
  }, [props.isSelected]);

  return !props.isDisabled ? (
    <components.Option {...props} innerRef={ref} />
  ) : null;
};

// Create a separate TimeSelect component
export const TimeSelect = memo(
  ({ value, onChange, options, label, required, generateTimes }) => {
    return (
      <div className="position-relative">
        <Label className="form-label">
          {label}
          {required && <span className="text-danger">*</span>}
        </Label>
        <Select
          required={required}
          components={components}
          defaultValue={value}
          styles={{
            menuPortal: (base) => ({
              ...base,
              zIndex: 9999,
            }),
          }}
          menuShouldScrollIntoView
          menuPortalTarget={document.body}
          menuPosition="fixed"
          onChange={onChange}
          options={options}
        />
      </div>
    );
  }
);

// ScheduleRow — single slot row
const ScheduleRow = memo(
  ({
    sch,
    idx,
    i,
    date,
    generateTimes,
    handleScheduleChange,
    removeSchedule,
    userCenters,
  }) => {
    const startTimeOptions = useMemo(
      () =>
        generateTimes({
          date: date.date,
          endHour: sch.endTime ? new Date(sch.endTime).getHours() : 0,
          endMinutes: sch.endTime ? new Date(sch.endTime).getMinutes() : 0,
        }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [date.date, sch.endTime]
    );

    const endTimeOptions = useMemo(
      () =>
        generateTimes({
          date: date.date,
          startHour: sch.startTime ? new Date(sch.startTime).getHours() : 0,
          startMinutes: sch.startTime
            ? new Date(sch.startTime).getMinutes()
            : 0,
        }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [date.date, sch.startTime]
    );

    return (
      <Row key={sch.id}>
        <Col xs={3}>
          <TimeSelect
            value={{
              label: sch.startTime && format(new Date(sch.startTime), "h:mm a"),
              value:
                sch.startTime &&
                setSeconds(
                  setMilliseconds(new Date(sch.startTime), 0),
                  0
                ).toISOString(),
            }}
            onChange={(e) => {
              const updatedDate = new Date(date.date);
              const dt = new Date(e.value);
              updatedDate.setHours(
                dt.getHours(),
                dt.getMinutes(),
                dt.getSeconds(),
                0
              );
              handleScheduleChange(i, idx, "startTime", updatedDate);
            }}
            options={startTimeOptions}
            label="Start Time"
            required
          />
        </Col>
        <Col xs={3}>
          <TimeSelect
            value={{
              label: sch.endTime && format(new Date(sch.endTime), "h:mm a"),
              value:
                sch.endTime &&
                setSeconds(
                  setMilliseconds(new Date(sch.endTime), 0),
                  0
                ).toISOString(),
            }}
            onChange={(e) => {
              const updatedDate = new Date(date.date);
              const dt = new Date(e.value);
              updatedDate.setHours(
                dt.getHours(),
                dt.getMinutes(),
                dt.getSeconds(),
                0
              );
              handleScheduleChange(i, idx, "endTime", updatedDate);
            }}
            options={endTimeOptions}
            label="End Time"
            required
          />
        </Col>
        <Col xs={3} className="d-flex align-items-end">
          <div className="mt-auto">
            <Label size="sm">Type</Label>
            <Input
              bsSize="sm"
              type="select"
              value={sch.type}
              onChange={(e) =>
                handleScheduleChange(i, idx, "type", e.target.value)
              }
            >
              <option value="" disabled hidden>
                Choose here
              </option>
              {(["ONLINE", "OFFLINE"] || []).map((option, oi) => (
                <option key={oi} id={option} value={option}>
                  {option}
                </option>
              ))}
            </Input>
          </div>
        </Col>
        {sch.type === "OFFLINE" && (
          <Col xs={2}>
            <div className="">
              <Label size="sm">Centers</Label>
              <Input
                bsSize="sm"
                type="select"
                value={sch.center}
                onChange={(e) => {
                  const id =
                    e.target.options[e.target.selectedIndex].getAttribute("id");
                  handleScheduleChange(i, idx, "center", id);
                }}
              >
                <option value="" disabled hidden>
                  Choose here
                </option>
                {(userCenters || []).map((option, oi) => (
                  <option key={oi} id={option._id} value={option._id}>
                    {option.title}
                  </option>
                ))}
              </Input>
            </div>
          </Col>
        )}
        <Col xs={1} className="d-flex flex-col">
          <Button
            size="sm"
            onClick={() => removeSchedule(i, idx)}
            color="danger"
            outline
            type="button"
            className="mt-auto"
          >
            <i
              className={`${
                idx === 0 ? "ri-eraser-line" : "ri-close-circle-line"
              } font-size-20 mt-auto`}
            ></i>
          </Button>
        </Col>
      </Row>
    );
  }
);

// DateRow — receives onDeleteDate from parent
const DateRow = memo(
  ({
    date,
    i,
    schedule,
    generateTimes,
    handleScheduleChange,
    addSchedule,
    removeSchedule,
    userCenters,
    onDeleteDate,
  }) => {
    return (
      <div
        key={date.id}
        className={
          schedule.length > 1 && i !== schedule.length - 1
            ? `border-bottom border-dark overflow-auto pb-2 d-flex gap-4 align-items-center mb-3 m-auto`
            : `d-flex gap-4 align-items-end mb-3 overflow-auto m-auto`
        }
        style={{ width: "800px" }}
      >
        <time
          className="bg-secondary text-nowrap text-center rounded text-white p-2"
          aria-label={date.date.toDateString()}
        >
          <span>{format(date.date, "dd MMM yyyy")}</span>
          <span className="d-block">{format(date.date, "EEEE")}</span>
        </time>

        <div className="flex-grow-1">
          {(date.workingSchedule || []).map((sch, idx) => (
            <ScheduleRow
              key={sch.id}
              sch={sch}
              idx={idx}
              i={i}
              date={date}
              generateTimes={generateTimes}
              handleScheduleChange={handleScheduleChange}
              removeSchedule={removeSchedule}
              userCenters={userCenters}
            />
          ))}
        </div>

        <div className="d-flex flex-column gap-2">
          <button
            onClick={() => addSchedule(i)}
            type="button"
            className="btn d-block btn-primary btn-sm"
          >
            Add
          </button>

          <button
            onClick={() => onDeleteDate && onDeleteDate(i)}
            type="button"
            className="btn d-block btn-outline-danger btn-sm"
            title="Delete full date"
          >
            <i className="ri-delete-bin-line" />
          </button>
        </div>
      </div>
    );
  }
);

const Schedule = ({
  isOpen,
  toggle,
  doctor,
  userCenters,
  sessionPricing,
  userSchedule,
  weeklySchedule,
}) => {
  const dispatch = useDispatch();
  const [toggled, setToggled] = useState(false);
  const [apiFlag, setApiFlag] = useState(false);

  const [tab, setTab] = useState(0);
  const [scheduleTab, setScheduleTab] = useState(0);
  const [pricing, setPricing] = useState({
    online: [{ session: "", price: "" }],
    offline: [
      {
        center: "",
        pricings: [
          { session: "", price: "" },
          { session: "", price: "" },
        ],
      },
    ],
  });

  // track ids to delete
  const [deleteScheduleIds, setDeleteScheduleIds] = useState([]);
  const [deleteSlotIds, setDeleteSlotIds] = useState([]);
  console.log(deleteSlotIds);

  useEffect(() => {
    if (sessionPricing) {
      setPricing(sessionPricing);
    }
  }, [sessionPricing]);

  const date = new Date();

  const initialSchedule = useMemo(
    () =>
      eachDayOfInterval({
        start: date,
        end: addDays(date, 29),
      }).map((dt) => ({
        id: uuid(),
        date: new Date(dt.setHours(12, 12, 12, 12)),
        workingSchedule: [
          { id: uuid(), type: "", startTime: "", endTime: "", center: null },
        ],
      })),
    [date]
  );

  const [schedule, setSchedule] = useState(initialSchedule);

  const handleScheduleChange = useCallback(
    (dateIndex, scheduleIndex, field, value) => {
      setSchedule((prevSchedule) =>
        prevSchedule.map((d, i) => {
          if (i === dateIndex) {
            return {
              ...d,
              workingSchedule: d.workingSchedule.map((sch, j) =>
                j === scheduleIndex
                  ? {
                      ...sch,
                      ...(value === "ONLINE" && { center: null }),
                      [field]: value,
                    }
                  : sch
              ),
            };
          }
          return d;
        })
      );
    },
    []
  );

  const addSchedule = useCallback((dateIndex) => {
    setSchedule((prevDates) =>
      prevDates.map((d, i) =>
        i === dateIndex
          ? {
              ...d,
              workingSchedule: [
                ...d.workingSchedule,
                {
                  id: uuid(),
                  type: "",
                  startTime: "",
                  endTime: "",
                  center: "",
                },
              ],
            }
          : d
      )
    );
  }, []);

  // remove slot (slot-level) and collect deleteSlotIds if slot had server _id
  const removeSchedule = useCallback((dateIndex, scheduleIndex) => {
    setSchedule((prevDates) =>
      prevDates.map((dateItem, i) => {
        if (i !== dateIndex) return dateItem;

        const toRemove = dateItem.workingSchedule[scheduleIndex];

        if (toRemove && toRemove._id) {
          setDeleteSlotIds((prev) => {
            const idStr = toRemove._id.toString();
            if (prev.includes(idStr)) return prev;
            return [...prev, idStr];
          });
        }

        if (scheduleIndex === 0) {
          return {
            ...dateItem,
            workingSchedule: dateItem.workingSchedule.map((_, idx) =>
              idx === scheduleIndex
                ? {
                    id: uuid(),
                    type: "",
                    startTime: "",
                    endTime: "",
                    center: "",
                  }
                : _
            ),
          };
        }

        return {
          ...dateItem,
          workingSchedule: dateItem.workingSchedule.filter(
            (_, idx) => idx !== scheduleIndex
          ),
        };
      })
    );
  }, []);

  // delete whole date: mark schedule _id (if present) and remove from UI
  const handleDeleteDate = useCallback((dateIndex) => {
    setSchedule((prev) => {
      const item = prev[dateIndex];
      if (item && item._id) {
        setDeleteScheduleIds((prevIds) => {
          const idStr = item._id.toString();
          if (prevIds.includes(idStr)) return prevIds;
          return [...prevIds, idStr];
        });
      }
      return prev.filter((_, idx) => idx !== dateIndex);
    });
  }, []);

  const bulkEditSchedule = useCallback((values) => {
    setSchedule((prevSchedule) =>
      prevSchedule.map((s) => ({
        ...s,
        workingSchedule: s.workingSchedule.map((w) => ({
          ...(w.startTime ? w : values),
        })),
      }))
    );
  }, []);

  const handleSubmit = useCallback(
    async (values) => {
      function cleanData(data) {
        return data
          .map((item) => {
            const workingSchedule = item.workingSchedule
              .filter(
                (schedule) =>
                  schedule.startTime !== "" && schedule.endTime !== ""
              )
              .map(({ id, ...rest }) => rest); // remove UI id, keep _id if present

            if (workingSchedule.length === 0) return null;

            const base = { date: item.date, workingSchedule };
            if (item._id) base._id = item._id;
            return base;
          })
          .filter(Boolean);
      }

      const payload = {
        userId: values.user,
        workingSchedulesData: cleanData(values.workingSchedule),
        deleteScheduleIds,
        deleteSlotIds,
      };

      await dispatch(addUserIncrementalSchedule(payload));

      // clear delete ids after submit
      setDeleteScheduleIds([]);
      setDeleteSlotIds([]);

      toggle();
    },
    [dispatch, toggle, deleteScheduleIds, deleteSlotIds]
  );

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: { user: doctor?._id, workingSchedule: schedule },
    validationSchema: Yup.object({
      user: Yup.string().required("User ID is required"),
    }),
    onSubmit: handleSubmit,
  });

  const getDoctorSchedule = useCallback(() => {
    if (userSchedule?.length > 0) {
      const scheduleCopy = eachDayOfInterval({
        start: date,
        end: addDays(date, 29),
      }).map((dt) => ({
        id: uuid(),
        date: new Date(dt.setHours(12, 12, 12, 12)),
        workingSchedule: [
          { id: uuid(), type: "", startTime: "", endTime: "", center: null },
        ],
      }));

      const merged = scheduleCopy.map((slotDate) => {
        const matched = userSchedule.find((val) => {
          return (
            val.date &&
            format(new Date(val.date), "dd MMM yyyy") ===
              format(new Date(slotDate.date), "dd MMM yyyy")
          );
        });

        if (!matched) return slotDate;

        return {
          _id: matched._id,
          id: uuid(),
          date: slotDate.date,
          workingSchedule: (matched.workingSchedule || []).map((s) => ({
            id: s._id ? `${s._id}_ui` : uuid(),
            _id: s._id ? s._id : undefined,
            type: s.type || "",
            startTime: s.startTime || "",
            endTime: s.endTime || "",
            center: s.center || null,
            maxAppointments: s.maxAppointments || 0,
            status: s.status || undefined,
          })),
        };
      });

      setSchedule(merged);
    } else {
      setSchedule(
        eachDayOfInterval({ start: date, end: addDays(date, 29) }).map(
          (dt) => ({
            id: uuid(),
            date: new Date(dt.setHours(12, 12, 12, 12)),
            workingSchedule: [
              {
                id: uuid(),
                type: "",
                startTime: "",
                endTime: "",
                center: null,
              },
            ],
          })
        )
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSchedule]);

  useEffect(() => {
    getDoctorSchedule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, userSchedule]);

  useEffect(() => {
    const fetchSchedule = async () => {
      if (doctor?._id) {
        const resultAction = await dispatch(fetchUserSchedule(doctor._id));
        setToggled(resultAction?.payload?.user?.isHideFromSearch);
      }
    };
    fetchSchedule();
  }, [dispatch, doctor?._id, apiFlag]);

  useEffect(() => {
    if (doctor) setToggled(doctor?.isHideFromSearch);
  }, [doctor]);

  const handleUserHide = async (e) => {
    if (!doctor) return;
    const newStatus = e.target.checked;
    setToggled(newStatus);
    try {
      await dispatch(
        markedUserActiveOrInactive({ userId: doctor._id })
      ).unwrap();
      setApiFlag((f) => !f);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const memoizeIncrementalSchedule = useMemo(() => {
    return (
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          validation.handleSubmit();
          return false;
        }}
        className="needs-validation m-auto"
        action="#"
      >
        <div>
          <div className="h-500 overflow-auto">
            {schedule.map((date, i) => (
              <DateRow
                key={date.id}
                date={date}
                i={i}
                schedule={schedule}
                generateTimes={generateTimes}
                handleScheduleChange={handleScheduleChange}
                addSchedule={addSchedule}
                removeSchedule={removeSchedule}
                userCenters={userCenters}
                onDeleteDate={handleDeleteDate}
              />
            ))}
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-2">
              <span
                className="text-black"
                style={{ fontSize: "16px", fontWeight: 700 }}
              >
                Website Listing:
              </span>
              <FormGroup switch>
                <Input
                  type="switch"
                  id="activeSwitch"
                  checked={!toggled}
                  style={{
                    boxShadow: "none",
                    outline: "none",
                    border: "none",
                    height: "18px",
                    width: "40px",
                  }}
                  onChange={(e) => handleUserHide(e)}
                />
                <Label for="activeSwitch" check></Label>
              </FormGroup>
            </div>
            <button type="submit" className="btn btn-secondary btn-sm">
              Save
            </button>
          </div>
        </div>
      </Form>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    schedule,
    handleScheduleChange,
    addSchedule,
    removeSchedule,
    userCenters,
    validation,
    handleDeleteDate,
  ]);

  return (
    <React.Fragment>
      <Nav pills className="mb-4 justify-content-center">
        <NavItem onClick={() => setTab(0)}>
          <NavLink active={tab === 0} href="#">
            Schedule
          </NavLink>
        </NavItem>
        <NavItem onClick={() => setTab(1)}>
          <NavLink active={tab === 1} href="#">
            Pricing
          </NavLink>
        </NavItem>
      </Nav>

      {tab === 1 ? (
        <Pricing
          pricing={pricing}
          setPricing={setPricing}
          sessionPricing={sessionPricing}
          doctor={doctor}
          toggle={toggle}
        />
      ) : (
        <div>
          <Nav pills className="mb-4 justify-content-center">
            <NavItem onClick={() => setScheduleTab(0)}>
              <NavLink active={scheduleTab === 0} href="#">
                Incremental
              </NavLink>
            </NavItem>
            <NavItem onClick={() => setScheduleTab(1)}>
              <NavLink active={scheduleTab === 1} href="#">
                Weekly
              </NavLink>
            </NavItem>
          </Nav>
          {scheduleTab === 0 ? (
            <>{memoizeIncrementalSchedule}</>
          ) : (
            <WeeklySchedule
              doctor={doctor}
              userCenters={userCenters}
              toggle={toggle}
              weeklySchedule={weeklySchedule}
            />
          )}
        </div>
      )}
    </React.Fragment>
  );
};

const mapStateToProps = (state) => ({
  appointments: state.Booking.data,
  userSchedule: state.User.incrementalSchedule,
  weeklySchedule: state.User.weeklySchedule,
  userCenters: state.User.userCenters,
  sessionPricing: state.User.sessionPricing,
  centers: state.Center.data,
  currentEvent: state.Booking.event,
  patients: state.Patient.allPatients,
  centerAccess: state.User?.centerAccess,
});

export default connect(mapStateToProps)(Schedule);

// import React, {
//   useCallback,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
//   memo,
// } from "react";
// //flatpicker
// import Flatpicker from "react-flatpickr";
// import "flatpickr/dist/themes/material_green.css";

// //react-select
// import Select, { components } from "react-select";

// // Formik Validation
// import * as Yup from "yup";
// import { useFormik } from "formik";
// import {
//   Button,
//   Col,
//   Form,
//   Input,
//   Label,
//   Nav,
//   NavItem,
//   NavLink,
//   FormGroup,
//   Row,
// } from "reactstrap";
// import { connect, useDispatch } from "react-redux";
// import { v4 as uuid } from "uuid";
// import {
//   addUserIncrementalSchedule,
//   fetchUserSchedule,
// } from "../../../store/actions";
// import {
//   addDays,
//   eachDayOfInterval,
//   eachMinuteOfInterval,
//   endOfDay,
//   format,
//   setHours,
//   setMilliseconds,
//   setMinutes,
//   startOfDay,
//   addMinutes,
//   setSeconds,
// } from "date-fns";
// import Pricing from "./Pricing";
// import WeeklySchedule from "../../Setting/Calender/Components/DoctorSchedule";
// // import { markedUserActiveOrInactive } from "../../../store/actions";
// import { markedUserActiveOrInactive } from "../../../store/features/auth/user/userSlice";

// export const generateTimes = ({
//   date,
//   startHour = 0,
//   startMinutes = 0,
//   endHour = 0,
//   endMinutes = 0,
// }) => {
//   const start =
//     startHour > 0
//       ? setMinutes(
//           setHours(setSeconds(new Date(date), 0), startHour),
//           startMinutes + 15 || 0
//         )
//       : startOfDay(new Date(date));

//   const end =
//     endHour > 0
//       ? setMinutes(
//           setHours(setSeconds(new Date(date), 0), endHour),
//           endMinutes - 15 || 0
//         )
//       : endOfDay(new Date(date));

//   const times = [];
//   let current = start;

//   while (current <= end) {
//     times.push({
//       label: format(current, "h:mm a"),
//       value: current.toISOString(),
//     });
//     current = addMinutes(current, 15);
//   }

//   return times;
// };

// export const Option = (props) => {
//   const ref = useRef();

//   useEffect(() => {
//     props.isSelected &&
//       ref.current.scrollIntoView({ behavior: "instant", block: "center" });
//   }, [props.isSelected]);

//   return !props.isDisabled ? (
//     <components.Option {...props} innerRef={ref} />
//   ) : null;
// };

// // Create a separate TimeSelect component
// export const TimeSelect = memo(
//   ({ value, onChange, options, label, required, generateTimes }) => {
//     return (
//       <div className="position-relative">
//         <Label className="form-label">
//           {label}
//           {required && <span className="text-danger">*</span>}
//         </Label>
//         <Select
//           required={required}
//           components={components}
//           defaultValue={value}
//           styles={{
//             menuPortal: (base) => ({
//               ...base,
//               zIndex: 9999,
//             }),
//           }}
//           menuShouldScrollIntoView
//           menuPortalTarget={document.body}
//           menuPosition="fixed"
//           onChange={onChange}
//           options={options}
//         />
//       </div>
//     );
//   }
// );

// // Create a separate ScheduleRow component
// const ScheduleRow = memo(
//   ({
//     sch,
//     idx,
//     i,
//     date,
//     generateTimes,
//     handleScheduleChange,
//     removeSchedule,
//     userCenters,
//   }) => {
//     const startTimeOptions = useMemo(
//       () =>
//         generateTimes({
//           date: date.date,
//           endHour: sch.endTime ? new Date(sch.endTime).getHours() : 0,
//           endMinutes: sch.endTime ? new Date(sch.endTime).getMinutes() : 0,
//         }),
//       // eslint-disable-next-line react-hooks/exhaustive-deps
//       [date.date, sch.endTime]
//     );

//     const endTimeOptions = useMemo(
//       () =>
//         generateTimes({
//           date: date.date,
//           startHour: sch.startTime ? new Date(sch.startTime).getHours() : 0,
//           startMinutes: sch.startTime
//             ? new Date(sch.startTime).getMinutes()
//             : 0,
//         }),
//       // eslint-disable-next-line react-hooks/exhaustive-deps
//       [date.date, sch.startTime]
//     );

//     return (
//       <Row key={sch.id}>
//         <Col xs={3}>
//           <TimeSelect
//             value={{
//               label: sch.startTime && format(new Date(sch.startTime), "h:mm a"),
//               value:
//                 sch.startTime &&
//                 setSeconds(
//                   setMilliseconds(new Date(sch.startTime), 0),
//                   0
//                 ).toISOString(),
//             }}
//             onChange={(e) => {
//               const updatedDate = new Date(date.date);
//               const dt = new Date(e.value);
//               updatedDate.setHours(
//                 dt.getHours(),
//                 dt.getMinutes(),
//                 dt.getSeconds(),
//                 0
//               );
//               handleScheduleChange(i, idx, "startTime", updatedDate);
//             }}
//             options={startTimeOptions}
//             label="Start Time"
//             required
//           />
//         </Col>
//         <Col xs={3}>
//           <TimeSelect
//             value={{
//               label: sch.endTime && format(new Date(sch.endTime), "h:mm a"),
//               value:
//                 sch.endTime &&
//                 setSeconds(
//                   setMilliseconds(new Date(sch.endTime), 0),
//                   0
//                 ).toISOString(),
//             }}
//             onChange={(e) => {
//               const updatedDate = new Date(date.date);
//               const dt = new Date(e.value);
//               updatedDate.setHours(
//                 dt.getHours(),
//                 dt.getMinutes(),
//                 dt.getSeconds(),
//                 0
//               );
//               handleScheduleChange(i, idx, "endTime", updatedDate);
//             }}
//             options={endTimeOptions}
//             label="End Time"
//             required
//           />
//         </Col>
//         <Col xs={3} className="d-flex align-items-end">
//           <div className="mt-auto">
//             <Label size="sm">Type</Label>
//             <Input
//               bsSize="sm"
//               type="select"
//               value={sch.type}
//               onChange={(e) =>
//                 handleScheduleChange(i, idx, "type", e.target.value)
//               }
//             >
//               <option value="" selected disabled hidden>
//                 Choose here
//               </option>
//               {(["ONLINE", "OFFLINE"] || []).map((option, idx) => (
//                 <option key={idx} id={option} value={option}>
//                   {option}
//                 </option>
//               ))}
//             </Input>
//           </div>
//         </Col>

//         {sch.type === "OFFLINE" && (
//           <Col xs={2}>
//             <div className="">
//               <Label size="sm">Centers</Label>
//               <Input
//                 bsSize="sm"
//                 type="select"
//                 value={sch.center}
//                 onChange={(e) => {
//                   const id =
//                     e.target.options[e.target.selectedIndex].getAttribute("id");
//                   handleScheduleChange(i, idx, "center", id);
//                 }}
//               >
//                 <option value="" selected disabled hidden>
//                   Choose here
//                 </option>
//                 {(userCenters || []).map((option, idx) => (
//                   <option key={idx} id={option._id} value={option._id}>
//                     {option.title}
//                   </option>
//                 ))}
//               </Input>
//             </div>
//           </Col>
//         )}

//         <Col xs={1} className="d-flex flex-col">
//           <Button
//             size="sm"
//             onClick={() => removeSchedule(i, idx)}
//             color="danger"
//             outline
//             type="button"
//             className="mt-auto"
//           >
//             <i
//               className={`${
//                 idx === 0 ? "ri-eraser-line" : "ri-close-circle-line"
//               } font-size-20 mt-auto`}
//             ></i>
//           </Button>
//         </Col>
//       </Row>
//     );
//   }
// );

// // Create a separate DateRow component
// const DateRow = memo(
//   ({
//     date,
//     i,
//     schedule,
//     generateTimes,
//     handleScheduleChange,
//     addSchedule,
//     removeSchedule,
//     userCenters,
//   }) => {
//     return (
//       <div
//         key={date.id}
//         className={
//           schedule.length > 1 && i !== schedule.length - 1
//             ? `border-bottom border-dark overflow-auto pb-2 d-flex gap-4 align-items-center mb-3 m-auto`
//             : `d-flex gap-4 align-items-end mb-3 overflow-auto m-auto`
//         }
//         style={{ width: "800px" }}
//       >
//         <time
//           className="bg-secondary text-nowrap text-center rounded text-white p-2"
//           aria-label={date.date.toDateString()}
//         >
//           <span>{format(date.date, "dd MMM yyyy")}</span>
//           <span className="d-block">{format(date.date, "EEEE")}</span>
//         </time>

//         <div className="flex-grow-1">
//           {(date.workingSchedule || []).map((sch, idx) => (
//             <ScheduleRow
//               key={sch.id}
//               sch={sch}
//               idx={idx}
//               i={i}
//               date={date}
//               generateTimes={generateTimes}
//               handleScheduleChange={handleScheduleChange}
//               removeSchedule={removeSchedule}
//               userCenters={userCenters}
//             />
//           ))}
//         </div>

//         <button
//           onClick={() => addSchedule(i)}
//           type="button"
//           className="btn d-block btn-primary btn-sm"
//         >
//           Add
//         </button>
//       </div>
//     );
//   }
// );

// const Schedule = ({
//   isOpen,
//   toggle,
//   doctor,
//   userCenters,
//   sessionPricing,
//   userSchedule,
//   weeklySchedule,
// }) => {
//   const dispatch = useDispatch();
//   const [toggled, setToggled] = useState(false);
//   const [apiFlag, setApiFlag] = useState(false);

//   const [tab, setTab] = useState(0);
//   const [scheduleTab, setScheduleTab] = useState(0);
//   const [pricing, setPricing] = useState({
//     online: [{ session: "", price: "" }],
//     offline: [
//       {
//         center: "",
//         pricings: [
//           { session: "", price: "" },
//           { session: "", price: "" },
//         ],
//       },
//     ],
//   });

//   // track ids to delete
//   const [deleteScheduleIds, setDeleteScheduleIds] = useState([]);
//   const [deleteSlotIds, setDeleteSlotIds] = useState([]);
//   console.log(deleteSlotIds);

//   useEffect(() => {
//     if (sessionPricing) {
//       setPricing(sessionPricing);
//     }
//   }, [sessionPricing]);

//   const date = new Date();

//   const initialSchedule = useMemo(
//     () =>
//       eachDayOfInterval({
//         start: date,
//         end: addDays(date, 29),
//       }).map((dt) => ({
//         id: uuid(),
//         date: new Date(dt.setHours(12, 12, 12, 12)),
//         workingSchedule: [
//           { id: uuid(), type: "", startTime: "", endTime: "", center: null },
//         ],
//       })),
//     [date]
//   );

//   const [schedule, setSchedule] = useState(initialSchedule);

//   const handleScheduleChange = useCallback(
//     (dateIndex, scheduleIndex, field, value) => {
//       setSchedule((prevSchedule) =>
//         prevSchedule.map((d, i) => {
//           if (i === dateIndex) {
//             return {
//               ...d,
//               workingSchedule: d.workingSchedule.map((sch, j) =>
//                 j === scheduleIndex
//                   ? {
//                       ...sch,
//                       ...(value === "ONLINE" && { center: null }),
//                       [field]: value,
//                     }
//                   : sch
//               ),
//             };
//           }
//           return d;
//         })
//       );
//     },
//     []
//   );

//   const addSchedule = useCallback((dateIndex) => {
//     setSchedule((prevDates) =>
//       prevDates.map((d, i) =>
//         i === dateIndex
//           ? {
//               ...d,
//               workingSchedule: [
//                 ...d.workingSchedule,
//                 {
//                   id: uuid(),
//                   type: "",
//                   startTime: "",
//                   endTime: "",
//                   center: "",
//                 },
//               ],
//             }
//           : d
//       )
//     );
//   }, []);

//   const removeSchedule = useCallback((dateIndex, scheduleIndex) => {
//     setSchedule((prevDates) =>
//       prevDates.map((date, i) =>
//         i === dateIndex
//           ? {
//               ...date,
//               workingSchedule:
//                 scheduleIndex === 0
//                   ? date.workingSchedule.map((_, idx) =>
//                       idx === scheduleIndex
//                         ? {
//                             id: uuid(),
//                             type: "",
//                             startTime: "",
//                             endTime: "",
//                             center: "",
//                           }
//                         : _
//                     )
//                   : date.workingSchedule.filter(
//                       (_, idx) => idx !== scheduleIndex
//                     ),
//             }
//           : date
//       )
//     );
//   }, []);

//   const bulkEditSchedule = useCallback((values) => {
//     setSchedule((prevSchedule) =>
//       prevSchedule.map((s) => ({
//         ...s,
//         workingSchedule: s.workingSchedule.map((w) => ({
//           ...(w.startTime ? w : values),
//         })),
//       }))
//     );
//   }, []);

//   const handleSubmit = useCallback(
//     async (values) => {
//       function cleanData(data) {
//         return data
//           .map((item) => ({
//             date: item.date,
//             workingSchedule: item.workingSchedule
//               .filter(
//                 (schedule) =>
//                   schedule.startTime !== "" && schedule.endTime !== ""
//               )
//               .map(({ id, ...rest }) => rest),
//           }))
//           .filter((item) => item.workingSchedule.length > 0);
//       }

//       const payload = {
//         userId: values.user,
//         workingSchedulesData: cleanData(values.workingSchedule),
//       };

//       dispatch(addUserIncrementalSchedule(payload));
//       toggle();
//     },
//     [dispatch, toggle]
//   );

//   const validation = useFormik({
//     // enableReinitialize : use this flag when initial values needs to be changed
//     enableReinitialize: true,

//     initialValues: {
//       user: doctor?._id,
//       workingSchedule: schedule,
//     },
//     validationSchema: Yup.object({
//       user: Yup.string().required("User ID is required"),
//     }),
//     onSubmit: handleSubmit,
//   });

//   const getDoctorSchedule = useCallback(() => {
//     if (userSchedule?.length > 0) {
//       let scheduleCopy = schedule;
//       scheduleCopy = scheduleCopy.map((sch) => {
//         //new Date(sch.date).toISOString().split("T")[0];

//         const matchedSchedule = userSchedule.find(
//           (val) => {
//             return (
//               val.date &&
//               format(new Date(val.date), "dd MMM yyyy") ===
//                 format(new Date(sch.date), "dd MMM yyyy")
//             );
//           } //new Date(val.date).toISOString().split("T")[0] === schDate
//         );

//         if (matchedSchedule) {
//           return {
//             ...matchedSchedule,
//             id: uuid(),
//             date: sch.date,
//           };
//         }
//         return sch;
//       });

//       setSchedule(scheduleCopy);
//     } else {
//       setSchedule(
//         eachDayOfInterval({
//           start: date,
//           end: addDays(date, 29),
//         }).map((dt) => ({
//           id: uuid(),
//           date: new Date(dt.setHours(12, 12, 12, 12)),
//           workingSchedule: [
//             { id: uuid(), type: "", startTime: "", endTime: "", center: null },
//           ],
//         }))
//       );
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [userSchedule]);

//   useEffect(() => {
//     getDoctorSchedule();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isOpen, userSchedule]);

//   useEffect(() => {
//     console.log(doctor, "run change listing");
//     const fetchSchedule = async () => {
//       if (doctor?._id) {
//         const resultAction = await dispatch(fetchUserSchedule(doctor._id));
//         console.log(resultAction, "resultAction of listing");
//         setToggled(resultAction?.payload?.user?.isHideFromSearch);
//       }
//     };

//     fetchSchedule();
//   }, [dispatch, doctor?._id, apiFlag]);

//   const components = {
//     Option: Option,
//   };

//   useEffect(() => {
//     if (doctor) {
//       setToggled(doctor?.isHideFromSearch);
//     }
//   }, [doctor]);

//   const handleUserHide = async (e) => {
//     console.log(e, "website listing");
//     if (!doctor) return;
//     const newStatus = e.target.checked;
//     setToggled(newStatus);

//     console.log(newStatus, "newStatus");
//     try {
//       await dispatch(
//         markedUserActiveOrInactive({
//           userId: doctor._id,
//         })
//       ).unwrap();
//       setApiFlag(!apiFlag); // or show a toast/snackbar here
//     } catch (err) {
//       console.error("Update failed:", err);
//     }
//   };

//   const memoizeIncrementalSchedule = useMemo(() => {
//     return (
//       <Form
//         onSubmit={(e) => {
//           e.preventDefault();
//           validation.handleSubmit();
//           return false;
//         }}
//         className="needs-validation m-auto"
//         action="#"
//       >
//         <div>
//           <div className="h-500 overflow-auto">
//             {schedule.map((date, i) => (
//               <DateRow
//                 key={date.id}
//                 date={date}
//                 i={i}
//                 schedule={schedule}
//                 generateTimes={generateTimes}
//                 handleScheduleChange={handleScheduleChange}
//                 addSchedule={addSchedule}
//                 removeSchedule={removeSchedule}
//                 userCenters={userCenters}
//               />
//             ))}
//           </div>
//           <div className="d-flex justify-content-between align-items-center">
//             <div className="d-flex gap-2">
//               <span
//                 className="text-black"
//                 style={{ fontSize: "16px", fontWeight: 700 }}
//               >
//                 Website Listing:
//               </span>
//               <FormGroup switch>
//                 <Input
//                   type="switch"
//                   id="activeSwitch"
//                   checked={!toggled}
//                   style={{
//                     boxShadow: "none",
//                     outline: "none",
//                     border: "none",
//                     height: "18px",
//                     width: "40px",
//                   }}
//                   onChange={(e) => handleUserHide(e)}
//                 />
//                 <Label for="activeSwitch" check></Label>
//               </FormGroup>
//             </div>
//             <button type="submit" className="btn btn-secondary btn-sm">
//               Save
//             </button>
//           </div>
//         </div>
//       </Form>
//     );
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [
//     schedule,
//     handleScheduleChange,
//     addSchedule,
//     removeSchedule,
//     userCenters,
//     validation,
//   ]);

//   return (
//     <React.Fragment>
//       {/* <CustomModal
//         title={"User Schedule"}
//         centered
//         isOpen={isOpen}
//         toggle={toggle}
//         size={"lg"}
//       > */}

//       <Nav pills className="mb-4 justify-content-center">
//         <NavItem onClick={() => setTab(0)}>
//           <NavLink active={tab === 0} href="#">
//             Schedule
//           </NavLink>
//         </NavItem>
//         <NavItem onClick={() => setTab(1)}>
//           <NavLink active={tab === 1} href="#">
//             Pricing
//           </NavLink>
//         </NavItem>
//       </Nav>

//       {tab === 1 ? (
//         <Pricing
//           pricing={pricing}
//           setPricing={setPricing}
//           sessionPricing={sessionPricing}
//           doctor={doctor}
//           toggle={toggle}
//         />
//       ) : (
//         <div>
//           <Nav pills className="mb-4 justify-content-center">
//             <NavItem onClick={() => setScheduleTab(0)}>
//               <NavLink active={scheduleTab === 0} href="#">
//                 Incremental
//               </NavLink>
//             </NavItem>
//             <NavItem onClick={() => setScheduleTab(1)}>
//               <NavLink active={scheduleTab === 1} href="#">
//                 Weekly
//               </NavLink>
//             </NavItem>
//           </Nav>
//           {scheduleTab === 0 ? (
//             <>{memoizeIncrementalSchedule}</>
//           ) : (
//             <WeeklySchedule
//               doctor={doctor}
//               userCenters={userCenters}
//               toggle={toggle}
//               weeklySchedule={weeklySchedule}
//             />
//           )}
//         </div>
//       )}
//       {/* </CustomModal> */}
//     </React.Fragment>
//   );
// };

// const mapStateToProps = (state) => ({
//   appointments: state.Booking.data,
//   // user: state.User.user,
//   userSchedule: state.User.incrementalSchedule, //state.Setting.doctorAvailableSlots,
//   weeklySchedule: state.User.weeklySchedule,
//   userCenters: state.User.userCenters,
//   sessionPricing: state.User.sessionPricing,
//   centers: state.Center.data,
//   currentEvent: state.Booking.event,
//   patients: state.Patient.allPatients,
//   centerAccess: state.User.centerAccess,
// });

// export default connect(mapStateToProps)(Schedule);
