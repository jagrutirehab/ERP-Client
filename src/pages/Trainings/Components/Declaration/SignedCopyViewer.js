import React, { useEffect, useState } from "react";
import { Modal, ModalBody, ModalHeader, Spinner } from "reactstrap";
import { getErrorMessage } from "../../Helpers/learnHelpers";

const DOCX_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const SignedCopyViewer = ({ isOpen, onClose, title = "Signed declaration", loader }) => {
  const [url, setUrl] = useState(null);
  const [isDocx, setIsDocx] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;
    let objectUrl = null;
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await loader();
        if (cancelled) return;
        const type = response.headers?.["content-type"] || response.data?.type || "application/pdf";
        const docx = /wordprocessingml/.test(type) || type === DOCX_TYPE;
        objectUrl = URL.createObjectURL(new Blob([response.data], { type: docx ? DOCX_TYPE : "application/pdf" }));
        setIsDocx(docx);
        setUrl(objectUrl);
      } catch (loadError) {
        if (!cancelled) setError(getErrorMessage(loadError, "Could not open the signed declaration"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setUrl(null);
    };
  }, [isOpen, loader]);

  return (
    <Modal isOpen={isOpen} toggle={onClose} size={isDocx ? "md" : "xl"} centered>
      <ModalHeader toggle={onClose}>{title}</ModalHeader>
      <ModalBody>
        {loading && (
          <div className="text-center py-5">
            <Spinner color="primary" />
          </div>
        )}
        {error && <p className="text-danger text-center py-4">{error}</p>}
        {url && !isDocx && (
          <>
            <iframe title={title} src={url} style={{ width: "100%", height: "70vh", border: 0 }} />
            <div className="text-center mt-2">
              <a href={url} target="_blank" rel="noreferrer" className="btn btn-outline-primary btn-sm">
                Open in a new tab
              </a>
            </div>
          </>
        )}
        {url && isDocx && (
          <div className="text-center py-3" data-testid="docx-download">
            <p className="text-muted small">This declaration is a Word document. Download it to open it.</p>
            <a href={url} download="signed-declaration.docx" className="btn btn-primary btn-sm">
              Download signed declaration
            </a>
          </div>
        )}
      </ModalBody>
    </Modal>
  );
};

export default SignedCopyViewer;
