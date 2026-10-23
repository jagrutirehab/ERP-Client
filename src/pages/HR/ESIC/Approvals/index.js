import React, { useEffect, useRef, useState } from "react";
import {
  CardBody,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Row,
  Col,
  Input,
} from "reactstrap";
import Select from "react-select";
import classnames from "classnames";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "../../../../Components/Hooks/useMediaQuery";
import { usePermissions } from "../../../../Components/Hooks/useRoles";
import { useCenterOptions } from "../../../../Components/Hooks/useCenterOptions";
import ESICRecordsList from "./ESICRecordsList";

const TABS = [
  { key: "PENDING", label: "Pending" },
  { key: "APPROVED", label: "Approved" },
  { key: "REJECTED", label: "Rejected" },
];

const ESICApprovals = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { hasPermission, loading: permissionLoading } = usePermissions(token);
  const hasReadPermission = hasPermission("HR", "ESIC_APPROVAL", "READ");

  const [activeTab, setActiveTab] = useState("PENDING");
  const [selectedCenter, setSelectedCenter] = useState("");
  const [search, setSearch] = useState("");
  const centerOptions = useCenterOptions({ includeAll: true });
  const user = useSelector((state) => state.User);
  const hasSetDefaultCenter = useRef(false);

  useEffect(() => {
    if (!permissionLoading && !hasReadPermission) {
      navigate("/unauthorized");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissionLoading, hasReadPermission]);

  // Default to "All Centers" (or the user's one accessible center) as soon
  // as the options are available, so the page shows data on first load
  // instead of the deliberately-empty "nothing selected" state. Only runs
  // once — clearing the filter afterwards should stay cleared.
  useEffect(() => {
    if (hasSetDefaultCenter.current || centerOptions.length === 0) return;
    hasSetDefaultCenter.current = true;
    const hasAllOption = centerOptions.some((option) => option.value === "ALL");
    setSelectedCenter(hasAllOption ? "ALL" : centerOptions[0].value);
  }, [centerOptions]);

  // If the filter is explicitly cleared back to nothing selected, send no
  // centers at all, so the server returns an empty result set.
  const centers =
    selectedCenter === ""
      ? []
      : selectedCenter === "ALL"
      ? user?.centerAccess || []
      : [selectedCenter];

  const selectedCenterOption =
    centerOptions.find((option) => option.value === selectedCenter) || null;

  if (permissionLoading) return null;

  return (
    <CardBody
      className="bg-white"
      style={
        isMobile
          ? {
              width: "100%",
              paddingLeft: "1rem",
              paddingRight: "1rem",
              paddingBottom: "1rem",
            }
          : { width: "78%" }
      }
    >
      <div className="px-3 pt-3">
        <h5 className="mb-1">ESIC Approvals</h5>
      </div>
      <hr className="mb-2 border-secondary" />
      <div className="px-3">
        <Row className="mb-3 g-2">
          <Col md={4}>
            <Select
              value={selectedCenterOption}
              onChange={(option) => setSelectedCenter(option?.value || "")}
              options={centerOptions}
              placeholder="Select Center"
              isClearable
              classNamePrefix="react-select"
            />
          </Col>
          <Col md={4}>
            <Input
              type="text"
              placeholder="Search by name or employee code"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </Col>
        </Row>

        <Nav tabs>
          {TABS.map((tab) => (
            <NavItem key={tab.key}>
              <NavLink
                className={classnames({ active: activeTab === tab.key })}
                onClick={() => setActiveTab(tab.key)}
                role="button"
              >
                {tab.label}
              </NavLink>
            </NavItem>
          ))}
        </Nav>
        <TabContent activeTab={activeTab} className="pt-3">
          {TABS.map((tab) => (
            <TabPane tabId={tab.key} key={tab.key}>
              {activeTab === tab.key && (
                <ESICRecordsList
                  status={tab.key}
                  centers={centers}
                  search={search}
                />
              )}
            </TabPane>
          ))}
        </TabContent>
      </div>
    </CardBody>
  );
};

export default ESICApprovals;
