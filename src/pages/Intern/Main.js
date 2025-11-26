import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import InternTopbar from "./InternTopbar";
import Views from "./Views";
import { connect } from "react-redux";
import RenderWhen from "../../Components/Common/RenderWhen";
import { useNavigate, useParams } from "react-router-dom";
import { fetchInternById } from "../../store/actions";
import { usePermissions } from "../../Components/Hooks/useRoles";
import { Spinner } from "reactstrap";

const Main = ({ intern, deleteIntern, setDeleteIntern }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const {
    loading: permissionLoader,
    hasPermission,
    roles,
  } = usePermissions(token);
  const hasUserPermission = hasPermission("INTERN", null, "READ");

  useEffect(() => {
    if (!hasUserPermission) return;
    if (!id || id === "*") return;
    const fetchData = async () => {
      try {
        dispatch(fetchInternById(id));
      } catch (err) {
        console.error("Failed to fetch intern:", err);
      }
    };

    fetchData();
  }, [dispatch, id, roles]);

  if (permissionLoader) {
      return (
        <div className="d-flex justify-content-center align-items-center vh-100">
          <Spinner
            color="primary"
            className="d-block"
            style={{ width: "3rem", height: "3rem" }}
          />
        </div>
      );
    }
  
    if (!hasUserPermission) {
      navigate("/unauthorized");
      return null;
    }

  return (
    <React.Fragment>
      <RenderWhen isTrue={intern ? true : false}>
        <div className="w-100">
          <InternTopbar
            deleteIntern={deleteIntern}
            setDeleteIntern={setDeleteIntern}
          />
          <Views />
        </div>
      </RenderWhen>
    </React.Fragment>
  );
};

Main.propTypes = {
  intern: PropTypes.object,
  deleteIntern: PropTypes.object,
  setDeleteIntern: PropTypes.func,
};

const mapStateToProps = (state) => ({
  intern: state.Intern.intern,
});

export default connect(mapStateToProps)(Main);
