import { getIssues, getMyIssues } from "../../../helpers/backend_helper";

export const fetchIssues = async (type, params = {}) => {
    const response = await getIssues({
        issueType: type,
        ...params,
    });

    return response;
};

export const getMyTickets = async (type, params = {}) => {
    const response = await getMyIssues({
        issueType: type,
        ...params,
    })
    return response;
}