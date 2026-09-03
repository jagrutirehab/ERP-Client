import axios from "axios";
import * as apiData from "../../config.js"
const API_BASE_URL = apiData.api.API_URL

// NOTE: there is no createMeeting() here any more. Meetings are created
// server-side at booking time, and the backend's POST /meeting/create-meeting
// proxy (which this used to call) has been removed along with it.

export const generateToken = async (meetingId, name, userType) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/meeting/generate-token`, {
            meetingId,
            name,
            userType,
            custom_participant_id: `${userType}-${Date.now()}`, // Unique ID for each participant
        });
        // The response BODY is what callers want ({ token, meetingId,
        // participantId }). This used to return the whole axios response, so
        // `data?.token` in the caller was always undefined and the doctor's
        // "Join Meeting" button silently did nothing.
        return response.data;
    } catch (error) {
        console.error("Error generating token:", error.response?.data || error.message);
        return null;
    }
};