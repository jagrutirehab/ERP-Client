import React, { memo, useRef, useState } from "react";
import PropTypes from "prop-types";
import ReactCrop, {
  centerCrop,
  convertToPixelCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/src/ReactCrop.scss";
import { Button, Modal, ModalBody, ModalHeader } from "reactstrap";
import setCanvasPreview from "../../utils/setCanvasPreview";

const Editor = ({
  file,
  setLogo,
  setCropLogo,
  minWidth,
  minHeight,
  maxHeight,
  maxWidth,
}) => {
  const [crop, setCrop] = useState();
  const imgRef = useRef();
  const canvasRef = useRef();

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    const cropWidthInPercent = (150 / width) * 100;

    const crop = makeAspectCrop(
      {
        unit: "%",
        width: cropWidthInPercent,
      },
      1,
      width,
      height
    );
    const centeredCrop = centerCrop(crop, width, height);
    setCrop(centeredCrop);
  };

  const toggle = () => {
    setLogo("");
  };

  return (
    <Modal isOpen={Boolean(file)}>
      <ModalHeader toggle={toggle}>Crop Logo</ModalHeader>
      <ModalBody>
        <div className="text-center">
          <ReactCrop
            maxHeight={maxHeight}
            maxWidth={maxWidth}
            minWidth={minWidth}
            minHeight={minHeight}
            crop={crop}
            keepSelection
            // aspect={1} 
            onChange={(c, per) => setCrop(per)}
          >
            <img
              ref={imgRef}
              src={file}
              alt="Center logo"
              style={{ height: "300px" }}
              onLoad={onImageLoad}
            />
          </ReactCrop>
        </div>

        <div className="text-center">
          <Button
            onClick={() => {
              setCanvasPreview(
                imgRef.current, // HTMLImageElement
                canvasRef.current, // HTMLCanvasElement
                convertToPixelCrop(
                  crop,
                  imgRef.current.width,
                  imgRef.current.height
                )
              );
              const dataUrl = canvasRef.current.toDataURL();
              setLogo("");
              setCropLogo(dataUrl);
            }}
            color="success"
            className="btn-soft-success text-white"
          >
            Crop
          </Button>
        </div>

        {crop && (
          <canvas
            ref={canvasRef}
            className="mt-4"
            style={{
              display: "none",
              border: "1px solid black",
              objectFit: "contain",
              width: 150,
              height: 150,
            }}
          />
        )}
      </ModalBody>
    </Modal>
  );
};

Editor.propTypes = {};

export default memo(Editor);
