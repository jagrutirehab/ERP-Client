import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import BookingBar from "./Components/BookingBar";
import { useDispatch } from "react-redux";
import {
  fetchAllDoctorSchedule,
  fetchCalenderDuration,
} from "../../../store/actions";
import PracticeList from "./Components/PracticeList";
import DoctorSchedule from "./Components/DoctorSchedule";
import Schedule from "../../Booking/Components/Schedule";
import CustomModal from "../../../Components/Common/Modal";
import { Nav, NavItem, NavLink } from "reactstrap";

const Booking = () => {
  const dispatch = useDispatch();

  const [doctor, setDoctor] = useState({
    isOpen: false,
    data: null,
  });
  const toggleDoctor = ({ doc }) => {
    setDoctor({
      isOpen: !doctor.isOpen,
      data: doc,
    });
  };

  useEffect(() => {
    dispatch(fetchAllDoctorSchedule());
    dispatch(fetchCalenderDuration());
  }, [dispatch]);

  return (
    <React.Fragment>
      <div className="w-100">
        {/* <Container fluid> */}
        <div className="mt-4 mx-4 mb-3">
          <BreadCrumb title="Calender" pageTitle="Booking" />
        </div>
        <div>
          <BookingBar />
          <PracticeList toggleForm={toggleDoctor} />

          <CustomModal
            title={"User Schedule"}
            centered
            isOpen={doctor.isOpen}
            toggle={toggleDoctor}
            size={"xl"}
            className={"h-100"}
          >
            <Schedule
              doctor={doctor.data}
              isOpen={doctor.isOpen}
              toggle={toggleDoctor}
            />
          </CustomModal>
          {/* <DoctorSchedule doctor={doctor} toggle={toggleDoctor} /> */}
        </div>
      </div>
    </React.Fragment>
  );
};

Booking.propTypes = {};

export default Booking;
