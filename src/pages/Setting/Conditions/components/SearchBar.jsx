import React from "react";
import { Col, Input, InputGroup, InputGroupText } from "reactstrap";

const SearchBar = ({
  value,
  onChange,
  placeholder = "Search conditions...",
}) => {
  return (
    <Col sm={4}>
      <InputGroup>
        <Input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
        <InputGroupText>
          <i className="ri-search-line"></i>
        </InputGroupText>
      </InputGroup>
    </Col>
  );
};

export default SearchBar;
