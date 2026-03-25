import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import classnames from "classnames";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { sendToTally, updateInTally, cancelTallySync } from "../../helpers/backend_helper";
import { api } from "../../config";
import TallyHeader from "./TallyHeader";
import LogConsole from "./LogConsole";
import TallyLogRecords from "./TallyLogRecords";
import TallyPendingUpdates from "./TallyPendingUpdates";
import { usePermissions } from "../../Components/Hooks/useRoles";
import { useNavigate } from "react-router-dom";

const Tally = ({ centers, centerAccess }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("1");
  const [selectedDate, setSelectedDate] = useState([new Date()]);
  // ... (rest of initializations)
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [sending, setSending] = useState(false);
  const [logs, setLogs] = useState([]);
  const [isDone, setIsDone] = useState(false);
  const eventSourceRef = useRef(null);
  const currentSessionIdRef = useRef(null);
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const { loading: permissionLoader, hasPermission } = usePermissions(token);
  const hasTallyPermission = hasPermission("TALLY", null, "READ");
  const hasTallyCreatePermission = hasPermission(
    "TALLY",
    "SEND_TO_TALLY",
    "WRITE",
  );
  const hasTallyLogsPermission = hasPermission("TALLY", "TALLY_LOGS", "READ");

  useEffect(() => {
    if (permissionLoader) return;
    if (!hasTallyPermission) {
      navigate("/unauthorized");
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasTallyPermission, permissionLoader]);

  // Center selection state
  const [centerOptions, setCenterOptions] = useState(
    centers
      ?.filter((c) => centerAccess.includes(c._id))
      .map((c) => ({
        _id: c._id,
        title: c.title,
      })),
  );
  const [selectedCentersIds, setSelectedCentersIds] = useState(
    centerOptions?.map((c) => c._id) || [],
  );

  const toggleTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  useEffect(() => {
    // ... (centers sync logic)
    setCenterOptions(
      centers
        ?.filter((c) => centerAccess.includes(c._id))
        .map((c) => ({
          _id: c._id,
          title: c.title,
        })),
    );
  }, [centerAccess, centers]);

  useEffect(() => {
    if (centerOptions && centerOptions?.length > 0) {
      setSelectedCentersIds(centerOptions.map((c) => c._id));
    }
  }, [centerOptions]);

  // Cleanup SSE on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const handleTypeToggle = (typeId) => {
    setSelectedTypes((prev) => {
      if (prev.includes(typeId)) {
        return prev.filter((t) => t !== typeId);
      }
      return [...prev, typeId];
    });
  };

  const addLog = useCallback((message, type = "info") => {
    const timestamp = format(new Date(), "HH:mm:ss");
    setLogs((prev) => [...prev, { timestamp, message, type }]);
  }, []);

  const connectSSE = useCallback(
    (sessionId) => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const baseUrl = api.API_URL || "";
      const sseUrl = `${baseUrl}/tally/send/stream?sessionId=${sessionId}`;

      addLog(`📡 Connecting to live stream...`, "info");

      const eventSource = new EventSource(sseUrl, { withCredentials: true });
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "log") {
            addLog(data.message, data.level || "info");
          } else if (data.type === "cancelled") {
            addLog("", "divider");
            addLog("🛑 Sync cancelled by user.", "warning");
            addLog("", "divider");
            setSending(false);
            currentSessionIdRef.current = null;
            eventSource.close();
            eventSourceRef.current = null;
          } else if (data.type === "done") {
            addLog("", "divider");
            addLog(`🎯 Tally Sync Summary:`, "info");
            addLog(`   Total: ${data.summary?.total || 0}`, "info");
            addLog(`   ✅ Success: ${data.summary?.success || 0}`, "success");
            addLog(
              `   ❌ Failed: ${data.summary?.failed || 0}`,
              data.summary?.failed > 0 ? "error" : "info",
            );
            addLog(`   ⏱️  Duration: ${data.summary?.duration || 0}ms`, "info");
            addLog("", "divider");
            addLog("✅ Sync completed!", "success");

            setSending(false);
            setIsDone(true);
            currentSessionIdRef.current = null;
            eventSource.close();
            eventSourceRef.current = null;
          } else if (data.type === "error") {
            addLog(`❌ ${data.message}`, "error");
            setSending(false);
            currentSessionIdRef.current = null;
            eventSource.close();
            eventSourceRef.current = null;
          }
        } catch (e) {
          addLog(event.data, "info");
        }
      };

      eventSource.onerror = () => {
        addLog(
          "⚠️ Connection lost. Sync may still be running on server.",
          "warning",
        );
        setSending(false);
        eventSource.close();
        eventSourceRef.current = null;
      };
    },
    [addLog],
  );

  const handleSend = async () => {
    if (selectedCentersIds.length === 0) {
      toast.error("Please select at least one center");
      return;
    }

    if (selectedTypes.length === 0) {
      toast.error("Please select at least one voucher type");
      return;
    }

    // Reset state
    setLogs([]);
    setIsDone(false);
    setSending(true);

    addLog("🚀 Initiating Tally sync...", "info");
    const startDateStr = selectedDate[0] ? format(selectedDate[0], "dd MMM yyyy") : "";
    const endDateStr = selectedDate[1] ? format(selectedDate[1], "dd MMM yyyy") : startDateStr;
    addLog(`📅 Date: ${startDateStr} to ${endDateStr}`, "info");
    addLog(`📋 Types: ${selectedTypes.join(", ")}`, "info");

    try {
      const response = await sendToTally({
        date: selectedDate[0]?.toISOString(),
        startDate: selectedDate[0]?.toISOString(),
        endDate: (selectedDate[1] || selectedDate[0])?.toISOString(),
        centerIds: selectedCentersIds,
        types: selectedTypes,
      });

      if (response.success && response.sessionId) {
        addLog(`✅ Session started: ${response.sessionId}`, "success");
        currentSessionIdRef.current = response.sessionId;
        connectSSE(response.sessionId);
      } else {
        addLog(
          `❌ Failed to start sync: ${response.message || "Unknown error"}`,
          "error",
        );
        setSending(false);
      }
    } catch (error) {
      addLog(
        `❌ Error: ${error.message || "Failed to connect to server"}`,
        "error",
      );
      setSending(false);
    }
  };

  const handleUpdate = async () => {
    if (selectedCentersIds.length === 0) {
      toast.error("Please select at least one center");
      return;
    }

    if (selectedTypes.length === 0) {
      toast.error("Please select at least one voucher type");
      return;
    }

    // Reset state
    setLogs([]);
    setIsDone(false);
    setSending(true);

    addLog("🔄 Initiating Tally UPDATE (search → delete → re-insert)...", "info");
    const startDateStr = selectedDate[0] ? format(selectedDate[0], "dd MMM yyyy") : "";
    const endDateStr = selectedDate[1] ? format(selectedDate[1], "dd MMM yyyy") : startDateStr;
    addLog(`📅 Date: ${startDateStr} to ${endDateStr}`, "info");
    addLog(`📋 Types: ${selectedTypes.join(", ")}`, "info");

    try {
      const response = await updateInTally({
        date: selectedDate[0]?.toISOString(),
        startDate: selectedDate[0]?.toISOString(),
        endDate: (selectedDate[1] || selectedDate[0])?.toISOString(),
        centerIds: selectedCentersIds,
        types: selectedTypes,
      });

      if (response.success && response.sessionId) {
        addLog(`✅ Update session started: ${response.sessionId}`, "success");
        currentSessionIdRef.current = response.sessionId;
        connectSSE(response.sessionId);
      } else {
        addLog(
          `❌ Failed to start update: ${response.message || "Unknown error"}`,
          "error",
        );
        setSending(false);
      }
    } catch (error) {
      addLog(
        `❌ Error: ${error.message || "Failed to connect to server"}`,
        "error",
      );
      setSending(false);
    }
  };

  const handleCancel = async () => {
    const sessionId = currentSessionIdRef.current;
    if (!sessionId) return;

    addLog("⏳ Sending cancellation request...", "warning");
    try {
      await cancelTallySync(sessionId);
    } catch (err) {
      // Server may have already finished — just close the SSE
      addLog(`⚠️ Could not reach server to cancel: ${err.message}`, "warning");
    }
    // Close SSE regardless
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    currentSessionIdRef.current = null;
    setSending(false);
    addLog("🛑 Sync cancelled.", "warning");
  };

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Row>
          <Col xs={12}>
            <Card>
              <CardHeader className="d-flex align-items-center justify-content-between pb-0">
                <div className="d-flex align-items-center">
                  <h4 className="card-title mb-0 me-4">
                    <i className="bx bx-sync me-2"></i>
                    Tally Integration
                  </h4>
                  <Nav tabs className="border-bottom-0">
                    {hasTallyCreatePermission && (
                      <NavItem>
                        <NavLink
                          className={classnames({ active: activeTab === "1" })}
                          onClick={() => toggleTab("1")}
                          style={{ cursor: "pointer" }}
                        >
                          Live Sync
                        </NavLink>
                      </NavItem>
                    )}
                    {hasTallyLogsPermission && (
                      <NavItem>
                        <NavLink
                          className={classnames({ active: activeTab === "2" })}
                          onClick={() => toggleTab("2")}
                          style={{ cursor: "pointer" }}
                        >
                          Log Records
                        </NavLink>
                      </NavItem>
                    )}
                    {hasTallyLogsPermission && (
                      <NavItem>
                        <NavLink
                          className={classnames({ active: activeTab === "3" })}
                          onClick={() => toggleTab("3")}
                          style={{ cursor: "pointer" }}
                        >
                          Pending Updates
                        </NavLink>
                      </NavItem>
                    )}
                  </Nav>
                </div>
              </CardHeader>
              <CardBody>
                <TabContent activeTab={activeTab}>
                  {hasTallyCreatePermission && (
                    <TabPane tabId="1">
                      <TallyHeader
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                        centerOptions={centerOptions}
                        selectedCentersIds={selectedCentersIds}
                        setSelectedCentersIds={setSelectedCentersIds}
                        selectedTypes={selectedTypes}
                        onTypeToggle={handleTypeToggle}
                        sending={sending}
                        onSend={handleSend}
                        onUpdate={handleUpdate}
                        onCancel={handleCancel}
                      />

                      <LogConsole
                        logs={logs}
                        sending={sending}
                        onClear={() => setLogs([])}
                      />
                    </TabPane>
                  )}
                  {hasTallyLogsPermission && (
                    <TabPane tabId="2">
                      <TallyLogRecords
                        centerOptions={centerOptions}
                        initialCenters={selectedCentersIds}
                      />
                    </TabPane>
                  )}
                  {hasTallyLogsPermission && (
                    <TabPane tabId="3">
                      <TallyPendingUpdates
                        centerOptions={centerOptions}
                        initialCenters={selectedCentersIds}
                      />
                    </TabPane>
                  )}
                </TabContent>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

Tally.propTypes = {
  centers: PropTypes.array,
  centerAccess: PropTypes.array,
};

const mapStateToProps = (state) => ({
  centers: state.Center.data,
  centerAccess: state.User?.centerAccess,
});

export default connect(mapStateToProps)(Tally);
