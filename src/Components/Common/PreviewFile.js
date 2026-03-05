import { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import CustomModal from "./Modal";
import { Spinner, Button } from "reactstrap";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { downloadFile } from "./downloadFile";
import * as XLSX from "xlsx";

const PreviewFile = ({ title = "Preview File", file, isOpen, toggle, allowDownload = false }) => {
  const [loading, setLoading] = useState(true);
  const [excelData, setExcelData] = useState([]);
  const imgRef = useRef(null);

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

  const handleDownload = useCallback(() => {
    if (isImage && imgRef.current) {
      try {
        const img = imgRef.current;
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext("2d").drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = file?.originalName || "download";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
          }
        });
      } catch {
        downloadFile(file);
      }
    } else {
      downloadFile(file);
    }
  }, [file, isImage]);

  if (!file) return null;

  const headerTitle = (
    <>
      <span className="me-3">{title}</span>
      {allowDownload && (
        <Button
          className="text-white mt-1"
          color="primary"
          size="sm"
          onClick={handleDownload}
          style={{ position: "absolute", right: "50px", top: "12px", zIndex: 10 }}
        >
          <i className="ri-download-2-line align-bottom me-1"></i> Download
        </Button>
      )}
    </>
  );

  return (
    <CustomModal
      size="xl"
      centered
      title={headerTitle}
      isOpen={isOpen}
      toggle={toggle}
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
              ref={imgRef}
              crossOrigin="anonymous"
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
  allowDownload: PropTypes.bool,
};

export default PreviewFile;
