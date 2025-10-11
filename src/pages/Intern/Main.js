import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import InternTopbar from "./InternTopbar";
import Views from "./Views";
import { connect } from "react-redux";
import RenderWhen from "../../Components/Common/RenderWhen";
import { useParams } from "react-router-dom";
import { fetchInternById } from "../../store/actions";

const Main = ({ intern, deleteIntern, setDeleteIntern }) => {
  const dispatch = useDispatch();
  const { id } = useParams();
  useEffect(() => {
    if (!id || id === "*") return;

    const fetchData = async () => {
      try {
        dispatch(fetchInternById(id));
      } catch (err) {
        console.error("Failed to fetch intern:", err);
      }
    };

    fetchData();
  }, [dispatch, id]);

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
