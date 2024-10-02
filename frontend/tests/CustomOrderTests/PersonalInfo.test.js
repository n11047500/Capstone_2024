// PersonalInfoForm.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PersonalInfoForm from '../../src/pages/CustomOrder/personalInfo'; // Adjust the path as needed

describe('PersonalInfoForm', () => {
  const mockOnChange = jest.fn();
  const mockOnNext = jest.fn();
  const mockOnBack = jest.fn();

  const initialData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
  };

  it('renders input fields with correct placeholders', () => {
    render(
      <PersonalInfoForm
        data={initialData}
        onChange={mockOnChange}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByPlaceholderText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Phone Number/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Address/i)).toBeInTheDocument();
  });

  it('calls onChange with updated data when input fields change', () => {
    render(
      <PersonalInfoForm
        data={initialData}
        onChange={mockOnChange}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const firstNameInput = screen.getByPlaceholderText(/First Name/i);
    const lastNameInput = screen.getByPlaceholderText(/Last Name/i);
    const emailInput = screen.getByPlaceholderText(/Email/i);
    const phoneInput = screen.getByPlaceholderText(/Phone Number/i);
    const addressInput = screen.getByPlaceholderText(/Address/i);

    // Simulate changing the first name
    fireEvent.change(firstNameInput, { target: { value: 'John', name: 'firstName' } });
    expect(mockOnChange).toHaveBeenCalledWith({ ...initialData, firstName: 'John' });

    // Simulate changing the last name
    fireEvent.change(lastNameInput, { target: { value: 'Doe', name: 'lastName' } });
    expect(mockOnChange).toHaveBeenCalledWith({ ...initialData, lastName: 'Doe' });

    // Simulate changing the email
    fireEvent.change(emailInput, { target: { value: 'john.doe@example.com', name: 'email' } });
    expect(mockOnChange).toHaveBeenCalledWith({ ...initialData, email: 'john.doe@example.com' });

    // Simulate changing the phone
    fireEvent.change(phoneInput, { target: { value: '123-456-7890', name: 'phone' } });
    expect(mockOnChange).toHaveBeenCalledWith({ ...initialData, phone: '123-456-7890' });

    // Simulate changing the address
    fireEvent.change(addressInput, { target: { value: '123 Main St', name: 'address' } });
    expect(mockOnChange).toHaveBeenCalledWith({ ...initialData, address: '123 Main St' });
  });

  it('calls onBack when back button is clicked', () => {
    render(
      <PersonalInfoForm
        data={initialData}
        onChange={mockOnChange}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const backButton = screen.getByText(/Back/i);
    fireEvent.click(backButton);
    expect(mockOnBack).toHaveBeenCalled();
  });

  it('calls onNext when next button is clicked', () => {
    render(
      <PersonalInfoForm
        data={initialData}
        onChange={mockOnChange}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const nextButton = screen.getByText(/Next/i);
    fireEvent.click(nextButton);
    expect(mockOnNext).toHaveBeenCalled();
  });
});
