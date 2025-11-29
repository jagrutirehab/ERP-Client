import React, { useState } from 'react'
import HRFilter from '../../components/HRFilter'
import { endOfDay, startOfDay } from 'date-fns';

const Hiring = () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [selectedCenter, setSelectedCenter] = useState("ALL");
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [reportDate, setReportDate] = useState({
        start: startOfDay(new Date()),
        end: endOfDay(new Date()),
    });
    return (
        <div className='px-3'>
            <div className='mb-3'>
                <HRFilter
                    setPage={setPage}
                    reportDate={reportDate}
                    setReportDate={setReportDate}
                    search={search}
                    selectedCenter={selectedCenter}
                    setSelectedCenter={setSelectedCenter}
                    setDebouncedSearch={setDebouncedSearch}
                />
                <div className="text-center py-5">
                    <h6 className="mb-2">No Hiring found</h6>
                    <p className="text-muted">Create a new hiring to get started.</p>
                </div>
            </div>
        </div>
    )
}

export default Hiring;