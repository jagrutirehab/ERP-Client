import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { connect, useDispatch } from "react-redux";
import { fetchUserTimeline } from "../../store/features/timeline/timelineSlice";
import Timeline from "../../Components/Common/Timeline";

const Activity = ({ userActivity, data }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchUserTimeline({ user: userActivity?._id }));
  }, [dispatch, userActivity]);

  const displayDetails = (data) => {
    let details =
      //patient
      data?.patient?.name ||
      data?.create?.name ||
      data?.edit?.name ||
      data?.delete?.name ||
      data?.restore?.name ||
      (data.center &&
        `${data.patient.name}, Previous & Current Center (${data?.center?.previous?.title} - ${data?.center?.current?.title})`) ||
      //lead
      data?.create?.patient?.name ||
      data?.edit?.patient?.name ||
      data?.delete?.patient?.name ||
      data?.restore?.patient?.name ||
      //center
      data?.create?.title ||
      data?.edit?.title ||
      data?.delete?.title ||
      data?.restore?.title ||
      //medicine
      data?.create?.drugName ||
      data?.edit?.drugName ||
      data?.delete?.drugName ||
      data?.restore?.drugName;

    return details;
  };

  return (
    <React.Fragment>
      <div>
        {/* <UserBar user={userActivity} /> */}
        <Timeline data={data} displayDetails={displayDetails} />
      </div>
    </React.Fragment>
  );
};

Activity.propTypes = {
  userActivity: PropTypes.object.isRequired,
  data: PropTypes.array,
};

const mapStateToProps = (state) => ({
  data: state.Timeline.user,
});

export default connect(mapStateToProps)(Activity);
