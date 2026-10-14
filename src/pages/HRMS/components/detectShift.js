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

    const DAY_END = 1320;      // 10:00 PM
    const NIGHT_START = 1200;  // 8:00 PM

    // NIGHT shift (starts at or after 8 PM)
    if (start >= NIGHT_START) {
        if (end < start) {
            return {
                shift: SHIFT_CONFIG.NIGHT.value,
                error: null,
            };
        }
        return {
            shift: null,
            error: "Night shift end time must be after midnight (next day)",
        };
    }

    // DAY shift (starts before 10 PM)
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
};
