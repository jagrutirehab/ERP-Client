import { detectState } from "./detectState";


const PTeligibleStates = [
    "Maharashtra",
    "Gujarat",
    "Telangana",
    "Tamil Nadu",
    "Karnataka"
];

export const calculatePayroll = (values) => {
    const PF_WAGE_CAP = 15000;

    const gross = Number(values.grossSalary || 0);
    const basic = Number(values.basicAmount || 0);
    const hra = Number(values.HRAAmount || 0);
    const spl = Number(values.SPLAllowance || 0);
    const conveyance = Number(values.conveyanceAllowance || 0);
    // ESIC salary is derived as Basic + SPL Allowance
    const ESICSalary = basic + spl;
    const minimumWages = Number(values.minimumWages || 0);
    const currentLocation = values.currentLocation || {};

    // short wages
    const diffPaise = Math.round((minimumWages - basic) * 100);
    const shortWages = diffPaise > 0 ? -(diffPaise / 100) : 0;

    const basicPercentage = gross > 0 ? Math.round((basic / gross) * 100) : 0;
    const HRAPercentage = basic > 0 ? Math.round((hra / basic) * 100) : 0;

    // ----- PF -----
    let PFEmployee = 0;
    let PFEmployer = 0;
    let PFSalary = 0;

    if (values.pfApplicable) {
        PFSalary = Math.min(basic + spl + conveyance, PF_WAGE_CAP);
        PFEmployee = Math.round(PFSalary * 0.12);
        PFEmployer = Math.round(PFSalary * 0.13);
    }

    // new rule from 25.05.2026
    // if (values.pfApplicable) {
    //     PFEmployee = 1800;
    //     PFEmployer = 1950;
    //     PFSalary = 0;
    // }

    // ----- PT -----
    let PT = 0;
    const gender = values.gender?.toUpperCase();
    const month = values.joinningDate
        ? new Date(values.joinningDate).getMonth() + 1
        : null;
    console.log(PTeligibleStates.includes(detectState(currentLocation.address)))
    if (PTeligibleStates.includes(detectState(currentLocation.address)) || currentLocation.title === "Head-Office") {
        if (gender === "MALE") {
            if (gross <= 7500) {
                PT = 0;
            } else if (gross <= 10000) {
                PT = 175;
            } else {
                PT = month === 2 ? 300 : 200;
            }
        } else if (gender === "FEMALE") {
            if (gross > 24999) {
                PT = month === 2 ? 300 : 200;
            } else {
                PT = 0;
            }
        }
    }

    // ----- TDS -----
    let TDSAmount = 0;
    const TDSPercent = Number(values.TDSRate || 0);

    if (TDSPercent > 0) {
        TDSAmount = Math.round((gross * TDSPercent) / 100);
    }

    // ----- ESIC -----
    const ESICEmployee = Math.round((ESICSalary * 0.75) / 100);
    const ESICEmployer = Math.round((ESICSalary * 3.25) / 100);

    // ----- Other deductions -----
    const LWFEmployee = Number(values.LWFEmployee || 0);
    const LWFEmployer = Number(values.LWFEmployer || 0);
    const insurance = Number(values.insurance || 0);
    // variable & reimbursement are pure YEARLY CTC-only add-ons handled at the
    // yearly level (added straight to yearly CTC), so they are NOT part of the
    // monthly gross, deductions, in-hand, or monthly totalCostToCompany.

    const deductions =
        PFEmployee +
        TDSAmount +
        PT +
        ESICEmployee +
        LWFEmployee +
        insurance;

    const inHandSalary = Math.max(gross - deductions, 0);

    const gratuity = Math.round(((basic + spl + conveyance) * 4.81) / 100);
    const totalCostToCompany = gross + PFEmployer + ESICEmployer + LWFEmployer + gratuity + insurance;

    return {
        PFEmployee,
        PFEmployer,
        PFAmount: PFEmployee + PFEmployer,
        PFSalary,
        PT,
        TDSAmount,
        ESICSalary,
        ESICEmployee,
        ESICEmployer,
        deductions,
        inHandSalary,
        shortWages,
        basicPercentage,
        HRAPercentage,
        gratuity,
        totalCostToCompany,
    };
};
