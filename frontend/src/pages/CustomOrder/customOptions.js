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


  return (
    <div className="customised-order-form">
      <h2>Custom Options</h2>
      <div className="form-custom-group">
        <label className='label-custom'>Select Colour:</label><br />
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
          value={data.width}
          onChange={handleInputChange}
          placeholder="Enter width in cm"
          min="0"
        />
      </div>

      <div className="form-custom-group">
        <label className='label-custom'>Wicking:</label><br />
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
      <button onClick={onNext} className='next-custom-button'>Next</button>
    </div>
  );
}

export default CustomOptions;
