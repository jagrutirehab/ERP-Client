import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { PDFViewer } from "@react-pdf/renderer";

//modal
import CustomModal from "../Common/Modal";
import { connect, useDispatch } from "react-redux";

//charts
import Charts from "./Charts";
import BulkCharts from "./BulkPrint/Chart";
import { togglePrint } from "../../store/actions";
import Bills from "./Bills";
import InternBills from "./Intern/index";
import RenderWhen from "../Common/RenderWhen";

const Print = ({
  modal,
  printData,
  patient,
  intern,
  admission,
  doctor,
  center,
  patientAdmissionsCharts,
}) => {
  const dispatch = useDispatch();

  const [vp, setVp] = useState(null);
  useEffect(() => {
    setVp(window.innerWidth);
  }, [vp]);

  const closePrint = () => {
    dispatch(togglePrint({ data: null, modal: false }));
  };

  let printAllCharts = [];
  if (printData?.printAdmissionCharts) {
    printAllCharts = patientAdmissionsCharts?.find(
      (adm) => adm._id === printData.printAdmissionCharts
    )?.charts;
  }

  console.log(printData, "printData <<<<<<<<<<<<<<<<<<<<");
  console.log(intern, "intern <<<<<<<<<<<<<<<<<<<<");

  return (
    <React.Fragment>
      <CustomModal
        className="overflow-auto text-center"
        isOpen={modal}
        toggle={closePrint}
        centered
        size={"xl"}
      >
        <PDFViewer width={vp > 1000 ? 1000 : 400} height={600}>
          <RenderWhen isTrue={patient ? true : false}>
            <RenderWhen isTrue={printData?.chart ? true : false}>
              <Charts
                charts={[printData]}
                center={printData?.center}
                patient={patient}
                admission={admission}
                doctor={doctor}
              />
            </RenderWhen>
            <RenderWhen isTrue={printData?.bill && patient ? true : false}>
              <Bills
                bill={printData}
                center={printData?.center}
                patient={patient}
                admission={admission}
              />
            </RenderWhen>
            <RenderWhen isTrue={printData?.bill && intern ? true : false}>
              <Bills
                bill={printData}
                center={printData?.center}
                intern={intern}
                admission={admission}
              />
            </RenderWhen>
            <RenderWhen isTrue={printData?.printAdmissionCharts ? true : false}>
              <BulkCharts
                admission={admission}
                charts={printAllCharts}
                patient={patient}
              />
            </RenderWhen>
          </RenderWhen>
          <RenderWhen isTrue={intern ? true : false}>
            <InternBills
              bill={printData}
              center={printData?.center}
              intern={intern}
            />
          </RenderWhen>
        </PDFViewer>
      </CustomModal>
    </React.Fragment>
  );
};

Print.prototype = {
  patient: PropTypes.object.isRequired,
  printData: PropTypes.object.isRequired,
  modal: PropTypes.bool.isRequired,
  doctor: PropTypes.object,
  center: PropTypes.object,
};

const mapStateToProps = (state) => ({
  patient: state.Print.patient,
  intern: state.Print.intern,
  printData: state.Print.data,
  admission: state.Print.admission,
  modal: state.Print.modal,
  doctor: state.Print.doctor,
  center: state.Print.center,
  patientAdmissionsCharts: state.Chart.data,
});

export default connect(mapStateToProps)(Print);
