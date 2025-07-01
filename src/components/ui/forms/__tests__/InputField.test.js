import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InputField from '../InputField';

describe('InputField', () => {
  it('renders a standard text input', () => {
    render(<InputField label="Nome" />);
    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
  });

  it('renders a textarea when type is textarea', () => {
    render(<InputField label="Descrição" type="textarea" />);
    expect(screen.getByLabelText('Descrição').tagName).toBe('TEXTAREA');
  });

  it('calls onChange when text is typed', async () => {
    const handleChange = jest.fn();
    render(<InputField label="Email" onChange={handleChange} />);
    await userEvent.type(screen.getByLabelText('Email'), 'teste@email.com');
    expect(handleChange).toHaveBeenCalled();
  });

  it('displays an error message', () => {
    render(<InputField label="Senha" error="Senha é obrigatória" />);
    expect(screen.getByText('Senha é obrigatória')).toBeInTheDocument();
  });
});