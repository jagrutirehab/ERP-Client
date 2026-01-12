import { SHIFT_CONFIG } from "../../../Components/constants/HRMS";

export const detectShift = (start, end) => {
    if (start == null && end == null) {
        return { shift: null, error: null };
    }

    if (start == null || end == null) {
        return {
            shift: null,
            error: "Please select both start and end time",
        };
    }

    const DAY_START = 660;   // 11:00 AM
    const DAY_END = 1320;    // 10:00 PM
    const NIGHT_START = 1320; // 10:00 PM
    const NIGHT_END = 660;   // 11:00 AM (next day)

    //  DAY SHIFT 
    //  11:00 AM to 10:00 PM
    if (start >= DAY_START && start < DAY_END) {
        if (end < start) {
            return {
                shift: null,
                error: "Day shift cannot cross midnight",
            };
        }

        if (end > DAY_END) {
            return {
                shift: null,
                error: "Day shift must end by 10:00 PM",
            };
        }

        return {
            shift: SHIFT_CONFIG.DAY.value,
            error: null,
        };
    }

    //    NIGHT SHIFT 
    //    10:00 PM to 11:00 AM next day
    if (start >= NIGHT_START) {
        // should end between 00:00 and 11:00 AM
        if (end >= 0 && end <= NIGHT_END) {
            return {
                shift: SHIFT_CONFIG.NIGHT.value,
                error: null,
            };
        }

        return {
            shift: null,
            error: "Night shift must end by 11:00 AM",
        };
    }

    if (start < DAY_START) {
        if (end <= NIGHT_END) {
            return {
                shift: SHIFT_CONFIG.NIGHT.value,
                error: null,
            };
        }

        return {
            shift: null,
            error: "Night shift must end by 11:00 AM",
        };
    }

    return {
        shift: null,
        error: "Invalid shift timing",
    };
};
