import React, { useEffect, useState } from 'react'
import { CardBody, Spinner, Nav, NavItem, NavLink } from 'reactstrap'
import { acknowledgeTraining, getByRoles } from '../../../helpers/backend_helper'
import { toast } from 'react-toastify'
import { useMediaQuery } from '../../../Components/Hooks/useMediaQuery'
import TrainingCard from '../Components/TrainingCard'

const Trainings = () => {
  const isMobile = useMediaQuery("(max-width: 1000px)")
  const raw = localStorage.getItem("authUser")
  const user = JSON.parse(raw)

  const [trainings, setTrainings] = useState([])
  const [loading, setLoading] = useState(false)
  const [trainingId, setTrainingId] = useState(null)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const [activeTab, setActiveTab] = useState("pending")
  const limit = 10

  const loadTrainings = async (pageNum = 1, tab = activeTab) => {
    try {
      setLoading(true)
      const response = await getByRoles({ page: pageNum, limit, status: tab })
      setTrainings(response?.data || [])
      setPagination(response?.pagination || {})
    } catch (error) {
      toast.error("Failed to load trainings")
    } finally {
      setLoading(false)
    }
  }

  // useEffect(() => {
  //   trainings.forEach(training => {
  //     const file = training?.files?.[0]
  //     if (file?.type === 'application/pdf' && file?.url) {
  //       const link = document.createElement('link')
  //       link.rel = 'prefetch'
  //       link.href = `https://docs.google.com/viewer?url=${encodeURIComponent(file.url)}&embedded=true`
  //       document.head.appendChild(link)
  //     }
  //   })
  // }, [trainings])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setPage(1)
    loadTrainings(1, tab)
  }

  const handleAcknowledge = async (trainingId) => {
    setTrainingId(trainingId)
    try {
      const res = await acknowledgeTraining(trainingId)
      toast.success("Acknowledged successfully")
      loadTrainings(page)
    } catch (error) {
      console.log("4. error", error)
      toast.error(error?.response?.data?.message || "Failed to acknowledge")
    } finally {
      setTrainingId(null)
    }
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
    loadTrainings(newPage)
  }

  useEffect(() => {
    loadTrainings()
  }, [])

  return (
    <CardBody className="p-3 bg-white" style={isMobile ? { width: "100%" } : { width: "78%" }}>
      <div className="text-center text-md-left mb-4">
        <h1 className="display-6 fw-bold text-primary">TRAININGS</h1>
      </div>

      <Nav tabs className="mb-4">
        <NavItem>
          <NavLink
            className={activeTab === "pending" ? "active fw-semibold" : "text-muted"}
            style={{ cursor: "pointer" }}
            onClick={() => handleTabChange("pending")}
          >
            Pending
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={activeTab === "acknowledged" ? "active fw-semibold" : "text-muted"}
            style={{ cursor: "pointer" }}
            onClick={() => handleTabChange("acknowledged")}
          >
            Acknowledged
          </NavLink>
        </NavItem>
      </Nav>

      {loading ? (
        <div className="text-center py-5">
          <Spinner color="primary" />
        </div>
      ) : trainings.length === 0 ? (
        <p className="text-muted text-center py-5">
          {activeTab === "pending" ? "No pending trainings." : "No acknowledged trainings."}
        </p>
      ) : (
        <>
          {trainings?.map(training => (
            <TrainingCard
              key={training._id}
              training={training}
              activeTab={activeTab}
            />
          ))}

          {pagination.totalPages > 1 && (
            <div className="d-flex justify-content-center align-items-center gap-2 mt-4">
              <button
                className="btn btn-outline-primary btn-sm"
                disabled={!pagination.hasPrevPage}
                onClick={() => handlePageChange(page - 1)}
              >
                Previous
              </button>
              <span className="text-muted small">Page {pagination.currentPage} of {pagination.totalPages}</span>
              <button
                className="btn btn-outline-primary btn-sm"
                disabled={!pagination.hasNextPage}
                onClick={() => handlePageChange(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </CardBody>
  )
}

export default Trainings