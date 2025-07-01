import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SelectField from '../SelectField';

const options = [
  { value: 'kg', label: 'Kilograma (kg)' },
  { value: 'L', label: 'Litro (L)' },
];

describe('SelectField', () => {
  it('renders a select element with options', () => {
    render(<SelectField label="Unidade" options={options} />);
    expect(screen.getByLabelText('Unidade')).toBeInTheDocument();
    expect(screen.getAllByRole('option').length).toBe(2);
  });

  it('calls onChange when an option is selected', async () => {
    const handleChange = jest.fn();
    render(<SelectField label="Unidade" options={options} onChange={handleChange} />);
    await userEvent.selectOptions(screen.getByLabelText('Unidade'), 'L');
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText('Unidade')).toHaveValue('L');
  });

  it('displays an error message', () => {
    render(<SelectField label="Unidade" options={options} error="Seleção inválida" />);
    expect(screen.getByText('Seleção inválida')).toBeInTheDocument();
  });
});