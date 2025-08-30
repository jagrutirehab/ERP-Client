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
  const loadOptions = debounce((inputValue, callback) => {
    if (inputValue) {
      dispatch(
        searchUser({
          query: inputValue,
          centerAccess: JSON.stringify(centerAccess),
        })
      );
      callback(users);
    } else {
      callback([]);
    }
  }, 500);

  const promiseOptions = (inputValue) => {
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
  centerAccess: state.User?.centerAccess,
});

export default connect(mapStateToProps)(PatientFilter);
