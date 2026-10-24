import { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import { Input } from "reactstrap";
import {
  getReferralEmployees,
  getReferralPatients,
} from "../../helpers/backend_helper";
import { REFERRAL_SOURCE_OPTIONS } from "../constants/referralSources";

const PAGE_SIZE = 20;
const DEBOUNCE_MS = 300;

const employeeLabel = (e) => (e.eCode ? `${e.name} (${e.eCode})` : e.name);

const patientLabel = (p) => {
  const uid = p.id ? `${p.id.prefix || ""}${p.id.value}` : "";
  const center = p.center?.title ? ` - ${p.center.title}` : "";
  return `${p.name}${uid ? ` (${uid})` : ""}${center}`;
};

const selectStyles = (invalid) => ({
  control: (base) => ({ ...base, borderColor: invalid ? "#dc3545" : "#ced4da" }),
  menu: (base) => ({ ...base, zIndex: 9999 }),
});

// Paginated active-employee picker (same load-on-open / scroll-to-load
// behaviour as the patient sidebar StaffSelect).
const EmployeeSelect = ({ type, value, onChange, invalid }) => {
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
        const res = await getReferralEmployees({ type, skip, search: term });
        if (requestId !== requestIdRef.current) return;
        const page = (res?.payload || []).map((e) => ({
          value: e._id,
          label: employeeLabel(e),
        }));
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
    [type],
  );

  useEffect(() => {
    if (!opened) return;
    const timer = setTimeout(
      () => {
        setHasMore(true);
        load(0, search);
      },
      search ? DEBOUNCE_MS : 0,
    );
    return () => clearTimeout(timer);
  }, [load, search, opened]);

  return (
    <Select
      value={value}
      onChange={(opt) => onChange(opt)}
      options={options}
      placeholder="Select employee"
      menuPlacement="auto"
      maxMenuHeight={200}
      isClearable
      isLoading={loading}
      filterOption={null}
      onInputChange={(input, { action }) => {
        if (action === "input-change") setSearch(input);
      }}
      onMenuOpen={() => setOpened(true)}
      onMenuClose={() => setSearch("")}
      onMenuScrollToBottom={() => {
        if (!hasMore || loadingRef.current) return;
        load(options.length, search);
      }}
      styles={selectStyles(invalid)}
    />
  );
};

// Existing-patient picker (all centres), searched by name or UID via
// /patient/referral-patients and paged on scroll.
const PatientSelect = ({ value, onChange, invalid }) => {
  const [options, setOptions] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const requestIdRef = useRef(0);
  const loadingRef = useRef(false);

  const load = useCallback(async (skip, term) => {
    const requestId = ++requestIdRef.current;
    loadingRef.current = true;
    setLoading(true);
    try {
      const res = await getReferralPatients({ search: term, skip });
      if (requestId !== requestIdRef.current) return;
      const page = (res?.payload || []).map((p) => ({
        value: p._id,
        label: patientLabel(p),
      }));
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
  }, []);

  useEffect(() => {
    const term = search.trim();
    if (term.length < 2) {
      requestIdRef.current++;
      setOptions([]);
      setHasMore(false);
      return;
    }
    const timer = setTimeout(() => load(0, term), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [load, search]);

  return (
    <Select
      value={value}
      onChange={(opt) => onChange(opt)}
      options={options}
      placeholder="Search patient by name or UID"
      menuPlacement="auto"
      maxMenuHeight={200}
      noOptionsMessage={() =>
        search.trim().length < 2 ? "Type at least 2 characters" : "No patients"
      }
      isClearable
      isLoading={loading}
      filterOption={null}
      onInputChange={(input, { action }) => {
        if (action === "input-change") setSearch(input);
      }}
      onMenuScrollToBottom={() => {
        if (!hasMore || loadingRef.current) return;
        load(options.length, search.trim());
      }}
      styles={selectStyles(invalid)}
    />
  );
};

/**
 * Sub-input shown under the "Referred By" select for the extra sources.
 * Employee / patient pickers are mandatory (validated by the parent form);
 * relative / friend is an optional name input.
 */
const ReferralSourceFields = ({
  source,
  refId,
  name,
  onRefChange,
  onNameChange,
  error,
}) => {
  const config = REFERRAL_SOURCE_OPTIONS.find((o) => o.value === source);
  const [resolved, setResolved] = useState({ id: "", label: "" });
  const pickedIdRef = useRef("");

  // On edit only the employee / patient ID is stored, so look the employee
  // code / patient UID up for the label. Skipped for values picked just now.
  useEffect(() => {
    const isLookup =
      config?.sub && config.sub !== "name" && refId && refId !== pickedIdRef.current;
    if (!isLookup) return;
    let cancelled = false;
    const isPatient = config.sub === "patient";
    (isPatient ? getReferralPatients : getReferralEmployees)({ id: refId })
      .then((res) => {
        const item = res?.payload?.[0];
        if (cancelled || !item) return;
        setResolved({
          id: refId,
          label: isPatient ? patientLabel(item) : employeeLabel(item),
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [refId, config]);

  if (!config?.sub) return null;

  const selected = refId
    ? {
        value: refId,
        label: (resolved.id === refId && resolved.label) || name || "Selected",
      }
    : null;
  const handlePick = (opt) => {
    pickedIdRef.current = opt?.value || "";
    onRefChange(opt?.value || "", opt?.label || "");
  };

  return (
    <div className="mt-2">
      {config.sub === "employee-telecaller" && (
        <EmployeeSelect
          key={source}
          type="telecaller"
          value={selected}
          onChange={handlePick}
          invalid={!!error}
        />
      )}
      {config.sub === "employee-all" && (
        <EmployeeSelect
          key={source}
          type="all"
          value={selected}
          onChange={handlePick}
          invalid={!!error}
        />
      )}
      {config.sub === "patient" && (
        <PatientSelect
          key={source}
          value={selected}
          onChange={handlePick}
          invalid={!!error}
        />
      )}
      {config.sub === "name" && (
        <Input
          type="text"
          className="form-control"
          placeholder={`${config.label} name (optional)`}
          value={name || ""}
          onChange={(e) => onNameChange(e.target.value)}
        />
      )}
      {error && <div className="text-danger mt-1 fs-12">{error}</div>}
    </div>
  );
};

ReferralSourceFields.propTypes = {
  source: PropTypes.string,
  refId: PropTypes.string,
  name: PropTypes.string,
  onRefChange: PropTypes.func.isRequired,
  onNameChange: PropTypes.func.isRequired,
  error: PropTypes.string,
};

export default ReferralSourceFields;
