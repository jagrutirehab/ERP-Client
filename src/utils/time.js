import { endOfDay, endOfMonth, startOfDay, startOfMonth, subDays } from "date-fns";
import dayjs from "dayjs";

export const timeToMinutes = (time) => {
    if (!time) return "";
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
};

// 24 hours time format HH:MM
export const minutesToTime = (minutes) => {
    if (minutes === null || minutes === undefined) return "-";
    const h = String(Math.floor(minutes / 60)).padStart(2, "0");
    const m = String(minutes % 60).padStart(2, "0");
    return `${h}:${m}`;
};

// 12 hours time format HH:MM AM/PM
export const minutesTo12HourTime = (minutes) => {
    if (minutes === null || minutes === undefined) return "";

    let hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    const period = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours === 0 ? 12 : hours;

    const h = String(hours).padStart(2, "0");
    const m = String(mins).padStart(2, "0");

    return `${h}:${m} ${period}`;
};


export const minutesToDate = (minutes) => {
    if (minutes == null) return null;
    const d = new Date();
    d.setHours(Math.floor(minutes / 60));
    d.setMinutes(minutes % 60);
    d.setSeconds(0);
    return d;
};

export const nowToMinutes = () => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
};

export const isPastDate = (date) =>
    dayjs(date).isBefore(dayjs(), "day");

export const isToday = (date) =>
    dayjs(date).isSame(dayjs(), "day");

export const getMonthRange = (date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);

    return {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
    };
};

export const getCalendarRange = () => ({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
});

export const getTableRange = () => ({
    start: startOfDay(subDays(new Date(), 14)),
    end: endOfDay(new Date()),
});
