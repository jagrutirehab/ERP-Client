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
import { endOfDay, format, startOfDay } from "date-fns";
import { toast } from "react-toastify";
import {
  sendToTally,
  cancelTallySync,
  getActiveTallySession,
} from "../../helpers/backend_helper";
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

  // Ref to hold reconnect function (breaks circular dependency with connectSSE)
  const checkAndReconnectRef = useRef(null);

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

  // const connectSSE = useCallback(
  //   (sessionId) => {
  //     if (eventSourceRef.current) {
  //       eventSourceRef.current.close();
  //     }

  //     const baseUrl = api.API_URL || "";
  //     const sseUrl = `${baseUrl}/tally/send/stream?sessionId=${sessionId}`;

  //     addLog(`📡 Connecting to live stream...`, "info");

  //     const eventSource = new EventSource(sseUrl, { withCredentials: true });
  //     eventSourceRef.current = eventSource;

  //     eventSource.onmessage = (event) => {
  //       try {
  //         const data = JSON.parse(event.data);

  //         if (data.type === "log") {
  //           addLog(data.message, data.level || "info");
  //         } else if (data.type === "cancelled") {
  //           addLog("", "divider");
  //           addLog("🛑 Sync cancelled by user.", "warning");
  //           addLog("", "divider");
  //           setSending(false);
  //           currentSessionIdRef.current = null;
  //           eventSource.close();
  //           eventSourceRef.current = null;
  //         } else if (data.type === "done") {
  //           addLog("", "divider");
  //           addLog(`🎯 Tally Sync Summary:`, "info");
  //           addLog(`   Total: ${data.summary?.total || 0}`, "info");
  //           addLog(`   ✅ Success: ${data.summary?.success || 0}`, "success");
  //           addLog(
  //             `   ❌ Failed: ${data.summary?.failed || 0}`,
  //             data.summary?.failed > 0 ? "error" : "info",
  //           );
  //           addLog(`   ⏱️  Duration: ${data.summary?.duration || 0}ms`, "info");
  //           addLog("", "divider");
  //           addLog("✅ Sync completed!", "success");

  //           setSending(false);
  //           setIsDone(true);
  //           currentSessionIdRef.current = null;
  //           eventSource.close();
  //           eventSourceRef.current = null;
  //         } else if (data.type === "error") {
  //           addLog(`❌ ${data.message}`, "error");
  //           setSending(false);
  //           currentSessionIdRef.current = null;
  //           eventSource.close();
  //           eventSourceRef.current = null;
  //         }
  //       } catch (e) {
  //         addLog(event.data, "info");
  //       }
  //     };

  //     eventSource.onerror = () => {
  //       eventSource.close();
  //       eventSourceRef.current = null;
  //       addLog("⚠️ Connection lost. Attempting to reconnect...", "warning");
  //       // Auto-retry after 3 seconds via ref
  //       setTimeout(() => {
  //         if (checkAndReconnectRef.current) checkAndReconnectRef.current();
  //       }, 3000);
  //     };
  //   },
  //   [addLog],
  // );
  const connectSSE = useCallback(
    (sessionId) => {
      if (eventSourceRef.current) {
        console.log(
          "🔌 [SSE] Closing existing connection before starting a new one.",
        );
        eventSourceRef.current.close();
      }

      const baseUrl = api.API_URL || "";
      const sseUrl = `${baseUrl}/tally/send/stream?sessionId=${sessionId}`;

      console.log(`🟢 [SSE] Initiating connection to: ${sseUrl}`);
      addLog(`📡 Connecting to live stream...`, "info");

      const eventSource = new EventSource(sseUrl, { withCredentials: true });
      eventSourceRef.current = eventSource;

      // 🟢 THE WATCHDOG TIMER
      let watchdog;
      const resetWatchdog = (triggerSource) => {
        clearTimeout(watchdog);
        // Uncomment the line below if you want to see exactly when the timer resets,
        // but it might get noisy with fast logs!
        // console.log(`⏱️ [Watchdog] Reset triggered by: ${triggerSource}. Waiting 60s...`);

        watchdog = setTimeout(() => {
          console.warn(
            "💀 [Watchdog] TRIGGERED! 60 seconds passed with ZERO data from backend. Forcing reconnect.",
          );
          addLog("⚠️ Stream stalled. Forcing reconnect...", "warning");
          eventSource.close();
          eventSourceRef.current = null;
          if (checkAndReconnectRef.current) checkAndReconnectRef.current();
        }, 60000); // 60 seconds limit
      };

      // Start the timer as soon as we connect
      resetWatchdog("initialization");

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // 🟢 INTERCEPT PING: Catch the heartbeat, reset timer, keep UI clean.
          if (data.type === "ping") {
            console.log(
              "💓 [SSE] Heartbeat ping received from backend. Socket is healthy.",
            );
            resetWatchdog("ping");
            return;
          }

          // Reset timer for any normal log as well
          resetWatchdog("data");

          if (data.type === "log") {
            // Optional: console.log(`📩 [SSE] Log received:`, data.message);
            addLog(data.message, data.level || "info");
          } else if (data.type === "cancelled") {
            console.log("🛑 [SSE] Sync cancelled by user.");
            clearTimeout(watchdog);
            addLog("", "divider");
            addLog("🛑 Sync cancelled by user.", "warning");
            addLog("", "divider");
            setSending(false);
            currentSessionIdRef.current = null;
            eventSource.close();
            eventSourceRef.current = null;
          } else if (data.type === "done") {
            console.log("🎯 [SSE] Sync completed successfully!");
            clearTimeout(watchdog);
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
            console.error("❌ [SSE] Backend sent an error:", data.message);
            clearTimeout(watchdog);
            addLog(`❌ ${data.message}`, "error");
            setSending(false);
            currentSessionIdRef.current = null;
            eventSource.close();
            eventSourceRef.current = null;
          }
        } catch (e) {
          console.error("⚠️ [SSE] Failed to parse event data:", event.data);
          addLog(event.data, "info");
        }
      };

      eventSource.onerror = (errorEvent) => {
        console.error(
          "🔴 [SSE] Browser fired onerror event. Connection dropped.",
          errorEvent,
        );
        clearTimeout(watchdog);
        eventSource.close();
        eventSourceRef.current = null;
        addLog("⚠️ Connection lost. Attempting to reconnect...", "warning");

        setTimeout(() => {
          console.log("🔄 [SSE] Attempting to reconnect now...");
          if (checkAndReconnectRef.current) checkAndReconnectRef.current();
        }, 3000);
      };
    },
    [addLog],
  );

  // Reconnect logic — check backend for active session and re-attach SSE
  const checkAndReconnect = useCallback(async () => {
    if (eventSourceRef.current) return;
    try {
      const response = await getActiveTallySession();
      if (response?.sessionId) {
        currentSessionIdRef.current = response.sessionId;
        setSending(true);
        setIsDone(false);
        addLog("📡 Reconnecting to running sync session...", "info");
        connectSSE(response.sessionId);
      }
    } catch {
      // Server unreachable or no active session
    }
  }, [addLog, connectSSE]);

  // Keep ref in sync so connectSSE.onerror can call it without circular deps
  checkAndReconnectRef.current = checkAndReconnect;

  // On mount + tab visibility: check for active session
  useEffect(() => {
    checkAndReconnect();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        checkAndReconnect();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [checkAndReconnect]);

  const handleSync = async () => {
    if (selectedCentersIds.length === 0) {
      toast.error("Please select at least one center");
      return;
    }

    if (selectedTypes.length === 0) {
      toast.error("Please select at least one voucher type");
      return;
    }

    const syncDate = Array.isArray(selectedDate)
      ? selectedDate[0]
      : selectedDate;
    if (!syncDate) {
      toast.error("Please select a date");
      return;
    }

    // Reset state
    setLogs([]);
    setIsDone(false);
    setSending(true);

    addLog("🚀 Initiating Tally sync...", "info");
    addLog(`📅 Date: ${format(syncDate, "dd MMM yyyy")}`, "info");
    addLog(`📋 Types: ${selectedTypes.join(", ")}`, "info");
    addLog("🔌 Checking connection to Tally server...", "info");

    try {
      const response = await sendToTally({
        date: startOfDay(syncDate),
        startDate: startOfDay(syncDate).toISOString(),
        endDate: endOfDay(syncDate).toISOString(),
        centerIds: selectedCentersIds,
        types: selectedTypes,
      });

      if (response.success && response.sessionId) {
        addLog("✅ Tally server is reachable! Starting session...", "success");
        if (response.alreadyRunning) {
          addLog(
            `⚡ A sync is already running — joining existing session...`,
            "warning",
          );
        } else {
          addLog(`✅ Session started: ${response.sessionId}`, "success");
        }
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
                        onSync={handleSync}
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
