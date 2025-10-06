import { useEffect, useRef, useState } from "react";
import { connect, useDispatch } from "react-redux";
import {
  Button,
  Form,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
  Col,
  Spinner,
} from "reactstrap";
import PropTypes from "prop-types";
import Select from "react-select";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import dayjs from "dayjs";

import GeneralCard from "../../Patient/Views/Components/GeneralCard";
import CertificateTemplate from "./Components/CertificateTemplate";
import { editInternForm, fetchDoctors } from "../../../store/actions";
import { useParams } from "react-router-dom";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";

const Certificate = ({ intern, psychologists }) => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [modal, setModal] = useState(false);
  const [selectedPsychologist, setSelectedPsychologist] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [certificateType, setCertificateType] = useState("");

  const certificateRef = useRef(null);
  const isMobile = useMediaQuery("(max-width: 640px)");

  useEffect(() => {
    dispatch(fetchDoctors({ center: intern.center._id }));
  }, [id, dispatch, intern.center._id]);

  const needsRegeneration = (cert, type) => {
    if (!cert) return true;
    if (cert.certificateType !== type) return true;
    if (!cert.url) return true;

    if (cert.uploadedAt && intern.updatedAt) {
      const certDate = dayjs(cert.uploadedAt);
      const updateDate = dayjs(intern.updatedAt);

      return certDate.add(2, "second").isBefore(updateDate);
    }

    return false;
  };

  const handler = async (type) => {
    if (!type) return;
    setCertificateType(type);

    if (!intern.psychologist) {
      setModal(true);
      return;
    }

    const cert = intern.certificate;

    if (!needsRegeneration(cert, type)) {
      downloadPDF(cert.url);
      return;
    }

    await generateAndDownloadCertificate(type);
  };

  const handleSavePsychologist = async () => {
    if (!selectedPsychologist) return;
    setLoading(true);

    try {
      const { pdfBlob, fileName } = await generateCertificate(certificateType);

      downloadPDF(URL.createObjectURL(pdfBlob));

      const formData = new FormData();
      formData.append("psychologist", selectedPsychologist.value);
      formData.append("certificateType", certificateType);
      formData.append(
        "certificate",
        new File([pdfBlob], fileName, {
          type: "application/pdf",
        })
      );

      await dispatch(editInternForm({ id: intern._id, formData })).unwrap();

      setModal(false);
    } catch (err) {
      console.error("Error processing certificate:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateAndDownloadCertificate = async (type) => {
    try {
      setIsGenerating(true);
      const { pdfBlob, fileName } = await generateCertificate(type);

      downloadPDF(URL.createObjectURL(pdfBlob));

      const formData = new FormData();
      formData.append("certificateType", type);
      formData.append(
        "certificate",
        new File([pdfBlob], fileName, {
          type: "application/pdf",
        })
      );

      await dispatch(editInternForm({ id: intern._id, formData })).unwrap();
    } catch (err) {
      console.error("Certificate generation failed:", err);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCertificate = async (type) => {
    if (!certificateRef.current)
      throw new Error("Certificate ref not available");

    await new Promise((resolve) => setTimeout(resolve, 200));

    const canvas = await html2canvas(certificateRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

    const pdfBlob = pdf.output("blob");
    const fileName = `${intern.id.value}-${intern.name}-certificate.pdf`;

    return { pdfBlob, fileName };
  };

  const downloadPDF = async (url, fileName) => {
    if (isMobile) {
      window.open(url, "_blank");
    } else {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${intern.id.value}-${intern.name}-certificate.pdf`;
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 100);
    }
  };


  return (
    <>
      <div style={{ marginTop: "4rem" }}>
        <Row className="timeline-right row-gap-5">
          <GeneralCard data="Intern Certificate">
            <div className="d-flex flex-column align-items-center gap-3">
              <Button
                onClick={() => handler("ONGOING")}
                color="primary"
                size="sm"
                outline
                disabled={
                  isGenerating || loading || intern.internStatus === "completed"
                }
              >
                {isGenerating && certificateType === "ONGOING" ? (
                  <>
                    <Spinner color="primary" size="sm" className="me-2" />
                    Download Ongoing Certificate
                  </>
                ) : (
                  "Download Ongoing Certificate"
                )}
              </Button>
              <Button
                onClick={() => handler("COMPLETED")}
                color="primary"
                size="sm"
                outline
                disabled={
                  intern.internStatus !== "completed" || isGenerating || loading
                }
              >
                {isGenerating && certificateType === "COMPLETED" ? (
                  <>
                    <Spinner color="primary" size="sm" className="me-2" />
                    Download Completion Certificate
                  </>
                ) : (
                  "Download Completion Certificate"
                )}
              </Button>
            </div>
          </GeneralCard>
        </Row>

        <div
          ref={certificateRef}
          style={{
            width: 794,
            height: 1123,
            position: "absolute",
            left: "-9999px",
            top: 0,
            backgroundColor: "white",
          }}
        >
          <CertificateTemplate
            type={certificateType}
            intern={intern}
            psychologist={
              selectedPsychologist
                ? psychologists.find(
                  (p) => p._id === selectedPsychologist.value
                )
                : intern.psychologist
            }
          />
        </div>
      </div>

      <Modal isOpen={modal} toggle={() => setModal(!modal)}>
        <ModalHeader toggle={() => setModal(!modal)}>
          Assign Supervisor
        </ModalHeader>
        <ModalBody>
          <Form>
            <Row>
              <Col md={12} className="mb-3">
                <Label>Psychologist</Label>
                <Select
                  value={selectedPsychologist}
                  onChange={setSelectedPsychologist}
                  options={[
                    { value: "", label: "Choose here", isDisabled: true },
                    ...(psychologists?.map((psych) => ({
                      value: psych._id,
                      label: psych.name,
                    })) || []),
                  ]}
                  placeholder="Select psychologist"
                  isLoading={!psychologists?.length}
                />
              </Col>
            </Row>
            <div className="text-end mt-3">
              <Button
                color="secondary"
                className="me-2"
                onClick={() => setModal(false)}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                onClick={handleSavePsychologist}
                disabled={loading || !selectedPsychologist}
              >
                {loading ? (
                  <Spinner color="light" size="sm">
                    Loading...
                  </Spinner>
                ) : (
                  "Save & Generate Certificate"
                )}
              </Button>
            </div>
          </Form>
        </ModalBody>
      </Modal>
    </>
  );
};

Certificate.propTypes = {
  intern: PropTypes.object,
  psychologists: PropTypes.array,
};

const mapStateToProps = (state) => ({
  intern: state.Intern.intern,
  psychologists: state.User?.counsellors,
});

export default connect(mapStateToProps)(Certificate);
