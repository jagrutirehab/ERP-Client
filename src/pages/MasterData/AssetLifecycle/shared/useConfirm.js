import React, { useCallback, useRef, useState } from "react";
import { Button, Modal, ModalBody } from "reactstrap";

// A confirm popup that replaces the browser's window.confirm.
//   const [confirm, confirmDialog] = useConfirm();
//   if (!(await confirm({ title: "Approve request", message: "...", confirmText: "Approve" }))) return;
// Put {confirmDialog} anywhere in the page's JSX.
export const useConfirm = () => {
  const [state, setState] = useState(null);
  const resolver = useRef(null);

  const confirm = useCallback(
    (options = {}) =>
      new Promise((resolve) => {
        resolver.current = resolve;
        setState({ title: "Are you sure?", confirmText: "Confirm", cancelText: "Cancel", danger: false, ...options });
      }),
    [],
  );

  const close = (answer) => {
    const resolve = resolver.current;
    resolver.current = null;
    setState(null);
    if (resolve) resolve(answer);
  };

  const dialog = (
    <Modal isOpen={!!state} toggle={() => close(false)} centered size="md">
      <ModalBody className="p-4">
        {state && (
          <>
            <h5 className="mb-2">{state.title}</h5>
            <p className="text-muted mb-4" style={{ whiteSpace: "pre-line" }}>
              {state.message}
            </p>
            <div className="d-flex justify-content-end gap-2">
              <Button color="light" onClick={() => close(false)}>
                {state.cancelText}
              </Button>
              <Button color={state.danger ? "danger" : "primary"} onClick={() => close(true)}>
                {state.confirmText}
              </Button>
            </div>
          </>
        )}
      </ModalBody>
    </Modal>
  );

  return [confirm, dialog];
};

export default useConfirm;
