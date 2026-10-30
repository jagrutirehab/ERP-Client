import React from "react";

export const DetailHistoryClearContext = React.createContext({
  onClearForm: null,
  isGenerating: false,
  hasGenerated: false,
  uploadedAudio: null,
});
