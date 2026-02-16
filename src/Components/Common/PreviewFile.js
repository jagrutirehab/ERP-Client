import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import CustomModal from "./Modal";
import { Spinner, Button } from "reactstrap";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { downloadFile } from "./downloadFile";
import * as XLSX from "xlsx";

const PreviewFile = ({ title = "Preview File", file, isOpen, toggle }) => {
  const [loading, setLoading] = useState(true);
  const [excelData, setExcelData] = useState([]);

  const url = file?.url;
  const isPdf =
    file?.type === "application/pdf" ||
    url?.toLowerCase().endsWith(".pdf");

  const isImage =
    file?.type?.startsWith("image/") ||
    /\.(png|jpg|jpeg|webp)$/i.test(url);

  const isExcel =
    file?.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file?.type === "application/vnd.ms-excel" ||
    /\.(xlsx|xls)$/i.test(file?.name || url);

  const isLocalExcel = isExcel && file?.fileObj;

  useEffect(() => {
    if (isLocalExcel) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        setExcelData(json.slice(0, 10));
      };

      reader.readAsArrayBuffer(file.fileObj);
    }
  }, [file, isLocalExcel]);

  const footer = (
    <div className="d-flex w-100 justify-content-end">
      <Button
        className="text-white"
        color="primary"
        onClick={() => downloadFile(file)}
      >
        <i className="ri-download-2-line align-bottom me-1"></i> Download
      </Button>
    </div>
  );

  if (!file) return null;

  return (
    <CustomModal
      size="xl"
      centered
      title={title}
      isOpen={isOpen}
      toggle={toggle}
      footer={(isExcel && !isLocalExcel) ? footer : null}
    >
      {loading && (isPdf || isImage) && (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: 300 }}
        >
          <Spinner color="primary" />
        </div>
      )}

      {isPdf && (
        <iframe
          src={url}
          title={file?.originalName || "Attachment Preview"}
          width="100%"
          height="600"
          style={{
            display: loading ? "none" : "block",
            border: "none"
          }}
          onLoad={() => setLoading(false)}
        />
      )}

      {isImage && (
        <TransformWrapper
          minScale={1}
          maxScale={5}
          centerOnInit
          doubleClick={{ disabled: true }}
          wheel={{ step: 0.2 }}
        >
          <TransformComponent>
            <img
              src={url}
              alt="Preview"
              className="img-fluid mx-auto d-block"
              onLoad={() => setLoading(false)}
            />
          </TransformComponent>
        </TransformWrapper>
      )}

      {isExcel && isLocalExcel && (
        <div style={{ maxHeight: "70vh" }}>

          <div className="mb-2 text-muted small fw-semibold">
            Showing first 10 rows
          </div>

          <div className="table-responsive">
            <table className="table table-bordered table-sm">
              <tbody>
                {excelData.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isExcel && !isLocalExcel && (
        <div style={{ height: "80vh", width: "100%" }}>
          <iframe
            title="Excel Preview"
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`}
            width="100%"
            height="100%"
            style={{ border: "none" }}
          />
        </div>
      )}

      {!isPdf && !isImage && !isExcel && (
        <p className="text-center text-muted py-5">
          Preview not supported for this file type
        </p>
      )}
    </CustomModal>
  );
};

PreviewFile.propTypes = {
  title: PropTypes.string,
  file: PropTypes.shape({
    url: PropTypes.string.isRequired,
    type: PropTypes.string,
    fileObj: PropTypes.any,
    name: PropTypes.string,
    originalName: PropTypes.string,
  }),
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
};

export default PreviewFile;
