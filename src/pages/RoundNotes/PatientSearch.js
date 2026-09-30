import React, { useCallback } from "react";
import AsyncSelect from "react-select/async";
import debounce from "lodash.debounce";
import { io } from "socket.io-client";
import config from "../../config"; // Adjust path as needed

// Initialize socket exactly as before
const socket = io(config.api.BASE_URL, {
  path: "/socket/search",
});

const PatientAsyncSelect = ({
  value,
  onChange,
  disabled,
  isMulti = false,
  placeholder = "Search patient...",
}) => {
  // 1. Create a function that emits the socket and waits for the response
  const fetchPatients = (inputValue, callback) => {
    if (!inputValue || inputValue.trim().length < 2) {
      return callback([]);
    }

    // Generate a unique key for this specific request
    const uniqueKey = `search-${Date.now()}-${Math.random()}`;

    const handleSearchResults = (data) => {
      // Ensure we are resolving the data for THIS specific keystroke
      if (data.key === uniqueKey) {
        socket.off("searchResults", handleSearchResults); // Clean up listener

        const results = data.results || data;
        const options = results.map((item) => ({
          label: `${item.name} ${item.patientId ? `— ${item.patientId}` : ""}`,
          value: item._id,
          original: item, // Keep original data for the form
        }));

        callback(options);
      }
    };

    socket.on("searchResults", handleSearchResults);
    socket.emit("search", { query: inputValue, key: uniqueKey });
  };

  // 2. Debounce the fetch to prevent spamming the socket on every keystroke
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFetchPatients = useCallback(debounce(fetchPatients, 500), []);

  // 3. Wrap in a Promise for React-Select Async
  const loadOptions = (inputValue) =>
    new Promise((resolve) => {
      debouncedFetchPatients(inputValue, resolve);
    });

  return (
    <AsyncSelect
      isDisabled={disabled}
      isMulti={isMulti} // Ready for your future multi-select requirement
      cacheOptions
      defaultOptions={false}
      loadOptions={loadOptions}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      classNamePrefix="select2" // Matches your existing theme styling
      noOptionsMessage={({ inputValue }) =>
        inputValue?.length < 2
          ? "Type at least 2 characters..."
          : "No patient found"
      }
      isClearable
      styles={{
        // Optional: Keep the height consistent with your table rows
        control: (base) => ({ ...base, minHeight: "38px" }),
      }}
    />
  );
};

export default PatientAsyncSelect;
