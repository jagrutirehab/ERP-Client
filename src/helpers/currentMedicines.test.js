/**
 * The client-side medicine helpers: drug identity (which decides whether the
 * same drug at another strength can be added) and the date arithmetic behind
 * the From/To fields.
 *
 *   npm test -- --testPathPattern=currentMedicines
 */
import {
  drugIdentity,
  getDurationDays,
  getMedicineEndDate,
  getDaysBetween,
  isMedicineCurrentlyRunning,
} from "./currentMedicines";

describe("drugIdentity", () => {
  it("treats the same drug at a different strength as a different medicine", () => {
    const dolo500 = { name: "DOLO", strength: "500", unit: "MG" };
    const dolo650 = { name: "DOLO", strength: "650", unit: "MG" };

    expect(drugIdentity(dolo500)).not.toBe(drugIdentity(dolo650));
  });

  it("treats the identical drug as the same medicine", () => {
    const a = { name: "DOLO", strength: "500", unit: "MG" };
    const b = { name: "DOLO", strength: "500", unit: "MG" };

    expect(drugIdentity(a)).toBe(drugIdentity(b));
  });

  it("ignores casing and surrounding spaces", () => {
    const a = { name: "dolo", strength: " 500 ", unit: "mg" };
    const b = { name: "DOLO", strength: "500", unit: "MG" };

    expect(drugIdentity(a)).toBe(drugIdentity(b));
  });

  it("distinguishes on unit as well as name and strength", () => {
    const mg = { name: "DOLO", strength: "5", unit: "MG" };
    const ml = { name: "DOLO", strength: "5", unit: "ML" };

    expect(drugIdentity(mg)).not.toBe(drugIdentity(ml));
  });

  it("does not throw on missing input", () => {
    expect(() => drugIdentity(undefined)).not.toThrow();
    expect(drugIdentity(undefined)).toBe(drugIdentity({}));
  });
});

describe("getDurationDays", () => {
  it("converts each unit to days", () => {
    expect(getDurationDays("30", "Day (s)")).toBe(30);
    expect(getDurationDays("2", "Week (s)")).toBe(14);
    expect(getDurationDays("3", "Month (s)")).toBe(90);
    expect(getDurationDays("1", "Year (s)")).toBe(365);
  });

  it("treats blank, zero and nonsense as no duration", () => {
    expect(getDurationDays("", "Day (s)")).toBe(0);
    expect(getDurationDays("0", "Day (s)")).toBe(0);
    expect(getDurationDays("abc", "Day (s)")).toBe(0);
    expect(getDurationDays(undefined, "Day (s)")).toBe(0);
  });
});

describe("getMedicineEndDate", () => {
  it("is the start date plus the duration", () => {
    const end = getMedicineEndDate("2026-08-25", {
      duration: "30",
      unit: "Day (s)",
    });

    expect(end.toISOString().slice(0, 10)).toBe("2026-09-24");
  });

  it("returns null for an open-ended course, so the UI can show Ongoing", () => {
    expect(
      getMedicineEndDate("2026-08-25", { duration: "0", unit: "Day (s)" }),
    ).toBeNull();
  });

  it("returns null when there is no start date to work from", () => {
    expect(getMedicineEndDate(null, { duration: "30", unit: "Day (s)" })).toBeNull();
  });
});

describe("getDaysBetween", () => {
  it("counts whole days between two dates", () => {
    expect(getDaysBetween("2026-08-25", "2026-09-24")).toBe(30);
  });

  it("never drops below a single day", () => {
    expect(getDaysBetween("2026-08-25", "2026-08-25")).toBe(1);
    expect(getDaysBetween("2026-08-25", "2026-08-20")).toBe(1);
  });
});

describe("isMedicineCurrentlyRunning", () => {
  const medicine = { duration: "30", unit: "Day (s)" };

  it("is running inside its window", () => {
    expect(
      isMedicineCurrentlyRunning("2026-08-25", medicine, new Date("2026-09-01")),
    ).toBe(true);
  });

  it("has finished once the window has passed", () => {
    expect(
      isMedicineCurrentlyRunning("2026-08-25", medicine, new Date("2026-10-01")),
    ).toBe(false);
  });

  it("treats a course with no computable end as ongoing", () => {
    expect(
      isMedicineCurrentlyRunning(
        "2026-08-25",
        { duration: "0", unit: "Day (s)" },
        new Date("2027-01-01"),
      ),
    ).toBe(true);
  });
});
