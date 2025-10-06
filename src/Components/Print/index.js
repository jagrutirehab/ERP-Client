import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";

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
import { useMediaQuery } from "../Hooks/useMediaQuery";
import { Spinner } from "reactstrap";

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

  const isMobile = useMediaQuery("(max-width: 640px)");

  const closePrint = () => {
    dispatch(togglePrint({ data: null, modal: false }));
  };

  let printAllCharts = [];
  if (printData?.printAdmissionCharts) {
    printAllCharts = patientAdmissionsCharts?.find(
      (adm) => adm._id === printData.printAdmissionCharts
    )?.charts;
  }

  return (
    <React.Fragment>
      <CustomModal
        className="overflow-auto text-center"
        isOpen={modal}
        toggle={closePrint}
        centered
        size={"xl"}
      >

        <RenderWhen isTrue={isMobile}>
          <div className="text-center">
            <RenderWhen isTrue={patient ? true : false}>
              <RenderWhen isTrue={printData?.chart ? true : false}>
                <div className="mb-3 p-3 border rounded bg-light">
                  <p className="text-muted mb-3">
                    Preview not available, please download.
                  </p>
                  <PDFDownloadLink
                    document={
                      <Charts
                        charts={[printData]}
                        center={printData?.center}
                        patient={patient}
                        admission={admission}
                        doctor={doctor}
                      />
                    }
                    fileName={`${patient?.name || 'chart'}.pdf`}
                    className="btn btn-primary btn-sm"
                  >
                    {({ loading }) =>
                      loading ? <Spinner size="sm" /> : 'Download'
                    }
                  </PDFDownloadLink>
                </div>
              </RenderWhen>

              <RenderWhen isTrue={printData?.bill ? true : false}>
                <div className="mb-3 p-3 border rounded bg-light">
                  <p className="text-muted mb-3">
                    Preview not available, please download.
                  </p>
                  <PDFDownloadLink
                    document={
                      <Bills
                        bill={printData}
                        center={printData?.center}
                        patient={patient}
                        admission={admission}
                      />
                    }
                    fileName={`${patient?.name || 'bill'}.pdf`}
                    className="btn btn-primary btn-sm"
                  >
                    {({ loading }) =>
                      loading ? <Spinner size="sm" /> : 'Download'
                    }
                  </PDFDownloadLink>
                </div>
              </RenderWhen>

              <RenderWhen isTrue={printData?.bill && intern ? true : false}>
                <div className="mb-3 p-3 border rounded bg-light">
                  <p className="text-muted mb-3">
                    Preview not available, please download.
                  </p>
                  <PDFDownloadLink
                    document={
                      <Bills
                        bill={printData}
                        center={printData?.center}
                        intern={intern}
                        admission={admission}
                      />
                    }
                    fileName={`${intern?.name || 'intern_bill'}.pdf`}
                    className="btn btn-primary btn-sm"
                  >
                    {({ loading }) =>
                      loading ? <Spinner size="sm" /> : 'Download'
                    }
                  </PDFDownloadLink>
                </div>
              </RenderWhen>

              <RenderWhen isTrue={printData?.printAdmissionCharts ? true : false}>
                <div className="mb-3 p-3 border rounded bg-light">
                  <p className="text-muted mb-3">
                    Preview not available, please download.
                  </p>
                  <PDFDownloadLink
                    document={
                      <BulkCharts
                        admission={admission}
                        charts={printAllCharts}
                        patient={patient}
                      />
                    }
                    fileName={`${patient?.name || 'charts'}.pdf`}
                    className="btn btn-primary btn-sm"
                  >
                    {({ loading }) =>
                      loading ? <Spinner size="sm" /> : 'Download'
                    }
                  </PDFDownloadLink>
                </div>
              </RenderWhen>
            </RenderWhen>

            <RenderWhen isTrue={intern ? true : false}>
              <div className="mb-3 p-3 border rounded bg-light">
                <p className="text-muted mb-3">
                  Preview not available, please download.
                </p>
                <PDFDownloadLink
                  document={
                    <InternBills
                      bill={printData}
                      center={printData?.center}
                      intern={intern}
                    />
                  }
                  fileName={`${intern?.name || 'intern_bill'}.pdf`}
                  className="btn btn-primary btn-sm"
                >
                  {({ loading }) =>
                    loading ? <Spinner size="sm" /> : 'Download'
                  }
                </PDFDownloadLink>
              </div>
            </RenderWhen>
          </div>
        </RenderWhen>
        <RenderWhen isTrue={!isMobile}>
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
        </RenderWhen>

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
