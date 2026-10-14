import React, { useCallback, useEffect, useState } from "react";
import { Spinner } from "reactstrap";
import { toast } from "react-toastify";
import {
  getDeclarationPreview,
  markDeclarationRead,
} from "../../../../helpers/backend_helper";
import { getErrorMessage } from "../../Helpers/learnHelpers";
import DeclarationView from "../Declaration/DeclarationView";

const DeclarationReadStep = ({ trainingId, onRead }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [marking, setMarking] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const response = await getDeclarationPreview(trainingId);
      setData(response?.data || null);
    } catch (error) {
      setLoadError(getErrorMessage(error, "Could not load the declaration"));
    } finally {
      setLoading(false);
    }
  }, [trainingId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkRead = async () => {
    try {
      setMarking(true);
      await markDeclarationRead(trainingId);
      toast.success("Marked as read");
      if (onRead) onRead();
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not mark the declaration as read"));
    } finally {
      setMarking(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5" data-testid="declaration-loading">
        <Spinner color="primary" />
      </div>
    );
  }

  if (loadError || !data) {
    return (
      <div className="text-center py-4 border rounded">
        <p className="text-danger mb-2">{loadError || "The declaration could not be loaded."}</p>
        <p className="text-muted small mb-3">
          You cannot continue until you have been able to read the declaration.
        </p>
        <button className="btn btn-outline-primary btn-sm" onClick={load}>
          Try again
        </button>
      </div>
    );
  }

  const alreadyRead = data.state === "completed";

  return (
    <div data-testid="declaration-step">
      <h6 className="fw-semibold mb-1">Declaration</h6>
      <p className="text-muted small mb-2">
        Read every part. Your signature will be applied when you acknowledge.
      </p>
      {data.signatureName && (
        <p className="small mb-3" data-testid="signing-as">
          Signing as <strong>{data.signatureName}</strong>
        </p>
      )}
      <DeclarationView data={data} className="mb-3" />
      {alreadyRead ? (
        <div className="d-flex align-items-center gap-3 p-3 border rounded">
          <span className="text-success small fw-semibold">
            <i className="ri-checkbox-circle-fill me-1" />
            You have read this declaration
          </span>
          <button className="btn btn-primary btn-sm ms-auto" onClick={() => onRead && onRead()}>
            Continue to acknowledgement
          </button>
        </div>
      ) : (
        <div className="p-3 border rounded">
          <button className="btn btn-primary" disabled={marking} onClick={handleMarkRead}>
            {marking ? <Spinner size="sm" /> : "Mark as read"}
          </button>
        </div>
      )}
    </div>
  );
};

export default DeclarationReadStep;
