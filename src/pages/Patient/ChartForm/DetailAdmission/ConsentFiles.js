import React, { useMemo } from "react";
import PropTypes from "prop-types";

// Import React FilePond
import { FilePond, registerPlugin } from "react-filepond";
// Import FilePond styles
import "filepond/dist/filepond.min.css";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import { Card, CardBody, CardHeader } from "reactstrap";
import NextButton from "./NextButton";

// Register the plugins
registerPlugin(
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginFileValidateType
);

const ConsentFiles = ({ consentFiles, setConsentFiles, setFormStep, step }) => {
  const dropFiles = useMemo(() => {
    return (
      <CardBody>
        <FilePond
          files={consentFiles}
          onupdatefiles={setConsentFiles}
          allowMultiple={true}
          maxFiles={10}
          name="files"
          acceptedFileTypes={["image/*", "application/pdf"]}
          className="filepond filepond-input-multiple"
          labelFileTypeNotAllowed={true}
        />
      </CardBody>
    );
  }, [consentFiles, setConsentFiles]);

  return (
    <React.Fragment>
      <div>
        <Card>
          <CardHeader>
            <h4 className="card-title mb-0">Multiple File Upload</h4>
          </CardHeader>
          {dropFiles}
        </Card>
      </div>

      <NextButton setFormStep={setFormStep} step={step} />
    </React.Fragment>
  );
};

ConsentFiles.propTypes = {};

export default ConsentFiles;
