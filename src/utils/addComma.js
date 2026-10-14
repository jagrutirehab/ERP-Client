// const addComma = (number) => {
//   return number.toLocaleString(undefined, {
//     maximumFractionDigits: 2,
//   });
// };

// export default addComma;

const addComma = (value) =>
  (Number(value) || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });

export default addComma;
