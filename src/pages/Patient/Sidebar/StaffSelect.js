import { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import Select, { components } from "react-select";
import { getPatientStaff } from "../../../helpers/backend_helper";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

const STYLES = {
  control: (base) => ({
    ...base,
    minHeight: 40,
    borderRadius: 8,
    backgroundColor: "var(--vz-light, #f3f6f9)",
  }),
  valueContainer: (base) => ({ ...base, padding: "0 10px" }),
  input: (base) => ({ ...base, margin: 0, padding: 0 }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base) => ({ ...base, padding: "0 6px" }),
  clearIndicator: (base) => ({ ...base, padding: "0 4px" }),
  option: (base) => ({
    ...base,
    fontSize: 13,
    whiteSpace: "normal",
    wordBreak: "break-word",
  }),
  menu: (base) => ({
    ...base,
    width: "max-content",
    minWidth: "100%",
    maxWidth: 260,
    left: 0,
  }),
};

const SearchInput = (props) => (
  <components.Input
    {...props}
    autoComplete="off"
    name="staff-search"
    data-lpignore="true"
    data-1p-ignore="true"
    data-bwignore="true"
    data-form-type="other"
    data-gramm="false"
    data-gramm_editor="false"
    data-enable-grammarly="false"
  />
);

const ALL_OPTION ={ value: null, label: "All" };

const toOption = (u) => ({
  value: u._id,
  label: `${u.name} (${u.role.charAt(0)}${u.role.slice(1).toLowerCase()})`,
});

const StaffSelect = ({ value, onChange, centerAccess }) => {
  const [options, setOptions] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [opened, setOpened] = useState(false);

  const requestIdRef = useRef(0);
  const loadingRef = useRef(false);

  const load = useCallback(
    async (skip, term) => {
      const requestId = ++requestIdRef.current;
      loadingRef.current = true;
      setLoading(true);
      try {
        const res = await getPatientStaff({
          centerAccess,
          skip,
          search: term,
        });
        if (requestId !== requestIdRef.current) return;
        const page = (res?.payload || []).map(toOption);
        setOptions((prev) => (skip === 0 ? page : [...prev, ...page]));
        setHasMore(page.length === PAGE_SIZE);
      } catch {
        if (requestId !== requestIdRef.current) return;
        setHasMore(false);
      } finally {
        if (requestId === requestIdRef.current) {
          loadingRef.current = false;
          setLoading(false);
        }
      }
    },
    [centerAccess]
  );

  useEffect(() => {
    if (!opened) return;
    const timer = setTimeout(() => {
      setHasMore(true);
      load(0, search);
    }, search ? SEARCH_DEBOUNCE_MS : 0);
    return () => clearTimeout(timer);
  }, [load, search, opened]);

  const handleScrollToBottom = () => {
    if (!hasMore || loadingRef.current) return;
    load(options.length, search);
  };


  const [menuOpen, setMenuOpen] = useState(false);

  const openOnValueClick = (e) => {
    if (e.target.closest('[aria-hidden="true"]')) return;
    if (!menuOpen) {
      setOpened(true);
      setMenuOpen(true);
    }
  };

  return (
    <div onMouseDown={openOnValueClick}>
    <Select
      menuIsOpen={menuOpen}
      value={value || ALL_OPTION}
      onChange={(opt) => onChange(opt?.value ? opt : null)}
      options={search ? options : [ALL_OPTION, ...options]}
      placeholder="All"
      isClearable={!!value}
      isLoading={loading}
      filterOption={null}
      onInputChange={(input, { action }) => {
        if (action === "input-change") setSearch(input);
      }}
      components={{ Input: SearchInput }}
      openMenuOnFocus
      onMenuOpen={() => {
        setOpened(true);
        setMenuOpen(true);
      }}
      onMenuClose={() => {
        setSearch("");
        setMenuOpen(false);
      }}
      onMenuScrollToBottom={handleScrollToBottom}
      menuPlacement="auto"
      styles={STYLES}
    />
    </div>
  );
};

StaffSelect.propTypes = {
  value: PropTypes.object,
  onChange: PropTypes.func,
  centerAccess: PropTypes.array,
};

export default StaffSelect;
