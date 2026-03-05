export const checkIsExcel = (file) => {
        if (!file) return false;
        return (
            /\.(xlsx|xls)$/i.test(file?.name || file?.url) ||
            file?.type?.includes("excel") ||
            file?.type?.includes("spreadsheet")
        );
    };