import React, { useState } from "react";
import "@testing-library/jest-dom";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
  within,
} from "@testing-library/react";

import PsychologicalTestsControl from "./PsychologicalTestsControl";
import PsychologicalTestsStatusModal from "./PsychologicalTestsStatusModal";

// Store-free: `onSubmit` (IPD's handler) is the only side effect.

const REASON_1 = "The psychological tests are not relevant to the diagnosis.";
const REASON_2 =
  "The family has refused to pay the additional charges or has declined testing.";
const NA_TITLE = "Psychological Tests Not Applicable";
const REOPEN_TITLE = "Reopen Psychological Tests";

const applicable = () => ({ _id: "adm-1", psychologicalTestHistory: [] });
const notApplicable = () => ({
  _id: "adm-1",
  psychologicalTestHistory: [
    {
      status: "NOT_APPLICABLE",
      reasonCode: "FAMILY_DECLINED",
      assignedAt: "2026-10-06T08:30:00.000Z",
      recordedAt: "2026-10-06T08:30:00.000Z",
      revokedAt: null,
      author: "u1",
      authorName: "Dr Asha Rao",
    },
  ],
});

const submitButton = () => screen.queryByRole("button", { name: /submit/i });
const dialogGone = () =>
  waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

const renderModal = (props = {}) => {
  const all = {
    isOpen: true,
    toggle: jest.fn(),
    addmission: applicable(),
    nextStatus: "NOT_APPLICABLE",
    onSubmit: jest.fn().mockResolvedValue(true),
    ...props,
  };
  const utils = render(<PsychologicalTestsStatusModal {...all} />);
  return { ...utils, props: all };
};

