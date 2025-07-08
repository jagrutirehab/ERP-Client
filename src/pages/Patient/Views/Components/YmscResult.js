import 'bootstrap/dist/css/bootstrap.min.css';

const YmscResult = ({ resultData }) => {

  // const {
  //   systemTotalScore,
  //   systemInterpretation,
  //   systemRecommendation,
  //   observation,
  //   evidence,
  //   documentationLink
  // } = resultData;


  return (
    <div className="">
      <div className="p-4 bg-light border border-primary rounded shadow-lg">
        <h2 className="h5 h4-sm fw-semibold text-primary mb-3">
          <i className="fas fa-chart-line me-2 text-primary"></i>
          Young Mania Rating Scale
        </h2>

        <div className="mb-3">
          <p className="h6 fw-semibold text-indigo">
            Total YMRS Score:{" "}
            <span className="display-6 fw-bold">
              {resultData?.systemTotalScore || 0}
            </span>{" "}

          </p>
        </div>

        <p className="text-dark fs-6 lh-lg mb-4">
          <span className="fw-bold text-primary">Interpretation:</span>{" "}
          {resultData?.systemInterpretation || "No Interpretation"}
        </p>

        <div className="text-dark fs-6 lh-lg mb-4">
          <span className="fw-bold text-success">Recommendation:</span>
          <ul className="mt-2 ms-4">
            {(resultData?.systemRecommendation)}
          </ul>
        </div>
        {/* <div className="text-dark fs-6 lh-lg mb-4">
          <span className="fw-bold text-success">Overall Documented Evidence:</span>
          <ul className="mt-2 ms-4">
            {(evidence)}
          </ul>
          <div className='d-flex'>
            <div>Document Link : &nbsp;</div>
            <a target='_blank' href={documentationLink} >{documentationLink}</a>
          </div>
        </div> */}

        {/* Observations */}
        <div className="mt-3 border border-secondary rounded p-3 bg-white">
          <p className="fw-semibold text-secondary mb-2">
            Psychologist's Observations:
          </p>
          <p className="text-dark" style={{ whiteSpace: "pre-wrap" }}>
            {resultData?.observation || "No observations recorded."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default YmscResult;
