import React, { useEffect, useMemo, useState } from "react";
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
import ClinicalTest from "./clinicalTest";
// import { buildDischargeSummaryDoc } from "./Charts/DischargeSummaryV2/buildDischargeSummaryDoc";
// import { ensurePdfMakeFonts } from "./Charts/DischargeSummaryV2/pdfmakeFonts";
import { loadSignatureDataUrls } from "./Charts/DischargeSummaryV2/loadSignatureDataUrls";
import { DISCHARGE_SUMMARY, IPD } from "../constants/patient";

const Print = ({
  modal,
  printData,
  patient,
  intern,
  admission,
  doctor,
  clinicalTest,
  center,
  patientAdmissionsCharts,
  charts
}) => {
  const dispatch = useDispatch();

  const [vp, setVp] = useState(null);
  useEffect(() => {
    setVp(window.innerWidth);
  }, [vp]);

  const isMobile = useMediaQuery("(max-width: 640px)");
  const isDischargeSummary =
    printData?.chart === DISCHARGE_SUMMARY && printData?.type === IPD;

  const closePrint = () => {
    dispatch(togglePrint({ data: null, modal: false }));
  };

  let printAllCharts = [];
  if (printData?.printAdmissionCharts) {
    printAllCharts = patientAdmissionsCharts?.find(
      (adm) => adm._id === printData.printAdmissionCharts
    )?.charts;
  }

  const dischargeSummaryFileName = useMemo(
    () =>
      `${patient?.id?.value}-${(patient?.name || "patient").replace(
        /\s+/g,
        "_"
      )}-chart.pdf`,
    [patient]
  );

  const [dischargePdfUrl, setDischargePdfUrl] = useState(null);
  const [dischargeLoading, setDischargeLoading] = useState(false);

  // const buildDischargeDoc = async () => {
  //   const signatures = await loadSignatureDataUrls(patient);
  //   return buildDischargeSummaryDoc({
  //     chart: printData,
  //     patient,
  //     admission,
  //     center: printData?.center,
  //     signatures,
  //   });
  // };

  const buildDischargeDoc = async () => {
    const [{ buildDischargeSummaryDoc }, { ensurePdfMakeFonts }] =
      await Promise.all([
        import("./Charts/DischargeSummaryV2/buildDischargeSummaryDoc"),
        import("./Charts/DischargeSummaryV2/pdfmakeFonts"),
      ]);

    const signatures = await loadSignatureDataUrls(patient);

    return {
      doc: buildDischargeSummaryDoc({
        chart: printData,
        patient,
        admission,
        center: printData?.center,
        signatures,
      }),
      pdfMake: await ensurePdfMakeFonts(),
    };
  };

  useEffect(() => {
    let cancelled = false;
    const buildPreview = async () => {
      if (!isDischargeSummary) {
        setDischargePdfUrl(null);
        return;
      }
      setDischargeLoading(true);
      try {
        const { doc, pdfMake } = await buildDischargeDoc();
        pdfMake.createPdf(doc).getDataUrl((url) => {
          if (!cancelled) {
            setDischargePdfUrl(url);
            setDischargeLoading(false);
          }
        });
      } catch (err) {
        if (!cancelled) {
          setDischargeLoading(false);
        }
      }
    };
    buildPreview();
    return () => {
      cancelled = true;
    };
  }, [isDischargeSummary, printData, patient, admission]);

  const downloadDischargeSummary = async () => {
    if (!isDischargeSummary) return;
    const { doc, pdfMake } = await buildDischargeDoc();
    pdfMake.createPdf(doc).download(dischargeSummaryFileName);
  };

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
              <RenderWhen isTrue={isDischargeSummary}>
                <div className="mb-3 p-3 border rounded bg-light">
                  <p className="text-muted mb-3">
                    Preview not available, please download.
                  </p>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={downloadDischargeSummary}
                    disabled={dischargeLoading}
                  >
                    {dischargeLoading ? <Spinner size="sm" /> : "Download Discharge Summary"}
                  </button>
                </div>
              </RenderWhen>
              <RenderWhen
                isTrue={printData?.chart ? !isDischargeSummary : false}
              >
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
                    fileName={`${patient?.id?.value}-${(patient?.name || 'patient').replace(/\s+/g, '_')}-chart.pdf`}
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
                    fileName={`${patient?.id?.value}-${(patient?.name || 'patient').replace(/\s+/g, '_')}-bill.pdf`}
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
                    fileName={`${intern?.id?.value}-${(intern?.name || 'intern').replace(/\s+/g, '_')}-reciept.pdf`}
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
                    fileName={`${patient?.id?.value}-${(patient?.name || 'patient').replace(/\s+/g, '_')}-charts.pdf`}
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
                  fileName={`${intern?.id?.value}-${(intern?.name || 'intern').replace(/\s+/g, '_')}-reciept.pdf`}
                  className="btn btn-primary btn-sm"
                >
                  {({ loading }) =>
                    loading ? <Spinner size="sm" /> : 'Download'
                  }
                </PDFDownloadLink>
              </div>
            </RenderWhen>
            <RenderWhen isTrue={clinicalTest ? true : false}>
              <div className="mb-3 p-3 border rounded bg-light">
                <p className="text-muted mb-3">
                  Preview not available, please download.
                </p>
                <PDFDownloadLink
                  document={
                    <ClinicalTest
                      charts={charts}
                      clinicalTest={clinicalTest}
                    />
                  }
                  fileName={`${clinicalTest?.patientId?.id?.value}-${(clinicalTest?.patientId?.name || 'patient').replace(/\s+/g, '_')}-clinical_test.pdf`}
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
          <RenderWhen isTrue={isDischargeSummary}>
            {dischargeLoading ? (
              <Spinner />
            ) : (
              dischargePdfUrl && (
                <iframe
                  title="Discharge Summary Preview"
                  src={dischargePdfUrl}
                  width={vp > 1000 ? 1000 : 400}
                  height={600}
                  style={{ border: "none" }}
                  onLoad={() => setDischargeLoading(false)}
                />
              )
            )}
          </RenderWhen>
          <RenderWhen isTrue={!isDischargeSummary}>
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
              <RenderWhen isTrue={clinicalTest ? true : false}>
                <ClinicalTest
                  charts={charts}
                  clinicalTest={clinicalTest}
                />
              </RenderWhen>
            </PDFViewer>
          </RenderWhen>
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
  clinicalTest: state.Print.clinicalTest,
  charts: state.Chart.data[0]?.charts,
});

export default connect(mapStateToProps)(Print);
