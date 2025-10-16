// export const Select = ({ options, placeholder, value, onChange, className }) => (
//   <select
//     value={value}
//     onChange={onChange}
//     className={`form-select border-primary rounded-lg px-3 py-2 shadow-sm ${className}`}
//   >
//     <option value="">{placeholder}</option>
//     {options.map((opt, i) => (
//       <option key={i} value={opt.value}>
//         {opt.label}
//       </option>
//     ))}
//   </select>
// );

import { useEffect } from "react";

export const Select = ({
  options = [],
  placeholder,
  value,
  onChange,
  className,
}) => {
  useEffect(() => {
    if (options.length === 1 && !value) {
      onChange({ target: { value: options[0].value } });
    }
  }, [options, value, onChange]);

  return (
    <select
      value={value}
      onChange={onChange}
      className={`form-select border-primary rounded-lg px-3 py-2 shadow-sm ${className}`}
      disabled={options.length === 1}
    >
      {options.length > 1 && <option value="">{placeholder}</option>}
      {options.map((opt, i) => (
        <option key={i} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};
