import React, { useEffect, useState } from "react";
import { getBalance } from "../../../../helpers/backend_helper";
import { CardBody } from "reactstrap";
import DataTableComponent from "../../../../Components/Common/DataTable";
import { balanceLeavesColumn } from "../../components/Table/Columns/balanceLeaves";
import { useMediaQuery } from "../../../../Components/Hooks/useMediaQuery";
import { usePermissions } from "../../../../Components/Hooks/useRoles";
import { useNavigate } from "react-router-dom";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { toast } from "react-toastify";

const GetBalanceLeaves = () => {
  const [balanceData, setBalanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const handleAuthError = useAuthError();

  const navigate = useNavigate();
  const token = JSON.parse(localStorage.getItem("user"))?.token;

  const { hasPermission, loading: isLoading } = usePermissions(token);
  const hasUserPermission = hasPermission("HR", "BALANCE_LEAVES", "READ");

  // console.log("hasUserPermission for balance", hasUserPermission)

  const fetchBalancesData = async () => {
    setLoading(true);
    try {
      const res = await getBalance();
      const data = res?.data;

      if (!data) return;

      const rows = [
        {
          category: "Total Leaves",
          ...data.totalLeaves?.[0],
        },
        {
          category: "Pending Leaves",
          ...data.pendingLeaves?.[0],
        },
      ];

      setBalanceData(rows);
    } catch (error) {
      // console.error(error);
      if (!handleAuthError(error)) {
        toast.error(error.message || "Failed to fetch data");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasUserPermission) navigate("/unauthorized");
    fetchBalancesData();
  }, []);

  return (
    <CardBody
      className="p-3 bg-white"
      style={isMobile ? { width: "100%" } : { width: "78%" }}
    >
      <div className="text-center text-md-left mb-4">
        <h1 className="display-6 fw-bold text-primary">BALANCE LEAVES</h1>
      </div>
      <DataTableComponent
        columns={balanceLeavesColumn()}
        data={balanceData}
        loading={loading}
        pagination={false}
      />
    </CardBody>
  );
};

export default GetBalanceLeaves;
