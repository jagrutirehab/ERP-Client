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
import WeekOffModal from "../../Policies/WeekOffModal";

const GetBalanceLeaves = () => {
  const [balanceData, setBalanceData] = useState([]);
  const [weekOffPolicy, setWeekOffPolicy] = useState(null);
  const [weekOffModal, setWeekOffModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const isMobile = useMediaQuery("(max-width: 1000px)");
  const handleAuthError = useAuthError();
  const navigate = useNavigate();

  const token = JSON.parse(localStorage.getItem("user"))?.token;
  const { hasPermission } = usePermissions(token);
  const hasUserPermission = hasPermission("HR", "BALANCE_LEAVES", "READ");

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
      setWeekOffPolicy(res?.weekOffs || null);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error.message || "Failed to fetch data");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasUserPermission) {
      navigate("/unauthorized");
      return;
    }
    fetchBalancesData();
  }, []);

  const openWeekOffModal = () => {
    setWeekOffModal(true);
  };

  return (
    <CardBody
      className="p-3 bg-white"
      style={isMobile ? { width: "100%" } : { width: "78%" }}
    >
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="display-6 fw-bold text-primary mb-0">BALANCE LEAVES</h1>

        {weekOffPolicy && (
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={openWeekOffModal}
          >
            View Week Off Policy
          </button>
        )}
      </div>

      <DataTableComponent
        columns={balanceLeavesColumn()}
        data={balanceData}
        loading={loading}
        pagination={false}
      />

      <WeekOffModal
        isOpen={weekOffModal}
        toggle={() => setWeekOffModal(false)}
        row={{
          policyName: "Week Off Policy",
          weekOffs: weekOffPolicy,
        }}
      />
    </CardBody>
  );
};

export default GetBalanceLeaves;
