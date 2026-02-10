import React from "react";
import { toast } from "react-toastify";

class PDFErrorBoundary extends React.Component {
  componentDidCatch(error, info) {
    console.error("PDF render error:", error, info);
    toast.error(`PDF failed: ${error.message}`);
  }

  render() {
    return this.props.children;
  }
}

export default PDFErrorBoundary;
