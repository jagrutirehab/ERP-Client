import React, { useEffect, useState } from "react";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import { getMyTickets } from "../Helpers/FetchIssues";
import { normalizeStatus } from "../Components/normalizeStatus";

const issueTypes = ["TECH", "PURCHASE", "REVIEW_SUBMISSION"];

const statuses = [
  "new",
  "assigned",
  "in_progress",
  "on_hold",
  "pending_user",
  "pending_release",
  "resolved",
  "closed",
];

const MyIssues = () => {
  const token = JSON.parse(localStorage.getItem("user"))?.token;
  const { hasPermission } = usePermissions(token);
  const hasUserPermission = hasPermission("ISSUES", "MY_ISSUES", "READ");

  const [type, setType] = useState("TECH");
  const [status, setStatus] = useState("");
  const [issues, setIssues] = useState([]);

  const loadIssues = async () => {
    try {
      const params = {};

      if (status) {
        params.status = status;
      }

      const response = await getMyTickets(type, params);
      setIssues(response?.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (hasUserPermission) {
      loadIssues();
    }
  }, [type, status]);

  return (
    <div className="p-3">

      {/* Filters */}
      <div className="d-flex gap-3 mb-3">

        {/* Issue Type */}
        <select
          className="form-select"
          style={{ width: "200px" }}
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          {issueTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        {/* Status */}
        <select
          className="form-select"
          style={{ width: "200px" }}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Status</option>

          {statuses.map((s) => (
            <option key={s} value={s}>
              {normalizeStatus(s)}
            </option>
          ))}
        </select>
      </div>

      {/* Issues List */}
      <div>
        {issues.map((issue) => (
          <div key={issue._id} className="border p-2 mb-2">
            <b>{issue.issueType}</b> - {normalizeStatus(issue.status)}
          </div>
        ))}
      </div>

    </div>
  );
};

export default MyIssues;