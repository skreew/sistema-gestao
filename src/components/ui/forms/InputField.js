import React from 'react';

const InputField = ({ label, type = 'text', value, onChange, placeholder, required, error, icon: Icon, ...props }) => {
    const InputComponent = type === 'textarea' ? 'textarea' : 'input';

    return (
        <div className="form-group">
            {label && <label>{label}</label>}
            <div className={Icon ? "input-with-icon" : ""}>
                {Icon && <span className="icon"><Icon /></span>}
                <InputComponent
                    type={type !== 'textarea' ? type : undefined}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    {...props}
                />
            </div>
            {error && <p className="error-message">{error}</p>}
        </div>
    );
};

export default InputField;