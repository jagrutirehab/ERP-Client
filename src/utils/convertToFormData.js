const convertToFormData = (values, customData = {}) => {
  const formData = new FormData();
  const data = Object.entries(values);

  data.forEach((entry) => {
    formData.append(entry[0], entry[1]);
  });

  // Append custom data
  const customDataEntries = Object.entries(customData);
  customDataEntries.forEach((entry) => {
    formData.append(entry[0], entry[1]);
  });

  return formData;
};

export default convertToFormData;
