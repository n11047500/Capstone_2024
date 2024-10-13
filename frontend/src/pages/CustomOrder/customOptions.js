import React, {useState} from 'react';

const CustomOptions = ({ data, onNext, onChange }) => {
  const options = [ 
    { name: 'Surfmist', color: '#E4E2D5' },
    { name: 'Domain', color: '#E8DBAE' },
    { name: 'Paperbark', color: '#CABFA4' },
    { name: 'Riversand', color: '#9D8D76' },
    { name: 'Jasper', color: '#6C6153' },
    { name: 'Bushland', color: '#848377' },
    { name: 'Pale Eucalypt', color: '#7C846A' },
    { name: 'Wilderness', color: '#64715E' },
    { name: 'Shale Grey', color: '#BDBFBA' },
    { name: 'Windspray', color: '#888B8A' },
    { name: 'Wallaby', color: '#7F7C78' },
    { name: 'Basalt', color: '#6D6C6E' },
    { name: 'Woodland Grey', color: '#4B4C46' },
    { name: 'Grey Ridge', color: '#4C5050' },
    { name: 'Ironstone', color: '#3E434C' },
    { name: 'Monument', color: '#323233' },
    { name: 'Satin Black', color: '#101820' },
    { name: 'Pearl White', color: '#F3F4F6' }
  ];


  const [selectedColor, setSelectedColor] = useState(data.color || '');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSelect = (option) => {
    setSelectedColor(option.name);
    setDropdownOpen(false); // Close dropdown after selection
    onChange({ ...data, color: option.name });
  };

  // Function to handle input field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  // Function to handle custom color type selection
  const handleColorTypeChange = (colorType) => {
    onChange({ ...data, colorType, color: '', customColor: '' });
  };


  const validateForm = () => {
    // Check if color type is selected
    if (!data.colorType) {
      alert('Please select a color type (Standard or Custom).');
      return false;
    }
  
    // Check if color is selected
    if (!selectedColor && data.colorType === 'standard') {
      alert('Please select a color.');
      return false;
    }
  
    // Check if custom color is provided when colorType is custom
    if (data.colorType === 'custom' && !data.customColor) {
      alert('Please enter a custom color.');
      return false;
    }
  
    // Check if width is provided and is > 0
    if (!data.width || data.width <= 0) {
      alert('Width must be greater than 0.');
      return false;
    }
  
    // Check if wicking option is selected (assuming wicking is a boolean)
    if (data.wicking === undefined || data.wicking === null) {
      alert('Please select whether you want wicking.');
      return false;
    }
  
    return true;
  };
  
  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };


  return (
    <div className="customised-order-form">
      <h2 className='custom-heading'>Personal Information</h2>
      <div className="form-custom-group">
        <label className='label-custom'>Select Colour:</label>
        <div className='custom-options'>
        {/* Standard Colours Option */}
        <div
          className={`custom-option ${data.colorType === 'standard' ? 'selected' : ''}`}
          onClick={() => handleColorTypeChange('standard')}
        >
          <label>Standard Ezee Colours</label>
        </div>

        {/* Custom Colour Option */}
        <div
          className={`custom-option ${data.colorType === 'custom' ? 'selected' : ''}`}
          onClick={() => handleColorTypeChange('custom')}
        >
          <label>Custom Colours</label>
        </div>
      </div>
      </div>

      <div className="form-custom-group">
        {data.colorType === 'standard' && (
          <div className="custom-dropdown">
            <div className="dropdown-selected" onClick={() => setDropdownOpen(!dropdownOpen)}>
              {selectedColor ? (
                <>
                  <span>{selectedColor}</span> {/* Display color name */}
                  <div className="color-selected" style={{ backgroundColor: options.find(o => o.name === selectedColor)?.color }} />
                </>
              ) : 'Select a color'}
            </div>

            {dropdownOpen && (
              <ul className="dropdown-options">
                {options.map((option) => (
                  <li key={option.name} onClick={() => handleSelect(option)} className="dropdown-option">                 
                    <span>{option.name}</span>
                    <div className="color-box" style={{ backgroundColor: option.color }} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {data.colorType === 'custom' && (
          <input
            type="text"
            name="customColor"
            value={data.customColor}
            placeholder="Enter Custom Color"
            onChange={handleInputChange}
            required
          />
        )}
      </div>

      <div className="form-custom-group">
        <label className='label-custom'>Width (cm):</label>
        <input
          type="number"
          name="width"
          value={data.width || ''} // Ensure it's controlled properly
          onChange={handleInputChange}
          placeholder="Enter width in cm"
          min="0"
          required // HTML5 validation
        />
    </div>

      <div className="form-custom-group">
      <label className='label-custom'>Wicking:</label>
        <div className='custom-options'> 
        {/* Wicking Yes Option */}
            <div
              className={`custom-option ${data.wicking === 'yes' ? 'selected' : ''}`}
              onClick={() => handleInputChange({ target: { name: 'wicking', value: 'yes' } })}
            >
              <label>Yes</label>
            </div>

            {/* Wicking No Option  */}
            <div
              className={`custom-option ${data.wicking === 'no' ? 'selected' : ''}`}
              onClick={() => handleInputChange({ target: { name: 'wicking', value: 'no' } })}
            >
              <label>No</label>
            </div>
          </div>
      </div>
      <button onClick={handleNext} className='next-custom-button'>Next</button>
    </div>
  );
}

export default CustomOptions;
