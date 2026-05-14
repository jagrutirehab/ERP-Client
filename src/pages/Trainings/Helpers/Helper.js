export const uid = () => `_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

export const emptyRecord = (defaultTrainerName = "") => ({
    _uid: uid(),
    trainingName: "",
    trainerName: defaultTrainerName,
    center: "",
    from: "",
    to: "",
    selectedUsers: {},
});

export const buildPayload = (records) =>
    records.map(({ trainingName, trainerName, center, from, to, selectedUsers }) => ({
        trainingName,
        trainerName,
        center,
        from,
        to,
        attendanceData: Object.entries(selectedUsers)
            .filter(([, users]) => users.length > 0)
            .map(([role, users]) => ({
                role,
                presents: users.map((u) => ({ user: u._id })),
            })),
    }));