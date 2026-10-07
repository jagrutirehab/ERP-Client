import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { format } from "date-fns";

import PsychologicalTestsControl from "./PsychologicalTestsControl";

// Stateless — it only asks the parent to open the dialog. The dialog itself is
// covered in PsychologicalTestsStatusModal.test.js.

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

describe("PsychologicalTestsControl", () => {
  it("asks for the Not Applicable dialog instead of opening a form inline", () => {
    const onRequestChange = jest.fn();
    render(
      <PsychologicalTestsControl
        addmission={applicable()}
        onRequestChange={onRequestChange}
      />,
    );
    expect(screen.getByText("Psychological Tests:")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Not Applicable" }));

    expect(onRequestChange).toHaveBeenCalledWith("adm-1", "NOT_APPLICABLE");
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /submit/i }),
    ).not.toBeInTheDocument();
  });

  it("shows who, the date and time, and the reason once recorded", () => {
    render(
      <PsychologicalTestsControl
        addmission={notApplicable()}
        onRequestChange={jest.fn()}
      />,
    );
    expect(screen.getByText("Not Applicable")).toBeInTheDocument();
    const expectedWhen = format(new Date(RECORDED_AT), "dd MMM yyyy, hh:mm a");
    expect(
      screen.getByText(`by Dr Asha Rao · ${expectedWhen}`),
    ).toBeInTheDocument();
    expect(screen.getByText(`Reason: ${REASON_2}`)).toBeInTheDocument();
    // Only the badge once recorded — no Not Applicable BUTTON.
    expect(
      screen.queryByRole("button", { name: "Not Applicable" }),
    ).not.toBeInTheDocument();
  });

  it("asks for the Reopen dialog", () => {
    const onRequestChange = jest.fn();
    render(
      <PsychologicalTestsControl
        addmission={notApplicable()}
        onRequestChange={onRequestChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Reopen" }));
    expect(onRequestChange).toHaveBeenCalledWith("adm-1", "APPLICABLE");
  });

  it("renders nothing for a discharged stay that was never marked", () => {
    const { container } = render(
      <PsychologicalTestsControl
        addmission={applicable({ dischargeDate: "2026-10-05T00:00:00.000Z" })}
        onRequestChange={jest.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows a discharged stay's Not Applicable read-only, with no Reopen", () => {
    render(
      <PsychologicalTestsControl
        addmission={notApplicable({
          dischargeDate: "2026-10-05T00:00:00.000Z",
        })}
        onRequestChange={jest.fn()}
      />,
    );
    expect(screen.getByText(`Reason: ${REASON_2}`)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Reopen" }),
    ).not.toBeInTheDocument();
  });
});
