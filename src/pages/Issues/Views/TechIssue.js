import { useEffect } from "react";
import { getIssues } from "../../../helpers/backend_helper";


const TechIssues = () => {
    const fetchIssues = async () => {
        try {
            const params = {
                issueType: "TECH"
            }
            const response = getIssues(params);
            console.log("response", response);

        } catch (error) {
            console.log(error);

        }
    }
    useEffect(() => { fetchIssues() }, [])
    return <div className="p-4">Tech Issues Page</div>;
};

export default TechIssues;