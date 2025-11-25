import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  Col,
  Form,
  FormFeedback,
  Input,
  Label,
  Row,
  Button,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
  UncontrolledDropdown,
  Dropdown,
  Spinner,
  Alert,
} from "reactstrap";

//flatpicker
import Flatpicker from "react-flatpickr";
import "flatpickr/dist/themes/material_green.css";

import PhoneInputWithCountrySelect, {
  isValidPhoneNumber,
} from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { parsePhoneNumberFromString } from "libphonenumber-js";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";
import SearchPatient from "./SearchPatient";
import { connect, useDispatch } from "react-redux";
import {
  addAppointment,
  fetchDoctorSchedule,
  fetchPatientId,
  fetchPatientPreviousDoctor,
  searchPatientPhoneNumber,
  searchUidPatient,
  updateAppointment,
} from "../../../store/actions";
import {
  addHours,
  addMinutes,
  areIntervalsOverlapping,
  differenceInHours,
  differenceInMinutes,
  eachMinuteOfInterval,
  format,
  isValid,
  isWithinInterval,
  setDate,
  setHours,
  setMonth,
  setYear,
  subMinutes,
} from "date-fns";
import RenderWhen from "../../../Components/Common/RenderWhen";

const duration = [
  {
    hours: 0,
    minutes: 5,
  },
  {
    hours: 0,
    minutes: 10,
  },
  {
    hours: 0,
    minutes: 15,
  },
  {
    hours: 0,
    minutes: 20,
  },
  {
    hours: 0,
    minutes: 30,
  },
  {
    hours: 0,
    minutes: 45,
  },
  {
    hours: 1,
    minutes: 0,
  },
  {
    hours: 1,
    minutes: 30,
  },
  {
    hours: 2,
    minutes: 0,
  },
  {
    hours: 2,
    minutes: 30,
  },
  {
    hours: 3,
    minutes: 30,
  },
  {
    hours: 4,
    minutes: 0,
  },
  {
    hours: 4,
    minutes: 30,
  },
];

