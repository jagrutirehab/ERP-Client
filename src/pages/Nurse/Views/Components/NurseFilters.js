import React from "react";
import { useDispatch } from "react-redux";
import { Input, Label, Row, Col } from "reactstrap";
import { setPatientIdsFromSearch } from "../../../../store/features/nurse/nurseSlice";

const NurseFilters = ({ flag, setFlag }) => {
  const dispatch = useDispatch();
  const handleNameChange = (e) => {
    const selectedOption = e.target.value;
    console.log(selectedOption);
  };

  const handleFlagChange = (e) => {
    setFlag(e.target.value);
    dispatch(setPatientIdsFromSearch(true));
  };


  const name = "";

  return (
    <React.Fragment>
      <Row className="g-3">
        <Col xs="12" md="6">
          <Label>Filter by Status</Label>
          <Input
            className="form-control"
            onChange={handleFlagChange}
            value={flag}
            bsSize="sm"
            type="select"
          >
            <option value={""}>All Patients</option>
            <option value={"urgent"}>Urgent(Red)</option>
            <option value={"attention"}>Attention(Yellow)</option>
            <option value={"stable"}>Stable(Green)</option>
          </Input>
        </Col>

        <Col xs="12" md="6">
          <Label>Sort By Name</Label>
          <Input
            onChange={handleNameChange}
            className="form-control"
            value={name}
            bsSize="sm"
            type="select"
          >
            <option>All</option>
            <option>Room #Asc</option>
            <option>Time Due(Earliest First)</option>
            <option>Last Update(Recent First)</option>
          </Input>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default NurseFilters;
