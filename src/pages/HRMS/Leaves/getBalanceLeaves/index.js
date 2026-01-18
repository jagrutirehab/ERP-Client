import React, { useEffect, useState } from "react";
import { getBalance } from "../../../../helpers/backend_helper";
import { CardBody } from "reactstrap";
import DataTableComponent from "../../components/Table/DataTable";
import { balanceLeavesColumn } from "../../components/Table/Columns/balanceLeaves";
import { useMediaQuery } from "../../../../Components/Hooks/useMediaQuery";

const GetBalanceLeaves = () => {
  const [balanceData, setBalanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const isMobile = useMediaQuery("(max-width: 1000px)");

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
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
