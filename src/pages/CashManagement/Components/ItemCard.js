import moment from "moment";
import { capitalizeWords } from "../../../utils/toCapitalize";
import { Badge, Card, CardBody, Col, Row } from "reactstrap";
import { FileText } from "lucide-react";
import PropTypes from "prop-types";
import { downloadFile } from "../../../Components/Common/downloadFile";
import { ExpandableText } from "../../../Components/Common/ExpandableText";

const ItemCard = ({ item, type }) => {
  return (
    <Card className="mb-3 border-0 shadow-sm hover-shadow transition-all">
      <CardBody className="py-3">
        <Row className="align-items-center">
          <Col md={8}>
            <div className="d-flex align-items-center mb-2">
              <Badge color="primary" className="me-2">
                {capitalizeWords(item.center.title)}
              </Badge>
              <i className="text-muted">
                {moment(item.createdAt).format("lll")}
              </i>
            </div>
            {item.summary && (
              <h6 className="mb-1 fw-bold text-dark">
                {capitalizeWords(item.summary)}
              </h6>
            )}
            {item.comments && (
              <ExpandableText text={capitalizeWords(item.comments)} />
            )}
            {item.attachment && (
              <div
                className="d-flex align-items-center text-primary"
                style={{ textDecoration: "underline", cursor: "pointer" }}
                onClick={() => downloadFile(item.attachment)}
              >
                <FileText size={14} className="me-1" />
                <span>{item.attachment.originalName}</span>
              </div>
            )}
          </Col>
          <Col md={4} className="text-end">
            <div className="d-flex align-items-center justify-content-end">
              <span
                className={`h5 mb-0 fw-bold ${
                  type === "BASEBALANCE" ? "text-success" : "text-danger"
                }`}
              >
                {type === "BASEBALANCE" ? "+" : "-"} ₹{item.amount.toFixed(2)}
              </span>
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

ItemCard.prototype = {
  item: PropTypes.object,
  type: PropTypes.string,
};

export default ItemCard;
