import React from "react";
import { useParams } from "react-router-dom";

const PatientDetails = () => {
  const { id } = useParams();
  return (
  <p>{id}</p>
  )
};

export default PatientDetails;
