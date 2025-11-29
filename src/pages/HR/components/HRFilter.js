import { useEffect } from 'react'
import { useSelector } from 'react-redux';
import Select from "react-select";
import Header from '../../Report/Components/Header';
import { useMediaQuery } from '../../../Components/Hooks/useMediaQuery';


const HRFilter = ({ setPage, reportDate, setReportDate, search, selectedCenter, setSelectedCenter, setDebouncedSearch }) => {
    const user = useSelector((state) => state.User);

    const isMobile = useMediaQuery("(max-width: 1000px)");

    const centerOptions = [
        ...(user?.centerAccess?.length > 1
            ? [{
                value: "ALL",
                label: "All Centers",
                isDisabled: false,
            }]
            : []
        ),
        ...(
            user?.centerAccess?.map(id => {
                const center = user?.userCenters?.find(c => c._id === id);
                return {
                    value: id,
                    label: center?.title || "Unknown Center"
                };
            }) || []
        )
    ];

    const selectedCenterOption = centerOptions.find(
        opt => opt.value === selectedCenter
    ) || centerOptions[0];

    useEffect(() => {
        if (
            selectedCenter !== "ALL" &&
            !user?.centerAccess?.includes(selectedCenter)
        ) {
            setSelectedCenter("ALL");
            setPage(1);
        }
    }, [selectedCenter, user?.centerAccess]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);

        return () => clearTimeout(handler);
    }, [search]);

    return (
        <div className='mb-3'>
            <div
                className={`mb-3 d-flex ${isMobile ? "flex-column gap-2" : "flex-row gap-3"
                    }`}
                style={{ width: "100%" }}
            >
                <div style={{ width: isMobile ? "100%" : "200px" }}>
                    <Select
                        value={selectedCenterOption}
                        onChange={(opt) => setSelectedCenter(opt.value)}
                        options={centerOptions}
                        placeholder="All Centers"
                        className="react-select-container"
                        classNamePrefix="react-select"
                    />
                </div>

                <div
                    className={
                        isMobile
                            ? "d-flex justify-content-between align-items-center gap-2"
                            : "d-flex align-items-center"
                    }
                    style={{ width: "100%" }}
                >
                    <Header
                        reportDate={reportDate}
                        setReportDate={(val) => setReportDate(val)}
                    />
                </div>
            </div>
        </div>
    )
}

export default HRFilter