import { useState, useEffect } from "react";
import { DyteProvider, useDyteClient } from "@dytesdk/react-web-core";
import { DyteMeeting } from "@dytesdk/react-ui-kit";
import { useLocation } from "react-router-dom";

function MyMeetingUI() {
  const [meeting, initMeeting] = useDyteClient();
  const [initialized, setInitialized] = useState(false);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const authToken = queryParams.get("authToken"); // Get the token from the query parameters

  useEffect(() => {
    if (authToken && !initialized) {
      initMeeting({
        authToken,
        defaults: { audio: false, video: false },
      });
      setInitialized(true);
    }
  }, [authToken, initMeeting, initialized]);

  return meeting ? (
    <DyteProvider value={meeting}>
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <DyteMeeting meeting={meeting} showSetupScreen={false} />
      </div>
    </DyteProvider>
  ) : (
    <p>Loading Meeting...</p>
  );
}

export default MyMeetingUI;
