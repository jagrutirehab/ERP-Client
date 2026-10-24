import React from "react";
import Select from "react-select";

const CenterSelect = ({ options, value, onChange, width = 200 }) => (
  <Select
    options={options}
    value={options.find((option) => option.value === value) || null}
    onChange={(selected) => onChange(selected?.value || "")}
    isDisabled={!options.length}
    placeholder={options.length ? "Select Center" : "No Center Selected"}
    styles={{ container: (base) => ({ ...base, width, minWidth: width }) }}
  />
);

export default CenterSelect;
