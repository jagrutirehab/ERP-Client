import { useState } from "react";
import { connect, useDispatch } from "react-redux";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Nav,
  NavItem,
  NavLink,
} from "reactstrap";
import { Check } from "lucide-react";
import { markUnreadAlert } from "../../../../store/features/nurse/nurseSlice";
import { useParams } from "react-router-dom";

const InfoModal = ({
  patientId,
  title,
  show,
  onCloseClick,
  content = [],
  modalLoading,
}) => {

  const [activeTab, setActiveTab] = useState("medicine");
  const dispatch = useDispatch();
  const medicineAlerts = content.filter(
    (item) => item.type === "medicine" || item.flag === "other"
  );
  const testAlerts = content.filter((item) => item.type === "test");
  const otherAlerts = content.filter((item) => item.flag === "other");

  const getSeverityColor = (flag) => {
    switch (flag) {
      case "urgent":
        return "#dc3545";
      case "attention":
        return "#fd7e14";
      default:
        return "#808080";
    }
  };

  const handleMarkAlertAsRead = (alertType) => {
    dispatch(markUnreadAlert({ alertType, patientId }));
  };

  return (
    <>
      <Modal
        isOpen={show}
        toggle={onCloseClick}
        centered
        size="md"
        className="info-modal"
      >
        <ModalHeader toggle={onCloseClick} className="border-0 bg-light">
          <h5 className="mb-0 fw-semibold text-dark">{title}</h5>
        </ModalHeader>

        <Nav tabs className="px-3 pt-2 bg-light">
          <NavItem>
            <NavLink
              active={activeTab === "medicine"}
              onClick={() => setActiveTab("medicine")}
              style={{ cursor: "pointer" }}
            >
              Activities ({medicineAlerts.length})
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              active={activeTab === "test"}
              onClick={() => setActiveTab("test")}
              style={{ cursor: "pointer" }}
            >
              Tests ({testAlerts.length})
            </NavLink>
          </NavItem>
        </Nav>

        {modalLoading ? (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: "200px" }}
          >
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <ModalBody
            className="px-3"
            style={{ maxHeight: "60vh", overflowY: "auto" }}
          >
            {activeTab === "medicine" ? (
              medicineAlerts.length > 0 ? (
                <div className="d-flex flex-column">
                  {medicineAlerts.map((item, index) => (
                    <Card
                      key={index}
                      className="border-0"
                      style={{
                        backgroundColor: "#f8f9fa",
                        borderRadius: "4px",
                        marginBottom: "5px",
                      }}
                    >
                      <CardBody
                        className="d-flex align-items-center"
                        style={{ padding: "10px", gap: "8px" }}
                      >
                        <span
                          style={{
                            width: "6px",
                            height: "6px",
                            backgroundColor: getSeverityColor(item.flag),
                            borderRadius: "50%",
                            flexShrink: 0,
                          }}
                        />
                        <div style={{ flexGrow: 1 }}>
                          <small
                            style={{
                              color: getSeverityColor(item.flag),
                              fontWeight: "600",
                              fontSize: "0.75rem",
                            }}
                          >
                            {item.flag === "other"
                              ? item.type.toUpperCase()
                              : "ACTIVITY"}
                          </small>
                          <p
                            className="mb-0 lh-sm text-dark"
                            style={{ fontSize: "0.85rem" }}
                          >
                            {item.message}
                          </p>
                        </div>
                        {item.type === "prescription-update" || item.type==="medicine-missed" && (
                          <Check
                            size={18}
                            color="#28a745"
                            style={{ cursor: "pointer", flexShrink: 0 }}
                            onClick={() => handleMarkAlertAsRead(item.type)}
                          />
                        )}
                      </CardBody>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">No activity alerts</div>
              )
            ) : testAlerts.length > 0 ? (
              <div className="d-flex flex-column">
                {testAlerts.map((item, index) => (
                  <Card
                    key={index}
                    className="border-0 bg-light"
                    style={{ borderRadius: "4px", marginBottom: "5px" }}
                  >
                    <CardBody
                      style={{
                        padding: "10px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          backgroundColor: getSeverityColor("attention"),
                          borderRadius: "50%",
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flexGrow: 1 }}>
                        <small style={{ color: getSeverityColor("attention") }}>
                          ATTENTION
                        </small>
                        <p
                          className="mb-0 text-dark"
                          style={{ fontSize: "0.9rem" }}
                        >
                          {item.message}
                        </p>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">No test alerts</div>
            )}
          </ModalBody>
        )}
      </Modal>

      <style>{`
        .info-modal .modal-content {
          border: none;
          box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.175);
          border-radius: 8px;
          overflow: hidden;
        }
      `}</style>
    </>
  );
};

const mapStateToProps = (state) => ({
  modalLoading: state.Nurse.modalLoading,
});

export default connect(mapStateToProps)(InfoModal);
