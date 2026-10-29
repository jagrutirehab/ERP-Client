import {
  hasDraftContent,
  checkExistingDraft,
  getDetailAdmissionDraftKey,
} from "../../pages/Patient/ChartForm/DetailAdmission/index";

describe("Detail Admission Draft Detection", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("returns false for initial values and pre-loaded patient database props", () => {
    const preloadedPatientForm = {
      author: "user123",
      patient: "pat456",
      center: "center789",
      addmission: "adm012",
      chart: "chart345",
      patientType: "geriatric",
      date: new Date(),
      // Pre-loaded patient DB props (must NOT be marked as a draft)
      age: "74",
      doctorConsultant: "Dr. Dave",
      religion: "Hindu",
      maritalStatus: "Married",
      bloodGroup: "B+",
      occupation: "Retired",
      education: "Graduate",
      address: "Pune",
      referral: "Self",
      counsellor: "Ritu",
      // Initial form defaults
      reliable: "Reliable",
      adequate: "Adequate",
      delusions: "none",
      delusionNotes: "",
      substanceProfile: [],
      provisionaldiagnosis: [],
      diagnosis: [],
      negativeHistory: [],
      psychiatricFields: "{}",
      addictionFields: "{}",
      geriatricFields: "{}",
      elderlyChecklistFields: JSON.stringify({ skinConcerns: [] }),
    };

    expect(hasDraftContent(preloadedPatientForm)).toBe(false);
  });

  test("returns true when any meaningful user-modified clinical field is populated", () => {
    const formWithChiefComplaints = {
      author: "user123",
      patient: "pat456",
      center: "center789",
      chiefComplaints: "Patient experiencing severe insomnia and anxiety",
    };

    expect(hasDraftContent(formWithChiefComplaints)).toBe(true);

    const formWithLine1 = {
      patient: "pat456",
      line1: "Short-term memory loss and wandering for 6 months",
    };

    expect(hasDraftContent(formWithLine1)).toBe(true);

    const formWithInformant = {
      patient: "pat456",
      informant: "Son",
      informantName: "Amit",
    };

    expect(hasDraftContent(formWithInformant)).toBe(true);

    const formWithNegativeHistory = {
      patient: "pat456",
      negativeHistory: ["Head Injury"],
    };

    expect(hasDraftContent(formWithNegativeHistory)).toBe(true);
  });

  test("returns true when substance profile has filled rows, false when empty/unreported", () => {
    const formWithEmptySubstances = {
      patient: "pat456",
      substanceProfile: [
        {
          substance: "Alcohol",
          ageOfFirstUse: "",
          currentUse: "",
          frequency: "",
          quantity: "",
          quantityDose: "",
          route: "",
          lastUse: "",
        },
        {
          substance: "Cannabis / Ganja",
          ageOfFirstUse: "",
          currentUse: "",
          frequency: "",
          quantity: "",
          quantityDose: "",
          route: "",
          lastUse: "",
        },
      ],
    };

    expect(hasDraftContent(formWithEmptySubstances)).toBe(false);

    const formWithActiveAlcohol = {
      patient: "pat456",
      substanceProfile: [
        {
          substance: "Alcohol",
          ageOfFirstUse: "18",
          currentUse: "Daily",
          frequency: "Daily",
          quantity: "180ml",
          quantityDose: "180ml",
          route: "Oral",
          lastUse: "Yesterday",
        },
      ],
    };

    expect(hasDraftContent(formWithActiveAlcohol)).toBe(true);
  });

  test("checkExistingDraft correctly detects draft in localStorage via standard and legacy keys", () => {
    const draftKey = getDetailAdmissionDraftKey("pat456");
    const legacyKey = "detailAdmissionDraft_pat456";

    expect(checkExistingDraft(draftKey, legacyKey)).toBe(false);

    // Saving only pre-loaded patient demographic info should NOT trigger draft detection
    localStorage.setItem(
      draftKey,
      JSON.stringify({
        patient: "pat456",
        age: "74",
        doctorConsultant: "Dr. Dave",
        reliable: "Reliable",
        adequate: "Adequate",
      })
    );
    expect(checkExistingDraft(draftKey, legacyKey)).toBe(false);

    // Saving real user-modified clinical entries MUST trigger draft detection
    localStorage.setItem(
      draftKey,
      JSON.stringify({
        patient: "pat456",
        chiefComplaints: "Agitation and sleep issues",
      })
    );

    expect(checkExistingDraft(draftKey, legacyKey)).toBe(true);

    localStorage.removeItem(draftKey);
    expect(checkExistingDraft(draftKey, legacyKey)).toBe(false);

    // Legacy key detection
    localStorage.setItem(
      legacyKey,
      JSON.stringify({
        patient: "pat456",
        line1: "Memory issues",
      })
    );
    expect(checkExistingDraft(draftKey, legacyKey)).toBe(true);

    localStorage.removeItem(legacyKey);
    expect(checkExistingDraft(draftKey, legacyKey)).toBe(false);
  });

  test("hasDraftContent accepts patientId or draftKey string and checks localStorage directly", () => {
    const patientId = "pat789";
    const draftKey = getDetailAdmissionDraftKey(patientId);

    // Empty localStorage -> false
    expect(hasDraftContent(patientId)).toBe(false);
    expect(hasDraftContent(draftKey)).toBe(false);

    // Demographic only in localStorage -> false
    localStorage.setItem(
      draftKey,
      JSON.stringify({
        patient: patientId,
        age: "65",
        doctorConsultant: "Dr. Dave",
        reliable: "Reliable",
      })
    );
    expect(hasDraftContent(patientId)).toBe(false);
    expect(hasDraftContent(draftKey)).toBe(false);

    // Modified user content in localStorage -> true
    localStorage.setItem(
      draftKey,
      JSON.stringify({
        patient: patientId,
        line1: "Aggressive behavior",
      })
    );
    expect(hasDraftContent(patientId)).toBe(true);
    expect(hasDraftContent(draftKey)).toBe(true);
  });
});
