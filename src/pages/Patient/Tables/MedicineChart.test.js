/**
 * The medicine table used on prescription charts, the Current Medicines tab
 * and the nurse Medications view.
 *
 *   npm test -- --testPathPattern=MedicineChart
 */
import { render, screen } from "@testing-library/react";
import MedicineChart from "./MedicineChart";

const drug = (over = {}) => ({
  _id: "med1",
  medicine: { name: "DOLO", type: "TAB", strength: "650", unit: "MG" },
  dosageAndFrequency: { morning: "1", evening: "0", night: "1" },
  duration: "30",
  unit: "Day (s)",
  frequency: 1,
  frequencyType: "interval",
  intake: "After food",
  startDate: "2026-08-25T00:00:00.000Z",
  endDate: "2026-09-24T00:00:00.000Z",
  ...over,
});

describe("MedicineChart", () => {
  it("shows the medicine name", () => {
    render(<MedicineChart medicines={[drug()]} />);
    expect(screen.getByText(/DOLO/)).toBeInTheDocument();
  });

  it("hides the From and To columns unless dates are asked for", () => {
    const { rerender } = render(<MedicineChart medicines={[drug()]} />);
    expect(screen.queryByText("From")).not.toBeInTheDocument();

    rerender(<MedicineChart medicines={[drug()]} showDates />);
    expect(screen.getByText("From")).toBeInTheDocument();
    expect(screen.getByText("To")).toBeInTheDocument();
  });

  it("shows Ongoing when a medicine has no end date", () => {
    render(
      <MedicineChart
        medicines={[drug({ endDate: null, duration: "0" })]}
        showDates
      />,
    );
    expect(screen.getByText("Ongoing")).toBeInTheDocument();
  });

  describe("a discontinued medicine", () => {
    const stopped = drug({
      status: "discontinued",
      discontinuedAt: "2026-08-26T00:00:00.000Z",
      discontinuedBy: { name: "AMAR SHINDE" },
    });

    it("is labelled, naming who stopped it and when", () => {
      render(<MedicineChart medicines={[stopped]} />);

      expect(screen.getByText("DISCONTINUED")).toBeInTheDocument();
      expect(screen.getByText(/Amar Shinde/)).toBeInTheDocument();
      expect(screen.getByText(/26 Aug, 2026/)).toBeInTheDocument();
    });

    it("keeps the drug name readable rather than striking it through", () => {
      render(<MedicineChart medicines={[stopped]} />);

      const name = screen.getByText(/DOLO/);
      expect(name).toBeVisible();
      expect(window.getComputedStyle(name).textDecoration).not.toMatch(
        /line-through/,
      );
    });

    it("offers no Discontinue button, since it is already stopped", () => {
      render(
        <MedicineChart
          medicines={[stopped]}
          currentUserId="doc1"
          onDiscontinue={() => {}}
        />,
      );
      expect(screen.queryByRole("button", { name: /discontinue/i })).toBeNull();
    });
  });

  describe("the prescriber column", () => {
    it("badges your own medicines as You", () => {
      render(
        <MedicineChart
          medicines={[drug({ prescribedBy: "doc1" })]}
          currentUserId="doc1"
          showOwner
        />,
      );
      expect(screen.getByText("You")).toBeInTheDocument();
    });

    it("names another prescriber in plain text", () => {
      render(
        <MedicineChart
          medicines={[
            drug({ prescribedBy: { _id: "doc2", name: "PRATIK KADLAG" } }),
          ]}
          currentUserId="doc1"
          showOwner
        />,
      );
      expect(screen.getByText("Pratik Kadlag")).toBeInTheDocument();
      expect(screen.queryByText("You")).toBeNull();
    });

    it("falls back to the chart author for older rows with no prescriber", () => {
      render(
        <MedicineChart
          medicines={[drug()]}
          currentUserId="doc1"
          fallbackPrescriber={{ _id: "doc3", name: "VIJAY DEVERKONDA" }}
          showOwner
        />,
      );
      expect(screen.getByText("Vijay Deverkonda")).toBeInTheDocument();
    });
  });

  it("offers Discontinue on a running medicine when the action is available", () => {
    render(
      <MedicineChart
        medicines={[drug({ prescribedBy: "doc1" })]}
        currentUserId="doc1"
        onDiscontinue={() => {}}
      />,
    );
    expect(
      screen.getByRole("button", { name: /discontinue/i }),
    ).toBeInTheDocument();
  });
});
