import React, { useCallback, useEffect, useState } from "react";
import { Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from "reactstrap";
import { renderDeclarationPages } from "../../../../helpers/backend_helper";
import { getErrorMessage } from "../../Helpers/learnHelpers";
import { defaultPlacements, hasSignature } from "../../Helpers/declaration";
import DocxPlacementEditor from "./DocxPlacementEditor";
import PdfPlacementEditor from "./PdfPlacementEditor";

const PlacementModal = ({ isOpen, file, onConfirm, onCancel }) => {
  const [data, setData] = useState(null);
  const [placements, setPlacements] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const response = await renderDeclarationPages(file);
      const loaded = response?.data;
      setData(loaded);
      setPlacements(defaultPlacements(loaded.format, loaded.pageCount || loaded.pages?.length));
    } catch (error) {
      setLoadError(getErrorMessage(error, "Could not load the declaration"));
    } finally {
      setLoading(false);
    }
  }, [file]);

  useEffect(() => {
    if (isOpen && file) load();
  }, [isOpen, file, load]);

  const ready = !loading && !loadError && !!placements && !!data;
  const canConfirm = ready && hasSignature(placements);

  return (
    <Modal isOpen={isOpen} toggle={onCancel} size="xl" centered scrollable>
      <ModalHeader toggle={onCancel}>Place the signature</ModalHeader>
      <ModalBody>
        {loading ? (
          <div className="text-center py-5">
            <Spinner color="primary" />
          </div>
        ) : loadError ? (
          <div className="text-center py-4">
            <p className="text-danger">{loadError}</p>
            <button className="btn btn-outline-primary btn-sm" onClick={load}>
              Try again
            </button>
          </div>
        ) : ready ? (
          data.format === "docx" ? (
            <DocxPlacementEditor
              html={data.html}
              addresses={data.addresses || {}}
              placements={placements}
              detected={data.autoFields || []}
              onChange={setPlacements}
            />
          ) : (
            <PdfPlacementEditor
              pages={data.pages || []}
              placements={placements}
              detected={data.autoFields || []}
              onChange={setPlacements}
            />
          )
        ) : null}
        {ready && !hasSignature(placements) && (
          <p className="text-danger small mt-2" data-testid="signature-required">
            Place the signature to continue.
          </p>
        )}
      </ModalBody>
      <ModalFooter>
        <button type="button" className="btn btn-primary" disabled={!canConfirm} onClick={() => onConfirm(placements)}>
          Confirm position
        </button>
        <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
          Cancel
        </button>
      </ModalFooter>
    </Modal>
  );
};

export default PlacementModal;
