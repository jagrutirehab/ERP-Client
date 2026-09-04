import { useState, useEffect } from "react";
import {
  RealtimeKitProvider,
  useRealtimeKitClient,
} from "@cloudflare/realtimekit-react";
import { RtkMeeting } from "@cloudflare/realtimekit-react-ui";
import { useLocation } from "react-router-dom";

function MyMeetingUI() {
  const [meeting, initMeeting] = useRealtimeKitClient();
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
    <RealtimeKitProvider value={meeting}>
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <RtkMeeting meeting={meeting} showSetupScreen={false} />
      </div>
    </RealtimeKitProvider>
  ) : (
    <p>Loading Meeting...</p>
  );
}

export default MyMeetingUI;
