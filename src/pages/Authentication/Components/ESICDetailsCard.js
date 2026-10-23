import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardBody, Row, Spinner } from "reactstrap";
import DocPreview from "./DocPreview";
import { getMyESICRecords } from "../../../helpers/backend_helper";

const ESICDetailsCard = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getMyESICRecords()
      .then((response) => {
        if (active) setRecords(response.data || []);
      })
      .catch(() => {
        if (active) setRecords([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const files = records.flatMap((record) =>
    (record.files || []).map((file) => ({ ...file, recordId: record._id })),
  );

  return (
    <Card>
      <CardHeader>
        <h5 className="mb-0">ESIC</h5>
      </CardHeader>
      <CardBody>
        {loading ? (
          <div className="text-center py-3">
            <Spinner size="sm" />
          </div>
        ) : files.length === 0 ? (
          <p className="text-muted mb-0">No ESIC documents available.</p>
        ) : (
          <Row>
            {files.map((file) => (
              <DocPreview
                key={`${file.recordId}-${file.path}`}
                label={file.originalName || file.name}
                url={file.url}
              />
            ))}
          </Row>
        )}
      </CardBody>
    </Card>
  );
};

export default ESICDetailsCard;
