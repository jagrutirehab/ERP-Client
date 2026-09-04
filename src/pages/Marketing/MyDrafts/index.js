import React, { useEffect, useState } from "react";
import { Card, CardBody, Row, Col, Spinner, Alert, Button } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import { listMyDrafts, discardDraft } from "../../../helpers/backend_helper";

const MyDrafts = () => {
  const navigate = useNavigate();
  const handleAuthError = useAuthError();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [discardingId, setDiscardingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    document.title = "My Drafts | Jagruti Rehab";
  }, []);

  const fetchDrafts = () => {
    setLoading(true);
    listMyDrafts()
      .then((res) => {
        const data = res?.data?.payload || res?.payload || [];
        setDrafts(data);
      })
      .catch((err) => {
        if (!handleAuthError(err)) {
          setError(err?.response?.data?.message || "Failed to load drafts");
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDrafts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleContinue = (draft) => {
    navigate(`/marketing/visit-log/add?draftId=${draft._id}`);
  };

  const handleDiscard = async (id) => {
    setDiscardingId(id);
    try {
      await discardDraft(id);
      toast.success("Draft discarded");
      setDrafts((prev) => prev.filter((d) => d._id !== id));
      setConfirmId(null);
    } catch (err) {
      if (!handleAuthError(err)) {
        toast.error(err?.response?.data?.message || "Failed to discard draft");
      }
    } finally {
      setDiscardingId(null);
    }
  };

  return (
    <div className="p-3 p-lg-4 bg-white" style={{ overflowX: "hidden" }}>
      <Row className="justify-content-center">
        <Col xs={12} xl={9} style={{ minWidth: 0 }}>
          <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom flex-wrap gap-2">
            <div>
              <h4 className="mb-0 fw-semibold">My Drafts</h4>
              <p className="text-muted fs-13 mb-0 mt-1">
                Incomplete visits you saved for later — continue or discard them
                here.
              </p>
            </div>
            <span className="badge bg-light text-dark border fs-13 px-3 py-2">
              {drafts.length} draft{drafts.length === 1 ? "" : "s"}
            </span>
          </div>

          {loading && (
            <div className="text-center py-5">
              <Spinner color="primary" />
            </div>
          )}
          {error && <Alert color="danger">{error}</Alert>}

          {!loading && !error && drafts.length === 0 && (
            <Card className="border-0 shadow-sm">
              <CardBody className="text-center text-muted py-5">
                <i className="bx bx-file-blank fs-1 d-block mb-2 opacity-50" />
                No saved drafts
              </CardBody>
            </Card>
          )}

          {!loading &&
            !error &&
            drafts.map((draft) => {
              const doctorName = draft.doctor?.name || "Untitled visit";
              const clinicName = draft.doctor?.clinicName;
              return (
                <Card key={draft._id} className="border-0 shadow-sm mb-3">
                  <CardBody className="p-3 p-lg-4">
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{
                            width: 44,
                            height: 44,
                            background: "#eef2ff",
                          }}
                        >
                          <i
                            className="bx bx-file-blank"
                            style={{ fontSize: 20, color: "#3577f1" }}
                          />
                        </div>
                        <div>
                          <div className="fw-semibold fs-15">{doctorName}</div>
                          <div className="text-muted fs-13">
                            {clinicName || "No clinic name yet"}
                            {" · "}
                            Last updated{" "}
                            {new Date(draft.updatedAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                              },
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="d-flex gap-2">
                        {confirmId === draft._id ? (
                          <>
                            <Button
                              size="sm"
                              color="light"
                              onClick={() => setConfirmId(null)}
                              disabled={discardingId === draft._id}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              color="danger"
                              onClick={() => handleDiscard(draft._id)}
                              disabled={discardingId === draft._id}
                            >
                              {discardingId === draft._id
                                ? "Discarding…"
                                : "Confirm Discard"}
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              color="light"
                              outline
                              className="text-danger border-danger"
                              onClick={() => setConfirmId(draft._id)}
                            >
                              Discard
                            </Button>
                            <Button
                              size="sm"
                              style={{
                                backgroundColor: "#1e90ff",
                                color: "#fff",
                                border: "none",
                              }}
                              onClick={() => handleContinue(draft)}
                            >
                              Continue
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
        </Col>
      </Row>
    </div>
  );
};

export default MyDrafts;
