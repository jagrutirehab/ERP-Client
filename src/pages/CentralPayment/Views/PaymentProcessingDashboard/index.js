import React, { useState } from "react";
import {
    Nav,
    NavItem,
    NavLink,
    TabContent,
    TabPane
} from "reactstrap";
import classnames from "classnames";
import ProcessPayment from "./Views/ProcessPayment";
import CompletePayment from "./Views/UTRConfirmation";

const PaymentProcessingDashboard = () => {
    const [activeTab, setActiveTab] = useState("PROCESS_PAYMENT");

    const toggle = (tab) => {
        if (activeTab !== tab) setActiveTab(tab);
    };

    return (
        <div className="p-3">

            <Nav tabs>
                <NavItem>
                    <NavLink
                        className={classnames({ active: activeTab === "PROCESS_PAYMENT" })}
                        onClick={() => toggle("PROCESS_PAYMENT")}
                        style={{ cursor: "pointer" }}
                    >
                        Process Payment
                    </NavLink>
                </NavItem>

                <NavItem>
                    <NavLink
                        className={classnames({ active: activeTab === "UTR_CONFIRMATION" })}
                        onClick={() => toggle("UTR_CONFIRMATION")}
                        style={{ cursor: "pointer" }}
                    >
                        UTR Confirmation
                    </NavLink>
                </NavItem>
            </Nav>

            <TabContent activeTab={activeTab} className="mt-3">
                <TabPane tabId="PROCESS_PAYMENT">
                    <ProcessPayment activeTab={activeTab} />
                </TabPane>

                <TabPane tabId="UTR_CONFIRMATION">
                    <CompletePayment activeTab={activeTab} />
                </TabPane>
            </TabContent>

        </div>
    );
};

export default PaymentProcessingDashboard;