describe("PsychologicalTestsStatusModal — marking Not Applicable", () => {
  it("renders nothing while closed", () => {
    renderModal({ isOpen: false });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("offers exactly the two reasons, and no Submit until one is chosen", () => {
    renderModal();
    expect(screen.getByText(NA_TITLE)).toBeInTheDocument();

    const group = screen.getByRole("radiogroup", { name: /reason/i });
    const radios = within(group).getAllByRole("radio");
    expect(radios).toHaveLength(2);
    expect(within(group).getByLabelText(REASON_1)).toBeInTheDocument();
    expect(within(group).getByLabelText(REASON_2)).toBeInTheDocument();
    // Single select: one radio group name.
    expect(radios[0]).toHaveAttribute("name", radios[1].getAttribute("name"));

    expect(submitButton()).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(REASON_2));
    expect(submitButton()).toBeInTheDocument();
  });

  it("submits the chosen reason code and closes on success", async () => {
    const { props } = renderModal();
    fireEvent.click(screen.getByLabelText(REASON_1));
    await act(async () => {
      fireEvent.click(submitButton());
    });

    expect(props.onSubmit).toHaveBeenCalledWith("adm-1", {
      status: "NOT_APPLICABLE",
      reasonCode: "NOT_RELEVANT_TO_DIAGNOSIS",
    });
    expect(props.toggle).toHaveBeenCalledTimes(1);
  });

  it("shows Saving… and disables the form while the request is in flight", async () => {
    let resolve;
    const onSubmit = jest.fn(
      () =>
        new Promise((r) => {
          resolve = r;
        }),
    );
    const { props } = renderModal({ onSubmit });
    fireEvent.click(screen.getByLabelText(REASON_1));
    fireEvent.click(submitButton());

    expect(
      await screen.findByRole("button", { name: /saving/i }),
    ).toBeDisabled();
    for (const radio of screen.getAllByRole("radio")) {
      expect(radio).toBeDisabled();
    }
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();

    await act(async () => resolve(true));
    expect(props.toggle).toHaveBeenCalledTimes(1);
  });

  it("stays open with the selection kept when the save fails", async () => {
    const { props } = renderModal({
      onSubmit: jest.fn().mockResolvedValue(false),
    });
    fireEvent.click(screen.getByLabelText(REASON_2));
    await act(async () => {
      fireEvent.click(submitButton());
    });

    expect(props.toggle).not.toHaveBeenCalled();
    expect(screen.getByLabelText(REASON_2)).toBeChecked();
    expect(submitButton()).not.toBeDisabled();
  });

  it("Cancel closes without submitting", () => {
    const { props } = renderModal();
    fireEvent.click(screen.getByLabelText(REASON_1));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(props.toggle).toHaveBeenCalledTimes(1);
    expect(props.onSubmit).not.toHaveBeenCalled();
  });

  it("starts every open with an empty form", async () => {
    const { props, rerender } = renderModal();
    fireEvent.click(screen.getByLabelText(REASON_1));
    expect(submitButton()).toBeInTheDocument();

    rerender(<PsychologicalTestsStatusModal {...props} isOpen={false} />);
    await dialogGone();
    rerender(<PsychologicalTestsStatusModal {...props} isOpen />);

    expect(screen.getByLabelText(REASON_1)).not.toBeChecked();
    expect(submitButton()).not.toBeInTheDocument();
  });
});

describe("PsychologicalTestsStatusModal — reopening", () => {
  it("needs a written reason — whitespace does not count — and trims it", async () => {
    const { props } = renderModal({
      addmission: notApplicable(),
      nextStatus: "APPLICABLE",
    });
    expect(screen.getByText(REOPEN_TITLE)).toBeInTheDocument();
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();

    const textarea = screen.getByRole("textbox", { name: /reason/i });
    expect(textarea).toHaveAttribute("maxLength", "500");
    expect(submitButton()).not.toBeInTheDocument();

    fireEvent.change(textarea, { target: { value: "   " } });
    expect(submitButton()).not.toBeInTheDocument();

    fireEvent.change(textarea, { target: { value: "  Diagnosis revised  " } });
    await act(async () => {
      fireEvent.click(submitButton());
    });

    expect(props.onSubmit).toHaveBeenCalledWith("adm-1", {
      status: "APPLICABLE",
      reason: "Diagnosis revised",
    });
    expect(props.toggle).toHaveBeenCalledTimes(1);
  });
});

// Wired exactly as IPD.js wires them: the control sets a { admissionId,
// nextStatus } target, the dialog opens for that admission, and closing clears
// the target.
const IpdLikeHarness = ({ addmission, onSubmit, onClose = () => {} }) => {
  const [target, setTarget] = useState(null);
  return (
    <>
      <PsychologicalTestsControl
        addmission={addmission}
        onRequestChange={(admissionId, nextStatus) =>
          setTarget({ admissionId, nextStatus })
        }
      />
      <PsychologicalTestsStatusModal
        isOpen={target?.admissionId === addmission._id}
        toggle={() => {
          onClose();
          setTarget(null);
        }}
        addmission={addmission}
        nextStatus={target?.nextStatus}
        onSubmit={onSubmit}
      />
    </>
  );
};

describe("Psychological tests — control and dialog together", () => {
  it("Not Applicable opens the dialog; a successful Submit closes it", async () => {
    const onSubmit = jest.fn().mockResolvedValue(true);
    render(<IpdLikeHarness addmission={applicable()} onSubmit={onSubmit} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Not Applicable" }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText(NA_TITLE)).toBeInTheDocument();

    fireEvent.click(within(dialog).getByLabelText(REASON_2));
    await act(async () => {
      fireEvent.click(submitButton());
    });

    expect(onSubmit).toHaveBeenCalledWith("adm-1", {
      status: "NOT_APPLICABLE",
      reasonCode: "FAMILY_DECLINED",
    });
    await dialogGone();
  });

  it("keeps showing the Reopen dialog while it fades out", async () => {
    // IPD clears nextStatus the moment the dialog closes. Without the held
    // status, the fading dialog would flip to the Not Applicable one.
    const onClose = jest.fn();
    render(
      <IpdLikeHarness
        addmission={notApplicable()}
        onSubmit={jest.fn().mockResolvedValue(true)}
        onClose={onClose}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Reopen" }));
    fireEvent.change(screen.getByRole("textbox", { name: /reason/i }), {
      target: { value: "Diagnosis revised" },
    });
    await act(async () => {
      fireEvent.click(submitButton());
    });

    // Closing has begun (the target is cleared) but the dialog is still
    // fading out — and it is still the one that was confirmed.
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(REOPEN_TITLE)).toBeInTheDocument();
    expect(screen.queryByText(NA_TITLE)).not.toBeInTheDocument();

    await dialogGone();
  });
});
