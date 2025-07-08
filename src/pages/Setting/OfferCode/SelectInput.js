import { useState, useEffect } from 'react';
import Select from 'react-select';

const SearchableSelect = ({
  options = [],
  placeholder = 'Search...',
  onChange,
  isMulti = false,
  defaultValue,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    if (defaultValue) {
      if (isMulti) {
        setSelectedOption(options.filter(opt => defaultValue.includes(opt.value)));
      } else {
        setSelectedOption(options.find(opt => opt.value === defaultValue) || null);
      }
    }
  }, [defaultValue, options]);

  const handleInputChange = (newValue) => {
    setSearchTerm(newValue);
  };

  const handleChange = (selected) => {
    if (isMulti) {
      const values = selected ? selected.map(opt => opt.value) : [];
      onChange(values);
    } else {
      onChange(selected ? selected.value : null);
    }
    setSelectedOption(selected);
  };

  const handleSelectAll = () => {
    const allOptions = [...options];
    setSelectedOption(allOptions);
    onChange(allOptions.map(opt => opt.value));
  };

  const handleClearAll = () => {
    setSelectedOption(null);
    onChange([]);
  };

  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: '#F2F2F2',
      border: 'none',
      boxShadow: 'none',
    }),
    valueContainer: (provided) => ({
      ...provided,
        minHeight: '36px',
        maxHeight: '100px',
        overflowY: 'auto',
        flexWrap: 'wrap',
        padding: '0 10px',
    }),
    input: (provided) => ({
      ...provided,
      minHeight: '36px',
      margin: '0px',
      padding: '0px',
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor:'#F2F2F2',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#13c56b' : '#f0f0f0',
      color: state.isSelected ? 'white' : 'black',
      '&:hover': {
        backgroundColor: '#13c56b',
        color: 'white',
      },
    }),
  };

  return (
    <div>
      {isMulti && (
        <div className="d-flex justify-content-end mb-2" style={{ gap: '10px' }}>
          <button type="button" onClick={handleSelectAll} className="btn btn-sm btn-outline-primary">
            Select All
          </button>
          <button type="button" onClick={handleClearAll} className="btn btn-sm btn-outline-danger">
            Clear All
          </button> 
        </div>
      )}
      <Select
        options={options}
        onInputChange={handleInputChange}
        onChange={handleChange}
        placeholder={placeholder}
        isClearable
        styles={customStyles}
        isMulti={isMulti}
        value={selectedOption}
      />
    </div>
  );
};

export default SearchableSelect;
