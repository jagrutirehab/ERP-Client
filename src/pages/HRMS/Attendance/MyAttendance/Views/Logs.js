import AttendanceLogs from "../../../components/AttendanceLogs";

const Logs = () => {

    return (
        <div className="p-3 p-md-2 bg-white" style={{ minHeight: "100vh" }}>
            <div className="container-fluid" style={{ maxWidth: "1400px" }}>
                <div className="mb-4 text-center">
                    <h2 className="fw-bold mb-1 text-primary">ATTENDANCE LOGS</h2>
                </div>
                <AttendanceLogs />
            </div>
        </div >
    )
}

export default Logs;

