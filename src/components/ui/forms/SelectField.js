import React from 'react';

const SelectField = ({
  label,
  id,
  value,
  onChange,
  options,
  required,
  error,
  ...props
}) => {
  const selectId =
    id ||
    (label
      ? label.toLowerCase().replace(/\s/g, '-')
      : `select-${Math.random().toString(36).substring(7)}`);
  const selectClasses = error ? 'input-error' : '';

  return (
    <div className="form-group">
      {label && <label htmlFor={selectId}>{label}</label>}
      <select
        id={selectId}
        value={value}
        onChange={onChange}
        required={required}
        className={selectClasses}
        {...props}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default SelectField;
