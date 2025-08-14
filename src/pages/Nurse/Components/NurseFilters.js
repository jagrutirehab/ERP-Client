import React from "react";
import { Input, Label, Row, Col } from "reactstrap";

const NurseFilters = () => {
  const handleStatusChange = (e) => {
    const selectedOption = e.target.value;
    console.log(selectedOption);
  };

  const handleNameChange = (e) => {
    const selectedOption = e.target.value;
    console.log(selectedOption);
  };


  const status = "";
  const name = "";

  return (
    <React.Fragment>
      <Row className="g-3"> 
        <Col xs="12" md="6">
          <Label>Filter by Status</Label>
          <Input
            onChange={handleStatusChange}
            value={status}
            bsSize="sm"
            type="select"
          >
            <option>All Patients</option>
            <option>Urgent(Red)</option>
            <option>Attention(Yellow)</option>
            <option>Stable(Green)</option>
          </Input>
        </Col>

        <Col xs="12" md="6">
          <Label>Sort By Name</Label>
          <Input
            onChange={handleNameChange}
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
