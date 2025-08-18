import { useState, useEffect } from "react";
import { connect } from "react-redux";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Progress,
  Card,
  CardBody,
  Nav,
  NavItem,
  NavLink,
} from "reactstrap";

const InfoModal = ({
  title,
  show,
  onCloseClick,
  content = [],
  modalLoading,
}) => {
  const [completedTasks, setCompletedTasks] = useState(new Set());
  const isNotes = title.toLowerCase() === "notes";
  const [activeTab, setActiveTab] = useState("medicine");

  const medicineAlerts = isNotes
    ? []
    : content.filter((item) => item.type === "medicine");
  const testAlerts = isNotes
    ? []
    : content.filter((item) => item.type === "test");

  const completedCount = completedTasks.size;
  const totalCount = medicineAlerts.length;
  const progressPercentage =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const toggleTask = (index) => {
    setCompletedTasks((prev) => {
      const newCompleted = new Set(prev);
      if (newCompleted.has(index)) {
        newCompleted.delete(index);
      } else {
        newCompleted.add(index);
      }
      return newCompleted;
    });
  };

  const clearAll = () => setCompletedTasks(new Set());
  const completeAll = () =>
    setCompletedTasks(new Set(Array.from({ length: totalCount }, (_, i) => i)));

  useEffect(() => {
    if (show) {
      setCompletedTasks(new Set());
    }
  }, [show, content]);

  const CircleIcon = ({ size = 16, color = "#6c757d" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  );

  const CheckCircleIcon = ({ size = 16, color = "green" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 12l2 2 4-4" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  );

  const getSeverityColor = (flag) => {
    switch (flag) {
      case "urgent":
        return "#dc3545";
      case "attention":
        return "#fd7e14";
      default:
        return "#6c757d";
    }
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

        {!isNotes && (
          <Nav tabs className="px-3 pt-2 bg-light">
            <NavItem>
              <NavLink
                active={activeTab === "medicine"}
                onClick={() => setActiveTab("medicine")}
                style={{ cursor: "pointer" }}
              >
                Medicines ({medicineAlerts.length})
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
        )}

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
            {isNotes ? (
              content.length > 0 ? (
                <div className="d-flex flex-column">
                  {content.map((item, index) => (
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
                            backgroundColor: "#6c757d",
                            borderRadius: "50%",
                            flexShrink: 0,
                          }}
                        />
                        <p
                          className="mb-0 text-dark"
                          style={{ fontSize: "0.9rem", flexGrow: 1 }}
                        >
                          {item}
                        </p>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">No notes available</div>
              )
            ) : activeTab === "medicine" ? (
              medicineAlerts.length > 0 ? (
                <div className="d-flex flex-column">
                  {medicineAlerts.map((item, index) => {
                    const isCompleted = completedTasks.has(index);
                    return (
                      <Card
                        key={index}
                        className="border-0"
                        style={{
                          backgroundColor: isCompleted ? "#E8F3EE" : "#f8f9fa",
                          cursor: "pointer",
                          borderRadius: "4px",
                          marginBottom: "5px",
                        }}
                        onClick={() => toggleTask(index)}
                      >
                        <CardBody
                          className="d-flex align-items-center"
                          style={{ padding: "10px", gap: "8px" }}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTask(index);
                            }}
                            className="btn p-0 border-0 rounded d-flex align-items-center justify-content-center"
                            style={{
                              width: "18px",
                              height: "18px",
                              backgroundColor: "transparent",
                            }}
                          >
                            {isCompleted ? (
                              <CheckCircleIcon size={14} />
                            ) : (
                              <CircleIcon size={14} />
                            )}
                          </button>
                          <div style={{ flexGrow: 1 }}>
                            <p
                              className="mb-0 lh-sm text-dark"
                              style={{ fontSize: "0.85rem" }}
                            >
                              {item.message}
                            </p>
                            <small
                              style={{
                                color: getSeverityColor(item.flag),
                                fontWeight: "600",
                                fontSize: "0.75rem",
                              }}
                            >
                              MEDICINE - {item.flag.toUpperCase()}
                            </small>
                          </div>
                        </CardBody>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4">No medicine alerts</div>
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
                        <p
                          className="mb-0 text-dark"
                          style={{ fontSize: "0.9rem" }}
                        >
                          {item.message}
                        </p>
                        <small style={{ color: getSeverityColor("attention") }}>
                          TEST - ATTENTION
                        </small>
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

        {!isNotes && activeTab === "medicine" && medicineAlerts.length > 0 && (
          <ModalFooter className="bg-light border-0 rounded-bottom py-2">
            <div className="d-flex justify-content-between align-items-center w-100">
              <div className="d-flex align-items-center gap-2">
                <Progress
                  value={progressPercentage}
                  style={{ width: "100px", height: "6px" }}
                />
                <small className="text-muted fw-medium">
                  {Math.round(progressPercentage)}%
                </small>
              </div>
              <div className="d-flex gap-2">
                <Button
                  color="outline-secondary"
                  size="sm"
                  onClick={clearAll}
                  disabled={completedCount === 0}
                >
                  Clear All
                </Button>
                <Button
                  color="outline-success"
                  size="sm"
                  onClick={completeAll}
                  disabled={completedCount === totalCount}
                >
                  Complete All
                </Button>
              </div>
            </div>
          </ModalFooter>
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
