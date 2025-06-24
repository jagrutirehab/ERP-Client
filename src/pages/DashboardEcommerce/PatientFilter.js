import React, { useCallback, useState } from "react";

import AsyncSelect from "react-select/async";
import { connect, useDispatch } from "react-redux";
import { debounce } from "lodash";
import { searchUser } from "../../store/actions";

const PatientFilter = ({
  users,
  centerAccess,
  selectedOptions,
  setSelectedOptions,
}) => {
  const dispatch = useDispatch();
  //   const [selectedOption, setSelectedOption] = useState(null);

  //   const promiseOptions = (inputValue) => {
  //     setSelectedOption(inputValue);
  //     setTimeout(() => {
  //       dispatch(
  //         searchUser({
  //           query: inputValue,
  //           centerAccess: JSON.stringify(centerAccess),
  //         })
  //       );
  //     }, 1000);
  //   };

  //   const loadOptions = useCallback(
  //     debounce((inputValue, callback) => {
  //       if (inputValue) {
  //         dispatch(
  //           searchUser({
  //             query: inputValue,
  //             centerAccess: JSON.stringify(centerAccess),
  //           })
  //         );
  //         callback(users);
  //       } else {
  //         callback([]);
  //       }
  //     }, 500),
  //     [dispatch, users, centerAccess]
  //   );

  const loadOptions = debounce((inputValue, callback) => {
    console.log(inputValue);

    if (inputValue) {
      dispatch(
        searchUser({
          query: inputValue,
          centerAccess: JSON.stringify(centerAccess),
        })
      );
      //   .then(() => {
      callback(users);
      //   });
    } else {
      callback([]);
    }
  }, 500);

  //   const loadOptions = (inputValue, callback) => {
  //     // console.log(inputValue, "input value");

  //     if (inputValue) {
  //       setTimeout(() => {
  //         dispatch(
  //           searchUser({
  //             query: inputValue,
  //             centerAccess: JSON.stringify(centerAccess),
  //           })
  //         );
  //         callback(users);
  //       }, 500); // Simulate delay for search
  //     } else {
  //       callback([]);
  //     }
  //   };

  const promiseOptions = (inputValue) => {
    console.log(inputValue, "input value");
    setSelectedOptions((prevValue) => [inputValue, ...(prevValue || [])]);
  };

  return (
    <AsyncSelect
      isMulti
      defaultOptionsdefaultValue={selectedOptions}
      onChange={promiseOptions}
      placeholder="Select user..."
      loadOptions={loadOptions}
    />
  );
};

const mapStateToProps = (state) => ({
  users:
    state.User.data?.map((user) => ({ value: user._id, label: user.name })) ||
    [],
  centerAccess: state.User.centerAccess,
});

export default connect(mapStateToProps)(PatientFilter);
