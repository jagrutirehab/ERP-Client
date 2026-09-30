const ARRAY_AS_MULTIPLE = [
  "negativeHistory",
  "developmentDelayDetails",
  "orientation",
];

const convertToFormData = (values, customData = {}) => {
  const formData = new FormData();
  const data = Object.entries(values);

  data.forEach(([key, value]) => {
    if (Array.isArray(value) && ARRAY_AS_MULTIPLE.includes(key)) {
      value.forEach((item) => formData.append(key, item));
    } else {
      formData.append(key, value);
    }
  });

  const customDataEntries = Object.entries(customData);
  customDataEntries.forEach(([key, value]) => {
    if (Array.isArray(value) && ARRAY_AS_MULTIPLE.includes(key)) {
      value.forEach((item) => formData.append(key, item));
    } else {
      formData.append(key, value);
    }
  });

  return formData;
};

export default convertToFormData;
