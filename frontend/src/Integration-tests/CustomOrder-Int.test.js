import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes,  useLocation, Router } from 'react-router-dom';
import { CartProvider } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import CustomOptions from '../pages/CustomOrder/customOptions';
import PersonalInfoForm from '../pages/CustomOrder/personalInfo';
import AdditionalInformation from '../pages/CustomOrder/additionalInformation';
import OrderCustomisaton from '../pages/CustomOrder/orderCustom'; // Adjust the import based on your file structure
import { createMemoryHistory } from 'history';
import '@testing-library/jest-dom';

// Mock the useNavigate function
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));


describe('CustomOptions Component', () => {
  const mockOnChange = jest.fn();
  const mockOnNext = jest.fn();
  const mockOnBack = jest.fn(); // Add mock for onBack
  const data = {
    color: '',
    colorType: 'standard',
    customColor: '',
    wicking: '',
  };
  const options = [
    { name: 'Monument', color: '#323233' },
    { name: 'Satin Black', color: '#101820' },
    { name: 'Pearl White', color: '#F3F4F6' },
  ];


  test('should display standard colors dropdown and allow selecting a color', () => {
    render(<CustomOptions data={data} options={options} onChange={mockOnChange} onNext={mockOnNext} />);

    // Check that 'Select a color' is visible initially
    expect(screen.getByText('Select a color')).toBeInTheDocument();

    // Open the dropdown
    fireEvent.click(screen.getByText('Select a color'));

    // Select a color from the dropdown
    fireEvent.click(screen.getByText('Monument'));

    // Check if the selected color is displayed
    expect(screen.getByText('Monument')).toBeInTheDocument();

    // Verify if onChange is called with the correct data
    expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({ color: 'Monument' })); // Fixed 'cxpeolor' to 'color'
});



  test('should allow entering a custom color when custom color type is selected', () => {
    render(
      <CustomOptions
        data={{ ...data, colorType: 'custom' }}
        options={options}
        onChange={mockOnChange}
        onNext={mockOnNext}
      />
    );

    // Check that the input for custom color is rendered
    const customColorInput = screen.getByPlaceholderText('Enter Custom Color');
    expect(customColorInput).toBeInTheDocument();

    // Type a custom color
    fireEvent.change(customColorInput, { target: { value: 'Sky Blue' } });

    // Verify if onChange is called with the custom color
    expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({ customColor: 'Sky Blue' }));
  });

  test('should select "Yes" for wicking and trigger onChange', () => {
    const mockOnChange = jest.fn();
    const mockOnNext = jest.fn();
    const data = {
      color: '',
      wicking: 'No', // Default value
    };
  
    render(
      <CustomOptions
        data={data}
        onChange={mockOnChange}
        onNext={mockOnNext}
      />
    );
  
    // Simulate clicking the "Yes" div for wicking
    fireEvent.click(screen.getByText('Yes'));  // Use 'getByText' to find the "Yes" option
  
    // Verify if onChange is called with the correct argument
    expect(mockOnChange).toHaveBeenCalledWith({
      ...data,
      wicking: 'yes', // Updated value
    });
  });

  // Test: should load the next step (PersonalInfo) when "Next" is clicked from CustomOptions
  test('should load the next step (Personal Info) when "Next" is clicked from CustomOptions', () => {
    const { getByText } = render(
        <CustomOptions
            data={data}
            onNext={mockOnNext}
            onChange={mockOnChange}
        />
    );

    // Check if the 'Next' button is present
    const nextButton = getByText('Next');
    expect(nextButton).toBeInTheDocument(); // Ensure the button is rendered

    // Click the 'Next' button
    fireEvent.click(nextButton); // Click the button

    // Verify that handleNextStep (mockOnNext) is called to move to the next step
    expect(mockOnNext).toHaveBeenCalled();

    // Simulate rendering of the next component, for example, PersonalInfo
    const { getByPlaceholderText } = render(
        <PersonalInfoForm
            data={{ firstName: '', lastName: '', email: '', phone: '', address: '' }}
            onChange={mockOnChange}
            onBack={mockOnBack}
            onNext={mockOnNext}
        />
    );

    // Check if the heading of the next page (Personal Info) is displayed
    expect(getByPlaceholderText(/First Name/i)).toBeInTheDocument(); // Check for "First Name" input
  });
  
});

