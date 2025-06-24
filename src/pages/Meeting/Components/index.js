import { generateToken } from "../meeting.helpers";

function MeetingComponent({ meetingId, name, userType }) {
    const handleGenerateToken = async () => {
        if (!meetingId) {
            alert("Meeting ID is required!");
            return;
        }
        try {
            const data = await generateToken(meetingId, name, userType);
            if (data?.token) {
                // Open the meeting page in a new tab with the token as a query parameter
                const meetingUrl = `/meeting?authToken=${encodeURIComponent(data.token)}`;
                window.open(meetingUrl, "_blank"); // Open in a new tab
            } else {
                console.error("Token generation failed:", data);
            }
        } catch (error) {
            console.error("Error generating token:", error);
        }
    };

    return (
        <div>
            <button onClick={handleGenerateToken}>Join Meeting</button>
        </div>
    );
}



export default MeetingComponent;
