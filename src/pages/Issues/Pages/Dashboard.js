import React, { useEffect, useState } from "react";
import Select from "react-select";
import { getTicketsDashboardData } from "../../../helpers/backend_helper";
import { CardBody, Spinner } from "reactstrap";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import IssueTypeAnalysis from "../Components/IssueTypeAnalysis";
import DashboardTable from "../Components/DashboardTable";
import PieAndResolvesAnalysis from "../Components/PieAndResolvesAnalysis";

const monthOptions = [
  { label: "All", value: "all" },
  { label: "January", value: 0 },
  { label: "February", value: 1 },
  { label: "March", value: 2 },
  { label: "April", value: 3 },
  { label: "May", value: 4 },
  { label: "June", value: 5 },
  { label: "July", value: 6 },
  { label: "August", value: 7 },
  { label: "September", value: 8 },
  { label: "October", value: 9 },
  { label: "November", value: 10 },
  { label: "December", value: 11 },
];

const issueTypeOptions = [
  { label: "All", value: "all" },
  { label: "Tech", value: "TECH" },
  { label: "Purchase", value: "PURCHASE" },
  { label: "Review Submission", value: "REVIEW_SUBMISSION" },
];

const Dashboard = () => {
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const [loading, setLoading] = useState(false);

  const [month, setMonth] = useState(monthOptions[0]);
  const [issueType, setIssueType] = useState(issueTypeOptions[0]);

  const [data, setData] = useState([]);
  const loadData = async () => {
    try {
      setLoading(true);

      const response = await getTicketsDashboardData({
        month: month.value,
        issueType: issueType.value,
      });

      console.log("response", response);
      setData(response?.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [month, issueType]);

  return (
    <>
      <CardBody
        className="p-3 bg-white"
        style={{
          width: isMobile ? "100%" : "78%",
          maxHeight: "100vh",
          overflowY: "auto",
        }}
      >
        {loading ? (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: "300px" }}
          >
            <Spinner color="primary" />
          </div>
        ) : (
          <>
            <div className="text-center mb-4">
              <h1 className="display-6 fw-bold text-primary">DASHBOARD</h1>
            </div>

            <div
              className="d-flex justify-content-end mb-3"
              style={{ gap: "10px" }}
            >
              <div style={{ width: "130px" }}>
                <Select
                  options={issueTypeOptions}
                  value={issueType}
                  onChange={setIssueType}
                  isSearchable={false}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  }}
                />
              </div>

              <div style={{ width: "130px" }}>
                <Select
                  options={monthOptions}
                  value={month}
                  onChange={setMonth}
                  isSearchable={false}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  }}
                />
              </div>
            </div>

            <div className="d-flex flex-column gap-4">
              <IssueTypeAnalysis data={data} />
              <PieAndResolvesAnalysis data={data} />
              <DashboardTable data={data} type={issueType.value} />
            </div>
          </>
        )}
      </CardBody>

    </>
  );
};

export default Dashboard;