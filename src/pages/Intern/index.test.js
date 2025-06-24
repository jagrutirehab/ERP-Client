import React from "react";
import { render, screen } from "../../utils/test-utils";

import Patient from "./index";

describe("Patient", () => {
  it("renders Patient Page", () => {
    render(<Patient />);

    expect(
      screen.getByRole("button").textContent("Admit Patient")
    ).toBeInTheDocument();
  });
});

// describe("Charting", () => {
//   it("Render chart date modal when 'Add Chart' button is clicked", () => {
//     const { getByText, getByTestId } = render(<Charting />);

//     // expect(screen.getByText("Create new Chart")).toBeInTheDocument();
//     expect(screen.getByText("Admit Patient"));
//     // screen.debug();
//     // const chartDateModal = getByTestId("chart-date-modal");
//     // expect(() => getByTestId('chart')).toThrow();
//   });
// });
