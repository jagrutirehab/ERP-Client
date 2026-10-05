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
    files: [],
});

export const flattenPositions = (data) =>
    (data || [])
        .flatMap((doc) =>
            (doc.positions || [])
                .filter((pos) => !pos.deleted && pos.version === 2)
                .map((pos) => ({ _id: pos._id.toString(), name: pos.name }))
        )
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));

export const buildPayload = (records, positionNameById = {}) =>
    records.map(({ trainingName, trainingDescription, trainerName, center, from, to, selectedUsers }) => ({
        trainingName,
        trainingDescription,
        trainerName,
        center,
        from: from ? new Date(from).toISOString() : "",
        to: to ? new Date(to).toISOString() : "",
        attendanceData: Object.entries(selectedUsers)
            .filter(([, employees]) => employees.length > 0)
            .map(([positionId, employees]) => ({
                position: positionId,
                positionName: positionNameById[positionId] || "",
                presents: employees.map((e) => ({ employee: e._id })),
            })),
    }));


export const MAX_FILE_SIZE = 20 * 1024 * 1024;
export const FILE_ACCEPT = "image/*,application/pdf,.doc,.docx";

const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx", ".png", ".jpg", ".jpeg", ".webp", ".gif"];

export const formatFileSize = (bytes) =>
    bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

export const validateNewFiles = (files) => {
    const valid = [];
    const errors = [];

    files.forEach((file) => {
        const name = file.name.toLowerCase();
        const typeAllowed = file.type.startsWith("image/") || ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));

        if (!typeAllowed) {
            errors.push(`${file.name}: only images, PDF and Word documents are allowed`);
        } else if (file.size > MAX_FILE_SIZE) {
            errors.push(`${file.name}: file must be 20MB or smaller`);
        } else {
            valid.push(file);
        }
    });

    return { valid, errors };
};

export const buildCreateFormData = (records, positionNameById = {}) => {
    const formData = new FormData();
    formData.append("records", JSON.stringify(buildPayload(records, positionNameById)));
    records.forEach((record, index) => {
        (record.files || []).forEach((file) => formData.append(`files_${index}`, file));
    });
    return formData;
};
