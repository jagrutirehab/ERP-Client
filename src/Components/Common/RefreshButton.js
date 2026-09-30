import { useId } from 'react'
import { Button, UncontrolledTooltip } from 'reactstrap'
import { RotateCw } from 'lucide-react'
import PropTypes from 'prop-types'

const RefreshButton = ({ loading, onRefresh }) => {
    const uniqueId = `refresh-btn-${useId().replace(/:/g, '')}`;
    return (
        <>
            <Button
                id={uniqueId}
                color="light"
                size="sm"
                disabled={loading}
                onClick={onRefresh}
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 34, height: 34 }}
            >
                <RotateCw
                    size={14}
                    style={{
                        animation: loading ? "spin 1s linear infinite" : "none",
                    }}
                />
            </Button>

            <UncontrolledTooltip target={uniqueId}>
                Refresh
            </UncontrolledTooltip>
        </>
    )
};

RefreshButton.propTypes = {
    loading: PropTypes.bool.isRequired,
    onRefresh: PropTypes.func.isRequired
};

export default RefreshButton;