describe('PersonalInfo Component', () => {
  const mockOnChange = jest.fn();
  const mockOnNext = jest.fn();
  const mockOnBack = jest.fn();
  const data = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
  };

  test('should render the form inputs and allow typing first name, last name, email, phone, and address', () => {
    render(
      <PersonalInfoForm
        data={data}
        onChange={mockOnChange}
        onBack={mockOnBack}
        onNext={mockOnNext}
      />
    );

    // Check that all input fields are rendered
    const firstNameInput = screen.getByPlaceholderText('First Name');
    const lastNameInput = screen.getByPlaceholderText('Last Name');
    const emailInput = screen.getByPlaceholderText('Email');
    const phoneNumberInput = screen.getByPlaceholderText('Phone Number');
    const addressInput = screen.getByPlaceholderText('Address');

    expect(firstNameInput).toBeInTheDocument();
    expect(lastNameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(phoneNumberInput).toBeInTheDocument();
    expect(addressInput).toBeInTheDocument();

    // Simulate typing in the First Name field
    fireEvent.change(firstNameInput, { target: { name: 'firstName', value: 'John' } });
    expect(mockOnChange).toHaveBeenCalledWith({ ...data, firstName: 'John' });

    // Simulate typing in the Last Name field
    fireEvent.change(lastNameInput, { target: { name: 'lastName', value: 'Doe' } });
    expect(mockOnChange).toHaveBeenCalledWith({ ...data, lastName: 'Doe' });

    fireEvent.change(emailInput, { target: { name: 'email', value: 'john@gmail.com' } });
    expect(mockOnChange).toHaveBeenCalledWith({ ...data, email: 'john@gmail.com' });

    fireEvent.change(phoneNumberInput, { target: { name: 'phoneNumber', value: '123 456 789' } });
    expect(mockOnChange).toHaveBeenCalledWith({ ...data, phoneNumber: '123 456 789' });

    // Simulate typing in the Address field
    fireEvent.change(addressInput, { target: { name: 'address', value: '123 Main St' } });
    expect(mockOnChange).toHaveBeenCalledWith({ ...data, address: '123 Main St' });
  });
  
  
  test('should load the next step (Additional Information) when "Next" is clicked', () => {
    const { getByText } = render(
        <PersonalInfoForm
            data={data}
            onChange={mockOnChange}
            onBack={mockOnBack}
            onNext={mockOnNext}
        />
    );

    // Click the 'Next' button
    fireEvent.click(getByText('Next'));

    // Verify if onNext is called
    expect(mockOnNext).toHaveBeenCalled();

    // Simulate rendering of the next component, for example, Additional Information
    const { getByLabelText } = render(
        <AdditionalInformation
            data={data} // Pass the appropriate data
            onChange={mockOnChange}
            onBack={mockOnBack}
            onNext={mockOnNext}
        />
    );

    // Check if the heading of the next page (Additional Information) is displayed
    expect(getByLabelText(/Attachment/i)).toBeInTheDocument(); // Check for "Attachment" label
});


test('should load the previous step (Custom Options) when "Back" is clicked', () => {
  const { getByText } = render(
      <AdditionalInformation
          data={data}
          onChange={mockOnChange}
          onBack={mockOnBack}
          onNext={mockOnNext}
      />
  );

  // Click the 'Back' button
  fireEvent.click(getByText('Back'));

  // Verify if onBack is called
  expect(mockOnBack).toHaveBeenCalled();

  // Simulate rendering of the previous component, CustomOptions, after the 'Back' button is clicked
  const { getByPlaceholderText } = render(
      <CustomOptions
          data={data} // Pass the appropriate data
          onChange={mockOnChange}
          onNext={mockOnNext}
      />
  );

  // Check if the Custom Options page is displayed by verifying an element unique to this page
  expect(getByPlaceholderText(/Width/i)).toBeInTheDocument(); // Ensure "Width" input is present
});

  describe('AdditionalInformation Component', () => {
    const mockOnChange = jest.fn();
    const mockOnBack = jest.fn();
    const mockOnSubmit = jest.fn();
    const mockNavigate = useNavigate();
  
    const data = {
      comment: '',
      file: null,
    };
    
    test('should render the form elements correctly', () => {
      render(
        <AdditionalInformation
          data={data}
          onBack={mockOnBack}
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
        />,
        { wrapper: MemoryRouter }
      );
  
      // Verify if all form elements are present
      expect(screen.getByLabelText(/comments/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/attach a file/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submit form/i })).toBeInTheDocument();
    });
  
    test('should allow typing in the comments textarea', () => {
      render(
        <AdditionalInformation
          data={data}
          onBack={mockOnBack}
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
        />,
        { wrapper: MemoryRouter }
      );
  
      // Type in the comments textarea
      const commentTextarea = screen.getByLabelText(/comments/i);
      fireEvent.change(commentTextarea, { target: { value: 'This is a test comment' } });
  
      // Check if onChange is called with the correct value
      expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({ comment: 'This is a test comment' }));
    });
  
    test('should handle file upload correctly', () => {
      render(
        <AdditionalInformation
          data={data}
          onBack={mockOnBack}
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
        />,
        { wrapper: MemoryRouter }
      );
    
      // Simulate file upload
      const fileInput = screen.getByLabelText(/upload a file/i); // Target by aria-label
      const file = new File(['sample file'], 'sample.pdf', { type: 'application/pdf' });
      fireEvent.change(fileInput, { target: { files: [file] } });
    
      // Check if onChange is called with the correct file data
      expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({ file: file }));
    });

    test('should load the previous step (Personal Info) when "Back" is clicked', async () => {
      // Render the AdditionalInformation component
      const { getByText } = render(
        <AdditionalInformation
          data={data}
          onChange={mockOnChange}
          onBack={mockOnBack}
          onNext={mockOnNext}
        />
      );
    
      // Click the 'Back' button
      fireEvent.click(getByText('Back'));
    
      // Verify if onBack is called
      expect(mockOnBack).toHaveBeenCalled();
    
      // Simulate rendering of the previous component, PersonalInfoForm
      const { getByPlaceholderText } = render(
        <PersonalInfoForm
          data={{ firstName: '', lastName: '', email: '', phone: '', address: '' }} // Make sure the data structure matches
          onChange={mockOnChange}
          onNext={mockOnNext}
          step={1} // Ensure you're simulating the correct step
        />
      );
    
      // Use waitFor to ensure that the input field is rendered
      await waitFor(() => {
        expect(getByPlaceholderText('First Name')).toBeInTheDocument();
      });
    });
  
    
    test('should show an alert on form submission', async () => {
      // Mock the fetch API response to simulate a successful form submission
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
        })
      );
    
      // Mock window.alert to simulate user pressing 'OK'
      window.alert = jest.fn();
    
      // Create mock form data
      const mockFormData = {
        comment: 'Test comment',
        file: new File(['test file'], 'test.pdf', { type: 'application/pdf' }),
      };
    
      // Render the component
      render(
        <AdditionalInformation
          data={mockFormData}
          onBack={jest.fn()}
          onChange={jest.fn()}
          onSubmit={jest.fn()} // Ensure onSubmit is passed to avoid issues
        />
      );
    
      // Simulate filling out the form
      fireEvent.change(screen.getByLabelText(/comments/i), { target: { value: 'Test comment' } });
      fireEvent.change(screen.getByLabelText(/attach a file/i), {
        target: { files: [new File(['test file'], 'test.pdf', { type: 'application/pdf' })] },
      });
    
      // Simulate form submission
      fireEvent.click(screen.getByRole('button', { name: /submit form/i }));
    
      // Ensure fetch was called
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });
    
      // Wait for the alert to be shown after submission
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Email sent successfully!');
      });
    
      // Ensure the alert has been called
      expect(window.alert).toHaveBeenCalledTimes(1);
    });
    
  });
});

