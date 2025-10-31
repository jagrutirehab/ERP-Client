import { useState } from "react";
import {
    Card,
    CardBody,
    CardTitle,
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Badge,
    Row,
    Col
} from "reactstrap";
import { UserRound, Brain, Calendar, X, CheckCheck } from "lucide-react";
import PrescriptionForm from "./PrescriptionForm";
import { toast } from "react-toastify";
import { format } from "date-fns";

const PatientList = ({ patients, type }) => {
    const [modal, setModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);

    const handleCardClick = (patient) => {
        setSelectedPatient(patient);
        setModal(true);
    };

    const handleApprove = () => {
        toast.success("medicines approved successfully");
        setModal(false);
    };

    const handleReject = () => {
        toast.success("medicines rejected successfully");
        setModal(false);
    };

    return (
        <>
            <Row className="g-3">
                {patients.map((p) => (
                    <Col xs={12} sm={6} lg={4} key={p.id} className="d-flex">
                        <Card
                            className="cursor-pointer w-100 transition-all"
                            style={{
                                backgroundColor: "#f8fafc",
                                border: "1px solid #000",
                                borderRadius: "0.25rem",
                                overflow: "hidden",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                                transition: "all 0.25s ease",
                            }}
                            onClick={() => handleCardClick(p)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-3px)";
                                e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.1)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.05)";
                            }}
                        >
                            <CardBody className="d-flex flex-column h-100 p-4">
                                {/* Header */}
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div>
                                        <CardTitle
                                            tag="h5"
                                            className="fw-semibold text-dark mb-1 text-truncate"
                                            style={{ fontSize: "1.15rem" }}
                                        >
                                            {p.name}
                                        </CardTitle>
                                        <small className="text-muted">Patient ID: {p.id}</small>
                                    </div>

                                    {p.center && (
                                        <Badge
                                            color="secondary"
                                            pill
                                            className="flex-shrink-0 text-uppercase fw-semibold"
                                            style={{
                                                fontSize: "0.7rem",
                                                letterSpacing: "0.5px",
                                                backgroundColor: "#334155", // slate-700
                                                color: "white",
                                            }}
                                        >
                                            {p.center.title}
                                        </Badge>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex-grow-1">
                                    {p.doctorName && (
                                        <div className="d-flex align-items-center mb-2">
                                            <UserRound className="me-2 text-primary" size={16} />
                                            <div>
                                                <small className="text-muted d-block">Doctor</small>
                                                <span className="fw-medium text-dark">{p.doctorName}</span>
                                            </div>
                                        </div>
                                    )}

                                    {p.psychologistName && (
                                        <div className="d-flex align-items-center mb-2">
                                            <Brain className="me-2 text-warning" size={16} />
                                            <div>
                                                <small className="text-muted d-block">Psychologist</small>
                                                <span className="fw-medium text-dark">
                                                    {p.psychologistName}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="mt-auto pt-3 border-top border-dark-subtle">
                                    <div className="d-flex align-items-center text-muted">
                                        <Calendar className="me-2" size={14} />
                                        <small>Created on&nbsp;</small>
                                        <small className="fw-semibold text-dark">
                                            {format(new Date(p.prescriptionStartDate), "dd MMM yyyy, hh:mm a")}
                                        </small>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                ))}
            </Row>



            <Modal
                isOpen={modal}
                toggle={() => setModal(!modal)}
                size="xl"
                centered
            >
                <ModalHeader toggle={() => setModal(!modal)} className="border-bottom-2">
                    <div>
                        <div className="fw-bold text-dark fs-5">
                            {selectedPatient?.name}
                        </div>
                        {selectedPatient?.centerName && (
                            <div className="text-muted fs-6 mt-1">
                                {selectedPatient.centerName}
                            </div>
                        )}
                    </div>
                </ModalHeader>
                <ModalBody className="bg-light">
                    <PrescriptionForm
                        data={selectedPatient?.prescription}
                        startDate={selectedPatient?.prescriptionStartDate}
                        endDate={selectedPatient?.prescriptionEndDate}
                    />
                </ModalBody>
                <ModalFooter className="border-top-2">
                    <Button
                        color="danger"
                        onClick={handleReject}
                        className="d-flex align-items-center justify-content-center text-white"
                    >
                        <X size={14} className="me-1" />
                        Reject
                    </Button>
                    <Button
                        color="success"
                        onClick={handleApprove}
                        className="d-flex align-items-center justify-content-center text-white"
                    >
                        <CheckCheck size={14} className="me-1" />
                        Approve
                    </Button>
                </ModalFooter>
            </Modal>
        </>
    );
};

export default PatientList;