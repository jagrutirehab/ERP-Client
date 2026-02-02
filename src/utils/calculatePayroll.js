export const calculatePayroll = (values) => {
    const PF_WAGE_CAP = 15000;

    const gross = Number(values.grossSalary || 0);
    const basic = Number(values.basicAmount || 0);
    const hra = Number(values.HRAAmount || 0);
    const spl = Number(values.SPLAllowance || 0);
    const conveyance = Number(values.conveyanceAllowance || 0);
    const ESICSalary = Number(values.ESICSalary || 0);
    const minimumWages = Number(values.minimumWages || 0);

    // short wages
    const diffPaise = Math.round((minimumWages - basic) * 100);
    const shortWages = diffPaise > 0 ? -(diffPaise / 100) : 0;

    const basicPercentage = gross > 0 ? Math.round((basic / gross) * 100) : 0;
    const HRAPercentage = gross > 0 ? Math.round((hra / basic) * 100) : 0;

    // ----- PF -----
    let PFEmployee = 0;
    let PFEmployer = 0;
    let PFSalary = 0;

    if (values.pfApplicable) {
        PFSalary = Math.min(basic + spl + conveyance, PF_WAGE_CAP);
        PFEmployee = Math.round(PFSalary * 0.12);
        PFEmployer = Math.round(PFSalary * 0.12);
    }

    // ----- PT -----
    let PT = 0;
    const gender = values.gender;
    const month = values.joinningDate
        ? new Date(values.joinningDate).getMonth() + 1
        : null;

    if (gender === "MALE") {
        if (gross >= 7501 && gross <= 10000) PT = 175;
        else if (gross >= 10001) PT = month === 2 ? 300 : 200;
    }

    if (gender === "FEMALE" && gross > 25000) {
        PT = month === 2 ? 300 : 200;
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
    const insurance = Number(values.insurance || 0);

    const deductions =
        PFEmployee +
        TDSAmount +
        PT +
        ESICEmployee +
        LWFEmployee +
        insurance;

    const inHandSalary = Math.max(gross - deductions, 0);

    return {
        PFEmployee,
        PFEmployer,
        PFAmount: PFEmployee + PFEmployer,
        PFSalary,
        PT,
        TDSAmount,
        ESICEmployee,
        ESICEmployer,
        deductions,
        inHandSalary,
        shortWages,
        basicPercentage,
        HRAPercentage
    };
};
