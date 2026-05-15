export const uid = () => `_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

export const emptyRecord = (defaultTrainerName = "") => ({
    _uid: uid(),
    trainingName: "",
    trainingDescription: "",
    trainerName: defaultTrainerName,
    center: [],
    from: "",
    to: "",
    selectedUsers: {},
});

export const buildPayload = (records) =>
    records.map(({ trainingName, trainingDescription, trainerName, center, from, to, selectedUsers }) => ({
        trainingName,
        trainingDescription,
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