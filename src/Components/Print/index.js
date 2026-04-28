import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { PDFViewer, PDFDownloadLink, pdf } from "@react-pdf/renderer";
import _ from "lodash";

//modal
import CustomModal from "../Common/Modal";
import { connect, useDispatch } from "react-redux";

//charts
import Charts from "./Charts";
import BulkCharts from "./BulkPrint/Chart";
import BatchSelector from "./BulkPrint/BatchSelector";
import { togglePrint } from "../../store/actions";
import Bills from "./Bills";
import InternBills from "./Intern/index";
import RenderWhen from "../Common/RenderWhen";
import { useMediaQuery } from "../Hooks/useMediaQuery";
import { Spinner, Button } from "reactstrap";
import ClinicalTest from "./clinicalTest";
import PDFErrorBoundary from "./PDFErrorBoundary";

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
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState("");
  const [failedBatches, setFailedBatches] = useState([]);

  useEffect(() => {
    setVp(window.innerWidth);
  }, [vp]);

  useEffect(() => {
    if (!modal) {
      setSelectedBatch(null);
    }
  }, [modal]);

  const isMobile = useMediaQuery("(max-width: 640px)");

  const closePrint = () => {
    dispatch(togglePrint({ data: null, modal: false }));
  };

  const handleBatchSelect = (batch) => {
    setSelectedBatch(batch);
  };

  const handleBackToBatchSelector = () => {
    setSelectedBatch(null);
  };

  // Never put more than this many charts in a single downloaded PDF
  const MAX_DOWNLOAD_CHUNK_SIZE = 50;
  // After every GROUP_SIZE downloads, take a long GC recovery pause
  const GROUP_SIZE = 5;
  const RECOVERY_DELAY = 10000; // 10s — lets GC fully reclaim heap
  const BETWEEN_DELAY = 3000;   // 3s between individual downloads

  const handleDownloadAll = async (batches, startBatchNum = 1) => {
    setDownloadingAll(true);
    setFailedBatches([]);
    const failed = [];

    const displayChunkSize = batches[0]?.length || MAX_DOWNLOAD_CHUNK_SIZE;
    const effectiveSize = Math.min(MAX_DOWNLOAD_CHUNK_SIZE, displayChunkSize);
    const downloadBatches = effectiveSize < displayChunkSize
      ? _.chunk(batches.flat(), effectiveSize)
      : batches;

    const downloadBlob = async (charts, index) => {
      const blob = await pdf(
        <BulkCharts admission={admission} charts={charts} patient={patient} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${patient?.id?.value}-${(patient?.name || "patient").replace(/\s+/g, "_")}-charts-batch-${startBatchNum + index}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    };

    for (let i = 0; i < downloadBatches.length; i++) {
      setDownloadProgress(`Downloading batch ${i + 1} of ${downloadBatches.length}...`);
      let success = false;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          if (attempt > 0) {
            setDownloadProgress(`Retrying batch ${i + 1} of ${downloadBatches.length}...`);
            await new Promise((resolve) => setTimeout(resolve, 6000));
          }
          await downloadBlob(downloadBatches[i], i);
          success = true;
          break;
        } catch (err) {
          console.error(`Batch ${i + 1} attempt ${attempt + 1} failed:`, err);
        }
      }
      if (!success) failed.push(i + 1);

      if (i < downloadBatches.length - 1) {
        const isGroupBoundary = (i + 1) % GROUP_SIZE === 0;
        if (isGroupBoundary) {
          setDownloadProgress(`Recovering memory... (${i + 1}/${downloadBatches.length} done)`);
          await new Promise((resolve) => setTimeout(resolve, RECOVERY_DELAY));
        } else {
          await new Promise((resolve) => setTimeout(resolve, BETWEEN_DELAY));
        }
      }
    }

    setDownloadingAll(false);
    setFailedBatches(failed);
    setDownloadProgress(failed.length > 0 ? `Done. Failed batches: ${failed.join(", ")}` : "");
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
                <RenderWhen isTrue={selectedBatch !== null ? true : false}>
                  <div style={{ textAlign: "left", marginBottom: "15px" }}>
                    <Button
                      size="sm"
                      outline
                      onClick={handleBackToBatchSelector}
                    >
                      ← Back
                    </Button>
                  </div>
                </RenderWhen>
                <RenderWhen isTrue={selectedBatch === null ? true : false}>
                  <BatchSelector
                    charts={printAllCharts}
                    onSelect={handleBatchSelect}
                    onDownloadAll={handleDownloadAll}
                    downloadingAll={downloadingAll}
                    downloadProgress={downloadProgress}
                    failedBatches={failedBatches}
                  />
                </RenderWhen>
                <RenderWhen isTrue={selectedBatch !== null ? true : false}>
                  <div className="mb-3 p-3 border rounded bg-light">
                    <p className="text-muted mb-3">
                      Preview not available, please download.
                    </p>
                    <div className="d-flex gap-2 justify-content-center">
                      <PDFDownloadLink
                        document={
                          <BulkCharts
                            admission={admission}
                            charts={selectedBatch}
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
                  </div>
                </RenderWhen>
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
          <RenderWhen isTrue={printData?.printAdmissionCharts && selectedBatch !== null ? true : false}>
            <div style={{ textAlign: "left", marginBottom: "15px" }}>
              <Button
                size="sm"
                outline
                onClick={handleBackToBatchSelector}
              >
                ← Back to Batch Selection
              </Button>
            </div>
          </RenderWhen>
          <RenderWhen isTrue={printData?.printAdmissionCharts && selectedBatch === null ? true : false}>
            <BatchSelector
              charts={printAllCharts}
              onSelect={handleBatchSelect}
              onDownloadAll={handleDownloadAll}
              downloadingAll={downloadingAll}
              downloadProgress={downloadProgress}
              failedBatches={failedBatches}
            />
          </RenderWhen>
          <RenderWhen isTrue={!(printData?.printAdmissionCharts && selectedBatch === null) ? true : false}>
            <PDFErrorBoundary>
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
                  <RenderWhen isTrue={printData?.printAdmissionCharts && selectedBatch !== null ? true : false}>
                    <BulkCharts
                      admission={admission}
                      charts={selectedBatch}
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
            </PDFErrorBoundary>
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
