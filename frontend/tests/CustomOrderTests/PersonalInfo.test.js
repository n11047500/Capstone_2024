// PersonalInfoForm.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PersonalInfoForm from '../../src/pages/CustomOrder/personalInfo';

describe('PersonalInfoForm', () => {
  const mockOnChange = jest.fn();
  const mockOnNext = jest.fn();
  const mockOnBack = jest.fn();

  const initialData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  };

  beforeEach(() => {
    // Clear mocks before each test
    mockOnChange.mockClear();
    mockOnNext.mockClear();
    mockOnBack.mockClear();
  });

  beforeAll(() => {
    window.alert = jest.fn();
  });

  test('renders input fields with correct placeholders', () => {
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
  });

  test('calls onChange with updated data when input fields change', () => {
    render(
      <PersonalInfoForm
        data={initialData}
        onChange={mockOnChange}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const firstNameInput = screen.getByPlaceholderText(/First Name/i);
    fireEvent.change(firstNameInput, { target: { value: 'John', name: 'firstName' } });
    expect(mockOnChange).toHaveBeenCalledWith({ ...initialData, firstName: 'John' });

    const lastNameInput = screen.getByPlaceholderText(/Last Name/i);
    fireEvent.change(lastNameInput, { target: { value: 'Doe', name: 'lastName' } });
    expect(mockOnChange).toHaveBeenCalledWith({ ...initialData, lastName: 'Doe' });

    const emailInput = screen.getByPlaceholderText(/Email/i);
    fireEvent.change(emailInput, { target: { value: 'john.doe@example.com', name: 'email' } });
    expect(mockOnChange).toHaveBeenCalledWith({ ...initialData, email: 'john.doe@example.com' });

    const phoneInput = screen.getByPlaceholderText(/Phone Number/i);
    fireEvent.change(phoneInput, { target: { value: '123-456-7890', name: 'phone' } });
    expect(mockOnChange).toHaveBeenCalledWith({ ...initialData, phone: '123-456-7890' });
  });

  test('calls onBack when back button is clicked', () => {
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

  test('calls onNext when next button is clicked if all fields are valid', () => {
    render(
      <PersonalInfoForm
        data={{ firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', phone: '123-456-7890' }}
        onChange={mockOnChange}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const nextButton = screen.getByText(/Next/i);
    fireEvent.click(nextButton);
    expect(mockOnNext).toHaveBeenCalled();
  });

  test('does not call onNext if first name is empty', () => {
    render(
      <PersonalInfoForm
        data={{ firstName: '', lastName: 'Doe', email: 'john.doe@example.com', phone: '123-456-7890' }}
        onChange={mockOnChange}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const nextButton = screen.getByText(/Next/i);
    fireEvent.click(nextButton);
    expect(mockOnNext).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('First Name is required');
  });

  test('does not call onNext if last name is empty', () => {
    render(
      <PersonalInfoForm
        data={{ firstName: 'John', lastName: '', email: 'john.doe@example.com', phone: '123-456-7890' }}
        onChange={mockOnChange}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const nextButton = screen.getByText(/Next/i);
    fireEvent.click(nextButton);
    expect(mockOnNext).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Last Name is required');
  });

  test('does not call onNext if email is empty', () => {
    render(
      <PersonalInfoForm
        data={{ firstName: 'John', lastName: 'Doe', email: '', phone: '123-456-7890' }}
        onChange={mockOnChange}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const nextButton = screen.getByText(/Next/i);
    fireEvent.click(nextButton);
    expect(mockOnNext).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Email is required');
  });

  test('does not call onNext if phone number is empty', () => {
    render(
      <PersonalInfoForm
        data={{ firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', phone: '' }}
        onChange={mockOnChange}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const nextButton = screen.getByText(/Next/i);
    fireEvent.click(nextButton);
    expect(mockOnNext).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Phone number is required');
  });

  test('does not call onNext if phone number is invalid', () => {
    render(
      <PersonalInfoForm
        data={{ firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', phone: 'invalid-phone' }}
        onChange={mockOnChange}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const nextButton = screen.getByText(/Next/i);
    fireEvent.click(nextButton);
    expect(mockOnNext).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Phone number is invalid');
  });

  test('does not call onNext if email is invalid', () => {
    render(
      <PersonalInfoForm
        data={{ firstName: 'John', lastName: 'Doe', email: 'invalid-email', phone: '123-456-7890' }}
        onChange={mockOnChange}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const nextButton = screen.getByText(/Next/i);
    fireEvent.click(nextButton);
    expect(mockOnNext).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Email is invalid');
  });
});
