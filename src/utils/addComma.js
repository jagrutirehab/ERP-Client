const addComma = (number) => {
  return number.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
};

export default addComma;
