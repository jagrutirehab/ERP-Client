import React from "react";
import PropTypes from "prop-types";
import { Eye } from "lucide-react";

// Read-only "View evidence" link for a saved transactionProof URL.
// Renders nothing when there's no URL — callers should also skip
// rendering any wrapping element in that case to avoid empty gaps.
const TransactionProofLink = ({ url }) => {
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary d-inline-flex align-items-center gap-1 small"
      title="View evidence"
    >
      <Eye size={14} />
      View evidence
    </a>
  );
};

TransactionProofLink.propTypes = {
  url: PropTypes.string,
};

export default TransactionProofLink;
