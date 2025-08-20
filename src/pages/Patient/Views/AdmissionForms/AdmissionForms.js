import { useForm } from "react-hook-form";
import Page1 from "./page1";
import Page2 from "./page2";
import SeriousnessConsent from "./SeriousnessConsent";
import MediactionConcent from "./MediactionConcent";
import Admissionpage1 from "./Admissionpage1";
import Admissionpage2 from "./Admissionpage2";
import IndependentAdmAdult from "./IndependentAdmAdult";
import IndependentAdmMinor from "./IndependentAdmMinor";
import AdmWithHighSupport from "./AdmWithHighSupport";
import DischargeIndependentAdult from "./DischargeIndependentAdult";
import DischargeIndependentMinor from "./DischargeIndependentMinor";
import IndipendentOpinion1 from "./IndipendentOpinion1";
import IndipendentOpinion2 from "./IndipendentOpinion2";

const AddmissionForms = () => {
  const { register, handleSubmit } = useForm();

  const onSubmit = (data) => {
    console.log("Full form data:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Page1 register={register} />
      <Page2 register={register} />
      <SeriousnessConsent register={register} />
      <MediactionConcent register={register} />
      <Admissionpage1 register={register} />
      <Admissionpage2 register={register} />
      <IndependentAdmAdult register={register} />
      <IndependentAdmMinor register={register} />
      <AdmWithHighSupport register={register} />
      <DischargeIndependentAdult register={register} />
      <DischargeIndependentMinor register={register} />
      <IndipendentOpinion1 register={register} />
      <IndipendentOpinion2 register={register} />
      <div style={{ textAlign: "center", margin: "20px" }}>
        <button type="submit">Submit All</button>
      </div>
    </form>
  );
};

export default AddmissionForms;
