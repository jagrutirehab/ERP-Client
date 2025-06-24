import { connect, useDispatch } from "react-redux";
import React, { useEffect } from "react";
// React Toastify
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { setAlert } from "../../store/actions";

const Alerts = ({ alert }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    // alerts.forEach((alert) => {
    // if (alert.type === "loading") {
    //   toast.loading(alert.message);
    // } else
    // if (alert.type === "success") {
    //   toast.success(alert.message);
    // } else {
    //   toast.error(alert.message);
    // }
    // })
    if (alert.type) toast[alert.type](alert.message);

    setTimeout(() => {
      if (alert?.type) dispatch(setAlert({ message: "", type: null }));
    }, 2000);
  }, [alert, dispatch]);

  return (
    <React.Fragment>
      <ToastContainer
        theme={"colored"}
        autoClose={5000}
        limit={1}
        newestOnTop={false}
        icon={true}
        position="top-right"
        hideProgressBar={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </React.Fragment>
  );
};

const mapStateToProps = (state) => ({
  alert: state.Alert.alerts,
});

export default connect(mapStateToProps)(Alerts);
