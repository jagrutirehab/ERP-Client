import React, { useEffect, useState } from "react";
import { Button, ButtonGroup } from "reactstrap";
import ExitPending from "./ExitPending";
import FNFPending from "./FNFPending";


const PendingExits = ({ activeTab }) => {
  const subTabOptions = ["EXIT", "FNF"];
  const [activeSubTab, setActiveSubTab] = useState("EXIT");

  const handleTabSwitch = (tab) => {
    setActiveSubTab(tab);
  };

  useEffect(() => {
    setActiveSubTab("EXIT");
  }, [activeTab]);

  return (
    <div>
      <div className="d-flex justify-content-center mb-3">
        <ButtonGroup style={{ gap: "8px" }}>
          {subTabOptions.map((tab) => (
            <Button
              key={tab}
              size="sm"
              onClick={() => handleTabSwitch(tab)}
              color={activeSubTab === tab ? "primary" : "light"}
              style={{
                minWidth: "100px",
                fontWeight: 600,
                borderRadius: "6px",
                border:
                  activeSubTab === tab ? "none" : "1px solid #ccc",
                backgroundColor:
                  activeSubTab === tab ? "#0d6efd" : "transparent",
                color: activeSubTab === tab ? "#fff" : "#333",
                transition: "all 0.2s ease-in-out",
                boxShadow:
                  activeSubTab === tab
                    ? "0px 0px 6px rgba(0,0,0,0.15)"
                    : "none",
              }}
            >
              {tab === "EXIT" ? "Exit Pending" : "FNF Pending"}
            </Button>
          ))}
        </ButtonGroup>
      </div>

      {activeSubTab === "EXIT" && <ExitPending activeSubTab={activeSubTab} activeTab={activeTab} />}
      {activeSubTab === "FNF" && <FNFPending activeSubTab={activeSubTab} activeTab={activeTab} />}
    </div>
  );
};

export default PendingExits;
