import axios from "axios";
import * as apiData from "../../config.js"
const API_BASE_URL = apiData.api.API_URL
export const createMeeting = async () => {
    try {
        const response = await axios.post(`${API_BASE_URL}/meeting/create-meeting`);
        return response.data;
    } catch (error) {
        console.error("Error creating meeting:", error);
        return null;
    }
};

export const generateToken = async (meetingId, name, userType) => {
    try {
        console.log('req hit')
        const response = await axios.post(`${API_BASE_URL}/meeting/generate-token`, {
            meetingId,
            name,
            userType,
            custom_participant_id: `${userType}-${Date.now()}`, // Unique ID for each participant
        });
        return response;
    } catch (error) {
        console.error("Error generating token:", error.response?.data || error.message);
        return null;
    }
};