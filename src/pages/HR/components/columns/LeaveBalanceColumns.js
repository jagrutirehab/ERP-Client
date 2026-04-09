import Highlighter from "react-highlight-words";
import { capitalizeWords } from "../../../../utils/toCapitalize";

export const leaveBalanceColumns = ({ searchText }) => [
    {
        name: <div>ECode</div>,
        selector: row => row?.eCode || "-",
        cell: row => (
            <Highlighter
                highlightClassName="react-highlight"
                searchWords={[searchText]}
                autoEscape
                textToHighlight={`${row?.eCode || ""}`}
            />
        ),
        width: "100px",
    },
    {
        name: <div>Name</div>,
        selector: row => row?.name?.toUpperCase() || "-",
        cell: row => (
            <Highlighter
                highlightClassName="react-highlight"
                searchWords={[searchText]}
                autoEscape
                textToHighlight={`${row?.name?.toUpperCase() || ""}`}
            />
        ),
        wrap: true,
        minWidth: "160px",
    },
    {
        name: <div>Center</div>,
        selector: row => capitalizeWords(row?.currentLocation?.title || "-"),
        wrap: true,
        minWidth: "120px",
    },
    {
        name: <div>Current Status</div>,
        selector: (row) =>
            row?.status === "ACTIVE"
                ? "Active"
                : row?.status === "FNF_CLOSED"
                    ? "FNF Closed"
                    : "Resigned",
        wrap: true,
    },
    {
        name: <div>Policy (Year)</div>,
        selector: row => row?.policyName ? `${row?.policyName || "-"} (${row?.year || "-"})` : "-",
        wrap: true,
        minWidth: "150px",
    },
    {
        name: <div>Earned Leave</div>,
        selector: row => row?.leaveData?.earnedLeaves?.balance || 0,
        cell: row => {
            const el = row?.leaveData?.earnedLeaves;
            return (
                <div className="py-2" style={{ width: "100%" }}>
                    <div style={{ display: "flex", borderBottom: "1px solid #f0f0f0", paddingBottom: "2px", marginBottom: "2px" }}>
                        <b style={{ width: "80px" }}>Spent:</b> <span>{el?.spent || 0}</span>
                    </div>
                    <div style={{ display: "flex", borderBottom: "1px solid #f0f0f0", paddingBottom: "2px", marginBottom: "2px" }}>
                        <b style={{ width: "80px" }}>Balance:</b> <span>{el?.balance || 0}</span>
                    </div>
                    <div style={{ display: "flex" }}>
                        <b style={{ width: "80px" }}>Total:</b> <span>{el?.total || 0}</span>
                    </div>
                </div>
            );
        },
        minWidth: "130px",
    },
    {
        name: <div>Festive Leave</div>,
        selector: row => row?.leaveData?.festiveLeaves?.balance || 0,
        cell: row => {
            const fl = row?.leaveData?.festiveLeaves;
            return (
                <div className="py-2" style={{ width: "100%" }}>
                    <div style={{ display: "flex", borderBottom: "1px solid #f0f0f0", paddingBottom: "2px", marginBottom: "2px" }}>
                        <b style={{ width: "80px" }}>Spent:</b> <span>{fl?.spent || 0}</span>
                    </div>
                    <div style={{ display: "flex", borderBottom: "1px solid #f0f0f0", paddingBottom: "2px", marginBottom: "2px" }}>
                        <b style={{ width: "80px" }}>Balance:</b> <span>{fl?.balance || 0}</span>
                    </div>
                    <div style={{ display: "flex" }}>
                        <b style={{ width: "80px" }}>Total:</b> <span>{fl?.total || 0}</span>
                    </div>
                </div>
            );
        },
        minWidth: "130px",
    },
    {
        name: <div>Comp Offs</div>,
        selector: row => row?.leaveData?.compOff?.balance || 0,
        cell: row => {
            const fl = row?.leaveData?.compOff;
            return (
                <div className="py-2" style={{ width: "100%" }}>
                    <div style={{ display: "flex", borderBottom: "1px solid #f0f0f0", paddingBottom: "2px", marginBottom: "2px" }}>
                        <b style={{ width: "80px" }}>Spent:</b> <span>{fl?.spent || 0}</span>
                    </div>
                    <div style={{ display: "flex", borderBottom: "1px solid #f0f0f0", paddingBottom: "2px", marginBottom: "2px" }}>
                        <b style={{ width: "80px" }}>Balance:</b> <span>{fl?.balance || 0}</span>
                    </div>
                    <div style={{ display: "flex" }}>
                        <b style={{ width: "80px" }}>Total:</b> <span>{fl?.total || 0}</span>
                    </div>
                </div>
            );
        },
        minWidth: "130px",
    },
    {
        name: <div>Week Offs</div>,
        selector: row => row?.leaveData?.weekOffs?.spent || 0,
        cell: row => {
            const wo = row?.leaveData?.weekOffs;
            return (
                <div className="py-2" style={{ width: "100%" }}>
                    <div style={{ display: "flex", borderBottom: "1px solid #f0f0f0", paddingBottom: "2px", marginBottom: "2px" }}>
                        <b style={{ width: "80px" }}>Applied:</b> <span>{wo?.taken || 0}</span>
                    </div>
                    <div style={{ display: "flex" }}>
                        <b style={{ width: "80px" }}>Approved:</b> <span>{wo?.spent || 0}</span>
                    </div>
                </div>
            );
        },
        minWidth: "120px",
    },
    
    {
        name: <div>Unpaid Leave(Spent)</div>,
        selector: row => row?.leaveData?.unpaidLeaves?.spent || 0,
        center: true
    },
];