const EventForm = ({
  editEvent,
  doctors,
  toggleForm,
  eventDate,
  centers,
  doctor,
  slotsLoading,
  doctorAvailableSlots,
  appointmentsInRange,
  generatedPatientId,
  patientPreviousDoctor,
  searchPhoneNumber,
  phoneNumberLoading,
  uidPatient,
  uidLoading,
  centerAccess,
}) => {
  const dispatch = useDispatch();
  const [dateSlots, setDateSlots] = useState([]);
  const [dropdown, setDropdown] = useState(false);
  const [uidDropdown, setUidDropdown] = useState(false);
  const [slotsError, setSlotsError] = useState(false);

  //ref for slots dropdown
  const selectRef = useRef(null);

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      id: editEvent?._id,
      uid: editEvent ? editEvent?.patient?.id?.value : "",
      patientName: editEvent ? editEvent.patient?.name : "",
      patient: editEvent ? editEvent.patient?._id : "",
      consultationType: editEvent ? editEvent.consultationType : "",
      phoneNumber: editEvent?.patient?.phoneNumber?.includes("+91")
        ? editEvent?.patient?.phoneNumber
        : "+91" + editEvent?.patient?.phoneNumber || "",
      gender: editEvent ? editEvent.patient?.gender : "",
      center: editEvent ? editEvent?.center?._id : "",
      doctor: editEvent ? editEvent.doctor?._id : "",
      startDate: editEvent
        ? new Date(editEvent.startDate)
        : eventDate
        ? new Date(eventDate)
        : "",
      endDate: editEvent
        ? new Date(editEvent.endDate)
        : eventDate
        ? addMinutes(new Date(eventDate), 15)
        : "",
      at: editEvent ? new Date(editEvent.startDate) : "",
      // at: editEvent
      // ? new Date(editEvent.startDate)
      // : eventDate
      // ? new Date(eventDate)
      // : "",
      duration: editEvent
        ? `${differenceInHours(
            new Date(editEvent.endDate),
            new Date(editEvent.startDate)
          )}-${differenceInMinutes(
            new Date(editEvent.endDate),
            new Date(editEvent.startDate)
          )}`
        : `0-15`,
    },
    validationSchema: Yup.object({
      patientName: Yup.string().required("Please Enter Patient"),
      // uid: Yup.string().required("Please Enter Patient UID"),
      doctor: Yup.string().required("Please Enter Doctor"),
      consultationType: Yup.string().required(
        "Please Select Consultation type"
      ),
      phoneNumber: Yup.string()
        .required("Please Enter Phone number")
        .test("is-valid-phone", "Invalid phone number", function (value) {
          const phoneNumber = parsePhoneNumberFromString(value)?.nationalNumber;

          return isValidPhoneNumber(value);
        }),
      gender: Yup.string().required("Please Select Gender"),
      startDate: Yup.date().required("Please Enter Start Date"),
      endDate: Yup.date().required("Please Enter End Date"),
      at: Yup.date()
        .required("Please select time")
        .test("booking slot validation", "Already booked", function (value) {
          //If default start date is aleady booked then clear it out
          const isBooked =
            isValid(new Date(value)) &&
            appointmentsInRange?.find(
              (val) =>
                format(new Date(val.startDate), "HH:mm") ===
                format(new Date(value), "HH:mm")
            );
          if (isBooked && !editEvent) return false;
          else return true;
        }),
      duration: Yup.string()
        .required("Please select duration")
        .test(
          "booking slot duration validation",
          "Appointment overlaps with other appointments!",
          function (value) {
            const doesItOverlapsExsitingEvents = appointmentsInRange?.find(
              (e) => {
                return (
                  editEvent?._id !== e._id &&
                  areIntervalsOverlapping(
                    {
                      start: validation.values.startDate,
                      end: validation.values.endDate,
                    },
                    {
                      start: new Date(e.startDate),
                      end: new Date(e.endDate),
                    }
                  )
                );
              }
            );
            if (doesItOverlapsExsitingEvents) {
              return false;
            } else return true;
          }
        ),
    }),
    onSubmit: (values) => {
      if (editEvent) {
        dispatch(updateAppointment(values));
      } else {
        dispatch(
          addAppointment({
            ...values,
            uid: values.uid
              ? values.uid
              : generatedPatientId?.value?.replace(/\D/g, ""),
          })
        );
      }
      // toggleForm();
      // validation.resetForm();
    },
  });

  useEffect(() => {
    if (!editEvent) {
      validation.resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, editEvent]);

  useEffect(() => {
    const patient = validation.values.patient;
    if (!editEvent && patient) {
      dispatch(fetchPatientPreviousDoctor({ patient }));
    }
  }, [dispatch, validation.values.patient, editEvent]);

  useEffect(() => {
    if (!editEvent) {
      dispatch(fetchPatientId());
    }
  }, [dispatch, editEvent]);

  const filterDoctors = (docs) => {
    // return (docs || []).filter((_) => {
    //   return _.workingSchedules?.workingSchedule?.find(
    //     (sch) => sch?.center?._id === validation.values?.center
    //   );
    // });

    const docCenters = docs.map((doc) => ({
      ...doc,
      centerAccess: doc?.centerAccess.map((center) => center._id),
    }));

    return (docCenters || []).filter((doc) =>
      doc?.centerAccess?.includes(validation.values.center)
    );
  };

  useEffect(() => {
    setDateSlots(doctorAvailableSlots || []);
  }, [doctorAvailableSlots]);

  useEffect(() => {
    setDateSlots([]);
  }, []);

  useEffect(() => {
    if (
      patientPreviousDoctor &&
      filterDoctors(doctors).find(
        (doc) => doc.user?._id === patientPreviousDoctor._id
      )
    ) {
      validation.setFieldValue("doctor", patientPreviousDoctor._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientPreviousDoctor]);

  //fetch doctor schedule complete validations for appointment booking generateDocScheduleSlots
  useEffect(() => {
    const doc = validation.values.doctor;
    const center = validation.values.center;
    const startDate = validation.values.startDate;
    const consultationType = validation.values.consultationType || "OFFLINE";

    if (doc && center && startDate && consultationType) {
      const [hours, minutes] = validation.values.duration
        ?.split("-")
        .map(Number);
      dispatch(
        fetchDoctorSchedule({
          doctorId: doc,
          centerId: center,
          date: format(startDate, "yyyy-MM-dd"),
          meetingType: validation.values.consultationType,
          slotDuration: hours * 60 + minutes,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dispatch,
    validation.values.doctor,
    validation.values.center,
    validation.values.startDate,
    validation.values.consultationType,
    validation.values.duration,
  ]);

  useEffect(() => {
    if (!doctorAvailableSlots?.length && validation.values.doctor) {
      validation.setFieldValue("at", "");
      setSlotsError(true);
    } else if (doctorAvailableSlots?.length) {
      setSlotsError(false);
      selectRef.current.focus(); // Attempt to open the dropdown
      // selectRef.current.click(); // Helps trigger dropdown
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorAvailableSlots]);

  const findDocCenterSchedule = (cen, doc, day) => {
    const findCenter = doc?.workingSchedule?.workingSchedule?.find(
      (item) => item?.center?._id === cen && item.days?.includes(day?.getDay())
    );

    return findCenter;
  };

  // const generateDocScheduleSlots = () => {
  //   const startDate = validation.values.startDate;
  //   const findCenter = findDocCenterSchedule(
  //     validation.values.center,
  //     doctor,
  //     startDate
  //   );

  //   if (findCenter) {
  //     const start =
  //       findCenter.sessions[0]?.start && new Date(findCenter.sessions[0].start);
  //     const end =
  //       findCenter.sessions[0]?.end && new Date(findCenter.sessions[0].end);
  //     const checkInterval =
  //       start && end && format(start, "HH") < format(end, "HH"); //isValidInterval(start, end);

  //     if (checkInterval && findCenter.days.includes(startDate?.getDay())) {
  //       const sl = eachMinuteOfInterval(
  //         {
  //           start: new Date(
  //             new Date(
  //               new Date(
  //                 new Date(
  //                   new Date(new Date().setDate(startDate.getDate())).setMonth(
  //                     startDate.getMonth()
  //                   )
  //                 ).setFullYear(startDate.getFullYear())
  //               ).setHours(start.getHours())
  //             ).setMinutes(start.getMinutes())
  //           ),
  //           end: new Date(
  //             new Date(
  //               new Date(
  //                 new Date(
  //                   new Date(new Date().setDate(startDate.getDate())).setMonth(
  //                     startDate.getMonth()
  //                   )
  //                 ).setFullYear(startDate.getFullYear())
  //               ).setHours(end.getHours())
  //             ).setMinutes(end.getMinutes())
  //           ),
  //         },
  //         { step: 5 }
  //       );
  //       return sl;
  //     } else return [];
  //   } else {
  //     validation.setFieldValue("doctor", "");
  //     return [];
  //   }
  // };

  useEffect(() => {
    if (validation.values.doctor && validation.values.center && doctor) {
      // setDateSlots(generateDocScheduleSlots());
    }

    // const slots = generateDocScheduleSlots();
    // if (
    //   isValid(new Date(validation.values.at)) &&
    //   slots?.length > 0 &&
    //   validation.values.doctor &&
    //   !editEvent
    // ) {
    //   const findSlot = slots.find((slot) => {
    //     return (
    //       format(slot, "HH:mm") ===
    //       format(new Date(validation.values.at), "HH:mm")
    //     );
    //   });

    //   if (!findSlot) validation.setFieldValue("at", "");
    // }

    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // validation.values.doctor,
    validation.values.startDate,
    validation.values.center,
    doctor,
  ]);

  const calcDuration = () => {
    const totalMinutes = differenceInMinutes(
      new Date(validation.values.endDate),
      new Date(validation.values.startDate)
    );
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return { minutes, hours };
  };

  const fields = [
    {
      label: "Gender",
      name: "gender",
      type: "radio",
      options: ["MALE", "FEMALE", "OTHERS"],
    },
  ];

  useEffect(() => {
    if (searchPhoneNumber?.length > 0 && !dropdown) setDropdown(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchPhoneNumber]);

  useEffect(() => {
    if (uidPatient?.length > 0 && !uidDropdown) setUidDropdown(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uidPatient]);

  return (
    <React.Fragment>
      <div>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            validation.handleSubmit();
            // toggle();
            return false;
          }}
          className="needs-validation"
          action="#"
        >
          <div className="d-flex justify-content-center">
            <div className="w-25 w-xs-50">
              <Dropdown
                className="m-auto mb-3"
                isOpen={uidDropdown}
                toggle={() => setUidDropdown(false)}
                direction="down"
              >
                <Label htmlFor="uid" className="form-label">
                  UID
                  <span className="text-danger">*</span>
                </Label>
                <DropdownToggle
                  className="p-0 w-100 position-relative"
                  // color="light"
                >
                  <Input
                    disabled={editEvent ? true : false}
                    type={"text"}
                    name={"uid"}
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.uid || ""}
                    // invalid={
                    //   validation.touched.uid && validation.errors.uid
                    //     ? true
                    //     : false
                    // }
                    className="form-control"
                    placeholder=""
                    id="uid"
                    bsSize="sm"
                  />
                  <button
                    onClick={() => {
                      dispatch(
                        searchUidPatient({
                          uid: validation.values.uid,
                        })
                      );
                    }}
                    className="btn btn-sm py-0 px-1 my-auto dropdown-input-icon"
                    style={{ right: "20px", top: 0, bottom: 0 }}
                  >
                    <span className="mdi mdi-magnify "></span>
                  </button>
                  <RenderWhen isTrue={uidLoading}>
                    <span
                      className="link-success dropdown-input-icon"
                      style={{ right: "50px" }}
                    >
                      <Spinner size={"sm"} color="success" />
                    </span>
                  </RenderWhen>
                </DropdownToggle>
                <DropdownMenu className="dropdown-menu-md overflow-auto dropdown-height-md">
                  {(uidPatient || []).map((item) => (
                    <DropdownItem
                      className="d-flex align-items-center link-primary text-primary fs-6"
                      key={item["_id"]}
                      onClick={() => {
                        validation.setFieldValue("uid", `${item.id?.value}`);
                        validation.setFieldValue("patientName", item.name);
                        validation.setFieldValue("patient", item._id);
                        validation.setFieldValue(
                          "phoneNumber",
                          item.phoneNumber.includes("+91")
                            ? item.phoneNumber
                            : "+91" + item.phoneNumber
                        );
                        validation.setFieldValue("gender", item.gender);
                        validation.setFieldValue("center", item.center?._id);
                      }}
                    >
                      <span>{item.name}</span>
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>

              {validation.touched.phoneNumber &&
              validation.errors.phoneNumber ? (
                <FormFeedback type="invalid">
                  <div>{validation.errors.phoneNumber}</div>
                </FormFeedback>
              ) : null}
            </div>
          </div>
          <Row>
            <Col xs={12} md={6}>
              <Dropdown
                isOpen={dropdown}
                toggle={() => setDropdown(false)}
                direction="down"
                className="booking-phone-number"
              >
                <Label htmlFor="phone-number" className="form-label">
                  Phone Number
                  <span className="text-danger">*</span>
                </Label>
                <DropdownToggle
                  className="p-0 w-100 position-relative"
                  // color="light"
                >
                  <PhoneInputWithCountrySelect
                    placeholder="Enter phone number"
                    name={"phoneNumber"}
                    value={validation.values.phoneNumber}
                    onBlur={validation.handleBlur}
                    onChange={(value) => {
                      validation.setFieldValue("phoneNumber", value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault(); // Prevent default form submission
                        const phNumber = validation.values.phoneNumber;
                        const isValid = parsePhoneNumberFromString(phNumber);
                        const number = isValid?.nationalNumber || phNumber;

                        dispatch(
                          searchPatientPhoneNumber({
                            phoneNumber: number,
                          })
                        ); // Manually trigger the phone search
                      }
                    }}
                    className="w-full flex-grow-1"
                    defaultCountry="IN"
                    style={{ height: "40px" }}
                    id="phone-number"
                  />
                  <button
                    onClick={() => {
                      const phNumber = validation.values.phoneNumber;
                      const isValid = parsePhoneNumberFromString(phNumber);
                      const number = isValid?.nationalNumber || phNumber;

                      dispatch(
                        searchPatientPhoneNumber({
                          phoneNumber: number,
                        })
                      );
                    }}
                    type="button"
                    className="btn btn-sm py-0 px-1 my-auto dropdown-input-icon"
                    style={{ right: "20px", top: 0, bottom: 0 }}
                  >
                    <span className="mdi mdi-magnify"></span>
                  </button>
                  <RenderWhen isTrue={phoneNumberLoading}>
                    <span
                      className="link-success dropdown-input-icon"
                      style={{ right: "50px" }}
                    >
                      <Spinner size={"sm"} color="success" />
                    </span>
                  </RenderWhen>
                </DropdownToggle>
                <DropdownMenu className="dropdown-menu-md overflow-auto dropdown-height-md px-2">
                  {(searchPhoneNumber || []).map((item) => (
                    <DropdownItem
                      className="d-flex align-items-center link-primary text-primary fs-6"
                      key={item["_id"]}
                      onClick={() => {
                        validation.setFieldValue("uid", `${item.id?.value}`);
                        validation.setFieldValue("patientName", item.name);
                        validation.setFieldValue("patient", item._id);
                        validation.setFieldValue(
                          "phoneNumber",
                          item.phoneNumber.includes("+91")
                            ? item.phoneNumber
                            : "+91" + item.phoneNumber
                        );
                        validation.setFieldValue("gender", item.gender);
                        validation.setFieldValue("center", item.center?._id);
                      }}
                    >
                      <span>{item.name}</span>
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>

              {validation.touched.phoneNumber &&
              validation.errors.phoneNumber ? (
                <FormFeedback type="invalid" className="d-block">
                  <div>{validation.errors.phoneNumber}</div>
                </FormFeedback>
              ) : null}
            </Col>
            <Col xs={12} md={6}>
              <div className="mb-3">
                <Label htmlFor="doctor" className="form-label">
                  Patient Name
                  <span className="text-danger">*</span>
                </Label>
                <SearchPatient
                  dropdownKey={"booking-patient"}
                  validation={validation}
                  editEvent={editEvent}
                  disabled={editEvent ? true : false}
                />
                {validation.touched.patient && validation.errors.patient ? (
                  <FormFeedback type="invalid" className="d-block">
                    <div>{validation.errors.patient}</div>
                  </FormFeedback>
                ) : null}
              </div>
            </Col>
            <Col xs={12} md={6} className="d-flex flex-wrap mb-3">
              {(fields || []).map((field) => (
                <div>
                  <Label>{field.label}</Label>
                  <div className="d-flex flex-wrap">
                    {(field.options || []).map((item, idx) => (
                      <React.Fragment key={item + idx}>
                        <div
                          key={item + idx}
                          className="d-flex me-5 align-items-center"
                        >
                          <Input
                            // disabled={editEvent ? true : false}
                            className="me-2 mt-0"
                            type={field.type}
                            name={field.name}
                            value={item}
                            onChange={validation.handleChange}
                            checked={validation.values.gender === item}
                          />
                          <Label className="form-label fs-14 mb-0">
                            {item}
                          </Label>
                        </div>
                      </React.Fragment>
                    ))}
                    {validation.touched[field.name] &&
                    validation.errors[field.name] ? (
                      <FormFeedback type="invalid" className="d-block">
                        {validation.errors[field.name]}
                      </FormFeedback>
                    ) : null}
                  </div>
                </div>
              ))}
            </Col>
            <Col xs={12} md={6}>
              <div className="mb-3 w-100">
                <Label>Consultation Type</Label>
                <Input
                  name={"consultationType"}
                  className="form-control"
                  type={"select"}
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.consultationType || ""}
                  invalid={
                    validation.touched.consultationType &&
                    validation.errors.consultationType
                      ? true
                      : false
                  }
                  bsSize="sm"
                >
                  <option value="" selected disabled hidden>
                    Choose here
                  </option>
                  <option value={"ONLINE"}>Online</option>
                  <option value={"OFFLINE"}>Offline</option>
                </Input>
              </div>
            </Col>
            <Col xs={12} md={6}>
              <div className="mb-3">
                <Label htmlFor="center" className="form-label">
                  Center
                  <span className="text-danger">*</span>
                </Label>
                <Input
                  type="select"
                  name="center"
                  onChange={(e) => {
                    validation.handleChange(e);
                    const findCenter = findDocCenterSchedule(
                      e.target.value,
                      doctor
                    );
                    if (!findCenter) {
                      validation.setFieldValue("doctor", "");
                    }
                  }}
                  onBlur={validation.handleBlur}
                  value={validation.values.center || ""}
                  invalid={
                    validation.touched.center && validation.errors.center
                      ? true
                      : false
                  }
                  className="form-control"
                  placeholder=""
                  id="center"
                  bsSize="sm"
                >
                  <option value="" selected disabled hidden>
                    Choose here
                  </option>
                  {(centers || []).map((option, idx) => (
                    <option key={idx} value={option._id}>
                      {option.title}
                    </option>
                  ))}
                </Input>
                {validation.touched.doctor && validation.errors.doctor ? (
                  <FormFeedback type="invalid">
                    <div>{validation.errors.doctor}</div>
                  </FormFeedback>
                ) : null}
              </div>
            </Col>
            <Col xs={12} md={6}>
              <div className="mb-3">
                <Label htmlFor="doctor" className="form-label">
                  Doctor
                  <span className="text-danger">*</span>
                </Label>
                <Input
                  type="select"
                  name="doctor"
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  defaultValue={""}
                  value={validation.values.doctor || ""}
                  invalid={
                    validation.touched.doctor && validation.errors.doctor
                      ? true
                      : false
                  }
                  className="form-control"
                  placeholder=""
                  id="doctor"
                  bsSize="sm"
                >
                  <option value="" selected disabled hidden>
                    Choose here
                  </option>
                  {(validation.values.consultationType === "ONLINE"
                    ? doctors
                    : filterDoctors(doctors) || []
                  ).map((option, idx) => (
                    <option key={idx} value={option?._id}>
                      {option?.name}
                    </option>
                  ))}
                </Input>
                {validation.touched.doctor && validation.errors.doctor ? (
                  <FormFeedback type="invalid">
                    <div>{validation.errors.doctor}</div>
                  </FormFeedback>
                ) : null}
              </div>
            </Col>
            <Col xs={12} md={4}>
              <div className="mb-3">
                <Label htmlFor="startDate" className="form-label">
                  Scheduled On
                  <span className="text-danger">*</span>
                </Label>
                <Flatpicker
                  name="startDate"
                  value={
                    (isValid(validation.values.startDate) &&
                      validation.values.startDate) ||
                    ""
                  }
                  onChange={([e]) => {
                    const sDate = new Date(validation.values.startDate);
                    const nDate = new Date(validation.values.endDate);
                    const updateSDate = setDate(
                      setMonth(setYear(sDate, e.getFullYear()), e.getMonth()),
                      e.getDate()
                    );
                    const updateNDate = setDate(
                      setMonth(setYear(nDate, e.getFullYear()), e.getMonth()),
                      e.getDate()
                    );

                    if (isValid(e)) {
                      validation.setFieldValue("at", updateSDate);
                      validation.setFieldValue("startDate", updateSDate);
                      validation.setFieldValue("endDate", updateNDate);
                    }
                  }}
                  options={{
                    // enableTime: true,
                    dateFormat: "d M, Y",
                    time_24hr: false,
                    // defaultDate: moment().format('LT'),
                  }}
                  className="form-control py-1 shadow-none bg-light"
                  id="startDate"
                />
              </div>
            </Col>
            <Col xs={12} md={4}>
              <div className="mb-3">
                <Label htmlFor="doctor" className="form-label">
                  At
                  <span className="text-danger">*</span>
                </Label>
                <div className="position-relative">
                  <Input
                    ref={selectRef}
                    type="select"
                    name="at"
                    // defaultValue={""}
                    value={
                      isValid(validation.values.at)
                        ? format(new Date(validation.values.at), "HH:mm")
                        : ""
                    }
                    onChange={(e) => {
                      const selectedOption =
                        e.target.options[e.target.selectedIndex];
                      const d = new Date(selectedOption.id);

                      const sDate = new Date(validation.values.startDate);
                      const nDate = new Date(validation.values.endDate);
                      const diffHours = differenceInHours(nDate, sDate);
                      const diffMinutes = differenceInMinutes(nDate, sDate);

                      const updatedSDate = setHours(
                        sDate,
                        d.getHours()
                      ).setMinutes(d.getMinutes());
                      const updatedNDate = addMinutes(
                        addHours(new Date(updatedSDate), diffHours),
                        diffMinutes
                      );

                      validation.setFieldValue(
                        "startDate",
                        new Date(updatedSDate)
                      );
                      validation.setFieldValue("at", new Date(updatedSDate));
                      validation.setFieldValue(
                        "endDate",
                        new Date(updatedNDate)
                      );
                    }}
                    invalid={
                      validation.touched.at && validation.errors.at
                        ? true
                        : false
                    }
                    onBlur={validation.handleBlur}
                    bsSize="sm"
                    className="form-control"
                    placeholder=""
                    id=""
                  >
                    <option value="" selected disabled hidden>
                      Choose here
                    </option>
                    {(dateSlots || []).map((slot, idx) => {
                      // const isBooked = appointmentsInRange?.find((val) => {
                      //   return isWithinInterval(addMinutes(option, 1), {
                      //     start: new Date(val.startDate),
                      //     end: new Date(val.endDate),
                      //   });
                      //   // format(new Date(val.startDate), "dd-MM-yyyy HH:mm") ===
                      //   // format(option, "dd-MM-yyyy HH:mm")
                      // });

                      if (slot.booked) {
                        return (
                          <option
                            key={idx}
                            value={format(new Date(slot.start), "HH:mm")}
                            id={slot.start}
                            disabled={true}
                          >
                            {format(new Date(slot.start), "hh:mm a")} Already
                            Booked
                          </option>
                        );
                      } else
                        return (
                          <option
                            key={idx}
                            value={format(new Date(slot.start), "HH:mm")}
                            id={slot.start}
                          >
                            {format(new Date(slot.start), "hh:mm a")}
                          </option>
                        );
                    })}
                  </Input>

                  <RenderWhen isTrue={slotsLoading}>
                    <span
                      className="link-success dropdown-input-icon"
                      style={{ right: "50px" }}
                    >
                      <Spinner size={"sm"} color="success" />
                    </span>
                  </RenderWhen>
                </div>

                {slotsError && (
                  <FormFeedback type="invalid" className="d-block">
                    <div>Doctor not available</div>
                  </FormFeedback>
                )}

                {validation.touched.at && validation.errors.at ? (
                  <FormFeedback type="invalid" className="d-block">
                    <div>{validation.errors.at}</div>
                  </FormFeedback>
                ) : null}
              </div>
            </Col>
            <Col xs={12} md={4}>
              <div className="mb-3">
                <Label htmlFor="" className="form-label">
                  For
                  <span className="text-danger">*</span>
                </Label>
                <Input
                  type="select"
                  name="duration"
                  onChange={(e) => {
                    const value = e.target.value;
                    const [hours, minutes] = value.split("-").map(Number);

                    const date = new Date(validation.values.startDate);
                    if (date) {
                      const endDate = addHours(
                        addMinutes(date, minutes),
                        hours
                      );

                      validation.setFieldValue("duration", value);
                      validation.setFieldValue("endDate", endDate);
                    }
                  }}
                  onBlur={validation.handleBlur}
                  value={
                    `${calcDuration().hours}-${calcDuration().minutes}` || ""
                  }
                  className="form-control"
                  bsSize="sm"
                  placeholder=""
                  id=""
                >
                  <option value="" selected disabled hidden>
                    Choose here
                  </option>
                  {(duration || []).map((option, idx) => (
                    <option
                      key={idx}
                      value={`${option.hours}-${option.minutes}`}
                    >
                      {option.hours
                        ? `${option.hours} hr ${option.minutes} min`
                        : `${option.minutes} min`}
                    </option>
                  ))}
                </Input>
                {validation.touched.duration && validation.errors.duration ? (
                  <FormFeedback type="invalid" className="d-block">
                    <div>{validation.errors.duration}</div>
                  </FormFeedback>
                ) : null}
              </div>
            </Col>
            <Col xs={12}>
              <div className="d-flex justify-content-end gap-3 mt-3">
                <Button
                  onClick={() => {
                    toggleForm();
                    validation.resetForm();
                  }}
                  size="sm"
                  color="danger"
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" color="secondary">
                  Save
                </Button>
              </div>
            </Col>
          </Row>
        </Form>{" "}
      </div>
    </React.Fragment>
  );
};

EventForm.propTypes = {};

const mapStateToProps = (state) => ({
  eventDate: state.Booking.eventDate,
  centers: state.Center.data,
  centerAccess: state.User?.centerAccess,
  doctors: state.Setting.doctorSchedule,
  slotsLoading: state.Setting.loading,
  doctorAvailableSlots: state.Setting.doctorAvailableSlots,
  doctor: state.Setting.doctor,
  appointmentsInRange: state.Setting.appointmentsInRange,
  patientPreviousDoctor: state.Booking.patientPreviousDoctor,
  searchPhoneNumber: state.Patient.phoneNumberPatients,
  phoneNumberLoading: state.Patient.phoneNumberLoading,
  uidPatient: state.Patient.uidPatient,
  uidLoading: state.Patient.uidLoading,
  generatedPatientId: state.Patient.generatedPatientId,
});

export default connect(mapStateToProps)(EventForm);
