import { CardBody } from 'reactstrap';
import { useMediaQuery } from '../../../Components/Hooks/useMediaQuery';

const HRDashboard = () => {
  const isMobile = useMediaQuery("(max-width: 1000px)");
  return (
    <CardBody
      className="p-3 bg-white"
      style={isMobile ? { width: "100%" } : { width: "78%" }}
    >
      <div className="text-center text-md-left mb-4">
        <h1 className="display-6 fw-bold text-primary">
          DASHBOARD
        </h1>
      </div>
    </CardBody>
  )
}

export default HRDashboard;
