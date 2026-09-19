import React from "react";
import PropTypes from "prop-types";
import { Eye } from "lucide-react";

// Read-only "View evidence" link(s) for saved transactionProof URLs.
// A mode can now have multiple saved files; renders one link per URL,
// numbered when there's more than one. Renders nothing when there are
// no URLs — callers should also skip rendering any wrapping element in
// that case to avoid empty gaps.
const TransactionProofLink = ({ urls }) => {
  const urlList = (Array.isArray(urls) ? urls : []).filter(Boolean);
  if (!urlList.length) return null;

  return (
    <>
      {urlList.map((url, i) => (
        <a
          key={url}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary d-inline-flex align-items-center gap-1 small me-2"
          title="View evidence"
        >
          <Eye size={14} />
          View evidence{urlList.length > 1 ? ` ${i + 1}` : ""}
        </a>
      ))}
    </>
  );
};

TransactionProofLink.propTypes = {
  urls: PropTypes.arrayOf(PropTypes.string),
};

export default TransactionProofLink;
