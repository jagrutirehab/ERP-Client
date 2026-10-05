import React from "react";
import StockBalanceList from "./StockBalanceList";
import { usePermissions } from "../../../../Components/Hooks/useRoles.js";
import Basic404 from "../../../AuthenticationInner/Errors/Basic404";
import "../../UnitOfMeasurement/uom.scss";

const Stock = () => {
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canView = hasPermission("MASTERDATA", "STOCK", "READ");

  if (!canView) return <Basic404 />;

  return <StockBalanceList />;
};

export default Stock;