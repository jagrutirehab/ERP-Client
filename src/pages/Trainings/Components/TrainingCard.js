import React from 'react'
import { Card, CardBody } from 'reactstrap'
import { useNavigate } from 'react-router-dom'

const TrainingCard = ({ training, activeTab }) => {
    const navigate = useNavigate()

    return (
        <Card className="mb-3">
            <CardBody className="d-flex align-items-center justify-content-between">
                <h6 className="fw-bold mb-0">{training?.trainingName}</h6>
                <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => navigate(`/trainings/${training._id}`, { state: { activeTab } })}
                >
                    <i className="ri-arrow-right-line" />
                </button>
            </CardBody>
        </Card>
    )
}

export default TrainingCard