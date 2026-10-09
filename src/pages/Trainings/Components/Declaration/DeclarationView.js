import React from "react";
import DeclarationPages from "./DeclarationPages";

const DOCX_STYLE = `
.declaration-docx { font-size: 13px; line-height: 1.45; overflow-x: auto; }
.declaration-docx table { border-collapse: collapse; width: 100%; margin: 8px 0; }
.declaration-docx td, .declaration-docx th { border: 1px solid #cbd5e1; padding: 4px 8px; vertical-align: top; }
.declaration-docx p { margin: 0 0 6px; }
.declaration-docx img { max-width: 100%; height: auto; max-height: 90px; vertical-align: middle; }
`;

const DeclarationView = ({ data, className = "" }) => {
  if (!data) return null;

  if (data.format === "docx") {
    return (
      <div className={className} data-testid="declaration-docx-view">
        <style>{DOCX_STYLE}</style>
        <div className="declaration-docx border rounded bg-white p-3" dangerouslySetInnerHTML={{ __html: data.html || "" }} />
      </div>
    );
  }

  return <DeclarationPages pages={data.pages || []} className={className} />;
};

export default DeclarationView;
