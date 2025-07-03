import React, { forwardRef } from 'react';

const InputField = forwardRef(
  (
    {
      label,
      id,
      type = 'text',
      value,
      onChange,
      placeholder,
      required,
      error,
      icon: Icon,
      ...props
    },
    ref,
  ) => {
    const inputId =
      id ||
      (label
        ? label.toLowerCase().replace(/\s/g, '-')
        : `input-${Math.random().toString(36).substring(7)}`);
    const inputClasses = error ? 'input-error' : '';

    return (
      <div className="form-group">
        {label && <label htmlFor={inputId}>{label}</label>}
        <div className={`input-with-icon ${Icon ? 'has-icon' : ''}`}>
          {Icon && <Icon size={20} className="icon" />}
          {type === 'textarea' ? (
            <textarea
              id={inputId}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              required={required}
              className={inputClasses}
              ref={ref}
              {...props}
            />
          ) : (
            <input
              id={inputId}
              type={type}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              required={required}
              className={inputClasses}
              ref={ref}
              {...props}
            />
          )}
        </div>
        {error && <span className="error-message">{error}</span>}
      </div>
    );
  },
);

export default InputField;
