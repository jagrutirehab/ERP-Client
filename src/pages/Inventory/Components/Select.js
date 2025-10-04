export const Select = ({ options, placeholder, value, onChange, className }) => (
  <select
    value={value}
    onChange={onChange}
    className={`form-select border-primary rounded-lg px-3 py-2 shadow-sm ${className}`}
  >
    <option value="">{placeholder}</option>
    {options.map((opt, i) => (
      <option key={i} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
);