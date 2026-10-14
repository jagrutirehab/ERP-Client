import { useState } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import { Input } from "reactstrap";
import PhoneInputWithCountrySelect from "react-phone-number-input";
import "react-phone-number-input/style.css";
import ReferralSourceFields from "../../Components/Patient/ReferralSourceFields";
import {
  REFERRAL_DOCTOR_TYPES,
  REFERRAL_SOURCE_OPTIONS,
} from "../../Components/constants/referralSources";

// Same doctor-type options as the patient forms (they ask for the doctor's name
// and mobile number). "Other" is listed last.
const DOCTOR_OPTIONS = [
  { value: "psychiatrist", label: "Psychiatrist" },
  { value: "doctor", label: "Doctor" },
  { value: "online", label: "Online" },
];
const OTHER_OPTION = { value: "other", label: "Other" };
const ALL_OPTIONS = [...DOCTOR_OPTIONS, ...REFERRAL_SOURCE_OPTIONS, OTHER_OPTION];

const EMPTY = {
  refferedBy: "",
  referralPhoneNumber: "",
  referralSource: "",
  referralRefId: "",
  referralName: "",
};

// Which dropdown option a saved lead corresponds to. Old leads have no
// `referralSource`, only free text in `refferedBy`: that text is shown as the
// selected value itself, even though it is not one of the options.
const deriveSelected = (values) => {
  if (values.referralSource) {
    return ALL_OPTIONS.find((o) => o.value === values.referralSource) || null;
  }
  return values.refferedBy
    ? { value: "legacy", label: values.refferedBy }
    : null;
};

/**
 * "Referred By" for the lead form. `values` / `onChange(partialValues)` map onto
 * the lead fields refferedBy, referralSource, referralPhoneNumber,
 * referralRefId and referralName.
 */
const ReferredBy = ({
  values,
  resetKey,
  onChange,
  error,
  sourceError,
  nameError,
  phoneError,
}) => {
  // The user's explicit choice for this lead (undefined = nothing picked yet).
  // Otherwise the value is derived from the lead's current values, so it is
  // right as soon as the form has loaded the lead.
  const [picked, setPicked] = useState({ key: resetKey, opt: undefined });
  const explicit = picked.key === resetKey ? picked.opt : undefined;
  const selected = explicit !== undefined ? explicit : deriveSelected(values);

  const handleSelect = (opt) => {
    setPicked({ key: resetKey, opt });
    onChange({ ...EMPTY, referralSource: opt?.value || "" });
  };

  const needsNameAndPhone = REFERRAL_DOCTOR_TYPES.includes(selected?.value);

  return (
    <>
      <Select
        value={selected}
        onChange={handleSelect}
        options={ALL_OPTIONS}
        placeholder="Select or search for a referral"
        menuPlacement="auto"
        maxMenuHeight={200}
        isClearable
        styles={{
          control: (base) => ({
            ...base,
            borderColor: sourceError ? "#dc3545" : base.borderColor,
          }),
          menu: (base) => ({ ...base, zIndex: 9999 }),
        }}
      />
      {sourceError && (
        <div className="text-danger mt-1 fs-12">{sourceError}</div>
      )}

      {needsNameAndPhone && (
        <>
          <Input
            className="form-control mt-2"
            placeholder="Enter doctor name"
            type="text"
            value={values.refferedBy || ""}
            invalid={!!nameError}
            onChange={(e) => onChange({ refferedBy: e.target.value })}
          />
          {nameError && <div className="text-danger mt-1 fs-12">{nameError}</div>}
          <div className="mt-2">
            <PhoneInputWithCountrySelect
              placeholder="Referral phone number (optional)"
              name="referralPhoneNumber"
              value={values.referralPhoneNumber || ""}
              onChange={(value) =>
                onChange({ referralPhoneNumber: value || "" })
              }
              defaultCountry="IN"
              limitMaxLength={true}
              style={{
                width: "100%",
                height: "42px",
                padding: "0.5rem 0.75rem",
                border: `1px solid ${phoneError ? "#dc3545" : "#ced4da"}`,
                borderRadius: "0.375rem",
                fontSize: "1rem",
              }}
            />
            {phoneError && (
              <div className="text-danger mt-1 fs-12">{phoneError}</div>
            )}
          </div>
        </>
      )}

      <ReferralSourceFields
        source={values.referralSource}
        refId={values.referralRefId}
        name={values.referralName}
        onRefChange={(id, label) =>
          onChange({ referralRefId: id, referralName: label })
        }
        onNameChange={(value) => onChange({ referralName: value })}
        error={error}
      />
    </>
  );
};

ReferredBy.propTypes = {
  values: PropTypes.object.isRequired,
  resetKey: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  sourceError: PropTypes.string,
  nameError: PropTypes.string,
  phoneError: PropTypes.string,
};

export default ReferredBy;
