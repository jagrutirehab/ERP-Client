import React, { useMemo } from "react";
import AsyncSelect from "react-select/async";
import debounce from "lodash.debounce";
import { searchESICEmployees } from "../../../../helpers/backend_helper";

const toOption = (employee) => ({
  value: employee._id,
  label: `${employee.name} (${employee.eCode})${
    employee.currentLocation?.title ? ` — ${employee.currentLocation.title}` : ""
  }`,
  employee,
});

const EmployeeSearchSelect = ({ value, onSelect, disabled = false }) => {
  const debouncedFetch = useMemo(
    () =>
      debounce((inputValue, resolve) => {
        if (!inputValue || inputValue.trim().length < 2) {
          resolve([]);
          return;
        }
        searchESICEmployees({ query: inputValue.trim() })
          .then((response) => {
            resolve((response?.data || []).map(toOption));
          })
          .catch(() => resolve([]));
      }, 500),
    [],
  );

  const loadOptions = (inputValue) =>
    new Promise((resolve) => debouncedFetch(inputValue, resolve));

  return (
    <AsyncSelect
      inputId="esic-employee-search"
      loadOptions={loadOptions}
      placeholder="Search employee by name or code"
      value={value ? toOption(value) : null}
      isClearable
      isDisabled={disabled}
      classNamePrefix="react-select"
      onChange={(option) => onSelect(option ? option.employee : null)}
    />
  );
};

export default EmployeeSearchSelect;
