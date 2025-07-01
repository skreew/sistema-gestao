import React from 'react';

const SelectField = ({ label, value, onChange, options, required, error, ...props }) => (
    <div className="form-group">
        {label && <label>{label}</label>}
        <select
            value={value}
            onChange={onChange}
            required={required}
            {...props}
        >
            {options.map((option, index) => (
                <option key={index} value={option.value} disabled={option.disabled}>
                    {option.label}
                </option>
            ))}
        </select>
        {error && <p className="error-message">{error}</p>}
    </div>
);

export default SelectField;