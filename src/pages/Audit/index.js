import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  CardBody,
  Nav,
  NavItem,
  NavLink,
  Spinner,
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import classnames from "classnames";
import { usePermissions } from "../../Components/Hooks/useRoles";
import FloorPhotos from "./FloorPhotos";
import Verification from "./Verification";

const Audit = () => {
  const navigate = useNavigate();

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { loading: permissionLoader, hasPermission } = usePermissions(token);
  const hasUserPermission = hasPermission("AUDIT", "FLOOR_PHOTOS", "READ");
  const hasWrite = hasPermission("AUDIT", "FLOOR_PHOTOS", "WRITE");
  const hasDelete = hasPermission("AUDIT", "FLOOR_PHOTOS", "DELETE");

  const [tab, setTab] = useState("photos");

  useEffect(() => {
    if (!permissionLoader && !hasUserPermission) {
      navigate("/unauthorized");
    }
  }, [permissionLoader, hasUserPermission]);

  if (permissionLoader) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <Spinner color="primary" />
      </div>
    );
  }

  document.title = "Audit";

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <div className="mb-4">
            <h4 className="fw-semibold mb-1">Audit</h4>
            <p className="text-muted small mb-0">
              Upload and verify floor photos for each center
            </p>
          </div>

          <Card>
            <CardBody>
              <Nav tabs className="mb-3">
                {[
                  { key: "photos", label: "Floor Photos" },
                  { key: "verification", label: "Verification" },
                ].map((item) => (
                  <NavItem key={item.key}>
                    <NavLink
                      className={classnames({ active: tab === item.key })}
                      onClick={() => setTab(item.key)}
                      style={{ cursor: "pointer", fontWeight: 500 }}
                    >
                      {item.label}
                    </NavLink>
                  </NavItem>
                ))}
              </Nav>

              {tab === "photos" ? (
                <FloorPhotos hasWrite={hasWrite} hasDelete={hasDelete} />
              ) : (
                <Verification hasWrite={hasWrite} />
              )}
            </CardBody>
          </Card>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Audit;
