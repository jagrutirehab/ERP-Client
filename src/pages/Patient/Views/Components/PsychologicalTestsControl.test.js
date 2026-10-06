import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { format } from "date-fns";

import PsychologicalTestsControl from "./PsychologicalTestsControl";

// Presentational — no store needed. `onSubmit` is the only side effect.

const REASON_1 = "The psychological tests are not relevant to the diagnosis.";
const REASON_2 =
  "The family has refused to pay the additional charges or has declined testing.";
const RECORDED_AT = "2026-10-06T08:30:00.000Z";

const applicable = (extra = {}) => ({
  _id: "adm-1",
  psychologicalTestHistory: [],
  ...extra,
});

const notApplicable = (extra = {}) => ({
  _id: "adm-1",
  psychologicalTestHistory: [
    {
      status: "NOT_APPLICABLE",
      reasonCode: "FAMILY_DECLINED",
      assignedAt: RECORDED_AT,
      recordedAt: RECORDED_AT,
      revokedAt: null,
      author: "u1",
      authorName: "Dr Asha Rao",
    },
  ],
  ...extra,
});

const submitButton = () => screen.queryByRole("button", { name: /submit/i });

describe("PsychologicalTestsControl — marking Not Applicable", () => {
  it("shows only the Not Applicable action until it is clicked", () => {
    render(
      <PsychologicalTestsControl addmission={applicable()} onSubmit={jest.fn()} />,
    );
    expect(screen.getByText("Psychological Tests:")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Not Applicable" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    expect(submitButton()).not.toBeInTheDocument();
  });

  it("reveals exactly the two reasons, and no Submit until one is chosen", () => {
    render(
      <PsychologicalTestsControl addmission={applicable()} onSubmit={jest.fn()} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Not Applicable" }));

    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(2);
    expect(screen.getByLabelText(REASON_1)).toBeInTheDocument();
    expect(screen.getByLabelText(REASON_2)).toBeInTheDocument();
    // Single select: both radios share one group name.
    expect(radios[0]).toHaveAttribute("name", radios[1].getAttribute("name"));

    expect(submitButton()).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(REASON_2));
    expect(submitButton()).toBeInTheDocument();
  });

  it("submits the chosen reason code and closes on success", async () => {
    const onSubmit = jest.fn().mockResolvedValue(true);
    render(
      <PsychologicalTestsControl addmission={applicable()} onSubmit={onSubmit} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Not Applicable" }));
    fireEvent.click(screen.getByLabelText(REASON_1));
    fireEvent.click(submitButton());

    expect(onSubmit).toHaveBeenCalledWith("adm-1", {
      status: "NOT_APPLICABLE",
      reasonCode: "NOT_RELEVANT_TO_DIAGNOSIS",
    });
    await waitFor(() =>
      expect(screen.queryByRole("radio")).not.toBeInTheDocument(),
    );
  });

  it("shows Saving… and disables the form while the request is in flight", async () => {
    let resolve;
    const onSubmit = jest.fn(
      () => new Promise((r) => {
        resolve = r;
      }),
    );
    render(
      <PsychologicalTestsControl addmission={applicable()} onSubmit={onSubmit} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Not Applicable" }));
    fireEvent.click(screen.getByLabelText(REASON_1));
    fireEvent.click(submitButton());

    expect(
      await screen.findByRole("button", { name: /saving/i }),
    ).toBeDisabled();
    for (const radio of screen.getAllByRole("radio")) {
      expect(radio).toBeDisabled();
    }
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();

    resolve(true);
    await waitFor(() =>
      expect(screen.queryByRole("radio")).not.toBeInTheDocument(),
    );
  });

  it("keeps the panel and the selection when the save fails", async () => {
    const onSubmit = jest.fn().mockResolvedValue(false);
    render(
      <PsychologicalTestsControl addmission={applicable()} onSubmit={onSubmit} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Not Applicable" }));
    fireEvent.click(screen.getByLabelText(REASON_2));
    fireEvent.click(submitButton());

    await waitFor(() => expect(submitButton()).not.toBeDisabled());
    expect(screen.getByLabelText(REASON_2)).toBeChecked();
    expect(submitButton()).toBeInTheDocument();
  });

  it("Cancel closes the panel and forgets the selection", () => {
    render(
      <PsychologicalTestsControl addmission={applicable()} onSubmit={jest.fn()} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Not Applicable" }));
    fireEvent.click(screen.getByLabelText(REASON_1));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Not Applicable" }));
    expect(screen.getByLabelText(REASON_1)).not.toBeChecked();
    expect(submitButton()).not.toBeInTheDocument();
  });
});

describe("PsychologicalTestsControl — recorded Not Applicable", () => {
  it("shows who, the date and time, and the reason", () => {
    render(
      <PsychologicalTestsControl
        addmission={notApplicable()}
        onSubmit={jest.fn()}
      />,
    );
    expect(screen.getByText("Not Applicable")).toBeInTheDocument();
    const expectedWhen = format(new Date(RECORDED_AT), "dd MMM yyyy, hh:mm a");
    expect(
      screen.getByText(`by Dr Asha Rao · ${expectedWhen}`),
    ).toBeInTheDocument();
    expect(screen.getByText(`Reason: ${REASON_2}`)).toBeInTheDocument();
    // No "Not Applicable" BUTTON once it is recorded — only the badge.
    expect(
      screen.queryByRole("button", { name: "Not Applicable" }),
    ).not.toBeInTheDocument();
  });

  it("reopen needs a written reason — whitespace does not count", async () => {
    const onSubmit = jest.fn().mockResolvedValue(true);
    render(
      <PsychologicalTestsControl
        addmission={notApplicable()}
        onSubmit={onSubmit}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Reopen" }));
    const textarea = screen.getByLabelText(/reason for reopening/i);
    expect(textarea).toHaveAttribute("maxLength", "500");
    expect(submitButton()).not.toBeInTheDocument();

    fireEvent.change(textarea, { target: { value: "   " } });
    expect(submitButton()).not.toBeInTheDocument();

    fireEvent.change(textarea, { target: { value: "  Diagnosis revised  " } });
    fireEvent.click(submitButton());

    expect(onSubmit).toHaveBeenCalledWith("adm-1", {
      status: "APPLICABLE",
      reason: "Diagnosis revised",
    });
    await waitFor(() =>
      expect(
        screen.queryByLabelText(/reason for reopening/i),
      ).not.toBeInTheDocument(),
    );
  });

  it("closes an open panel when the status changes underneath it", () => {
    const { rerender } = render(
      <PsychologicalTestsControl addmission={applicable()} onSubmit={jest.fn()} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Not Applicable" }));
    expect(screen.getAllByRole("radio")).toHaveLength(2);

    // Someone else marked it Not Applicable; the store refreshed.
    rerender(
      <PsychologicalTestsControl
        addmission={notApplicable()}
        onSubmit={jest.fn()}
      />,
    );
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reopen" })).toBeInTheDocument();
  });
});

describe("PsychologicalTestsControl — discharged admissions", () => {
  it("renders nothing for a discharged stay that was never marked", () => {
    const { container } = render(
      <PsychologicalTestsControl
        addmission={applicable({ dischargeDate: "2026-10-05T00:00:00.000Z" })}
        onSubmit={jest.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows a recorded Not Applicable read-only, with no Reopen", () => {
    render(
      <PsychologicalTestsControl
        addmission={notApplicable({
          dischargeDate: "2026-10-05T00:00:00.000Z",
        })}
        onSubmit={jest.fn()}
      />,
    );
    expect(screen.getByText(`Reason: ${REASON_2}`)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Reopen" }),
    ).not.toBeInTheDocument();
  });
});

describe("PsychologicalTestsControl — several admissions on one page", () => {
  it("binds each label to its own admission's radio", () => {
    render(
      <>
        <PsychologicalTestsControl
          addmission={applicable({ _id: "adm-A" })}
          onSubmit={jest.fn()}
        />
        <PsychologicalTestsControl
          addmission={applicable({ _id: "adm-B" })}
          onSubmit={jest.fn()}
        />
      </>,
    );
    const [openA, openB] = screen.getAllByRole("button", {
      name: "Not Applicable",
    });
    fireEvent.click(openA);
    fireEvent.click(openB);

    // Clicking the SECOND card's label must select the second card's radio.
    const labels = screen.getAllByText(REASON_1);
    fireEvent.click(labels[1]);

    const radios = screen.getAllByRole("radio", { name: REASON_1 });
    expect(radios[0]).not.toBeChecked();
    expect(radios[1]).toBeChecked();
    // And the two cards are separate radio groups.
    expect(radios[0].getAttribute("name")).not.toBe(
      radios[1].getAttribute("name"),
    );
  });
});
