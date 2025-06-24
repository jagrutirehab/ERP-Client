import React from "react";
import ReactECharts from "echarts-for-react";

const index = () => {
  return (
    <React.Fragment>
      <div className="page-content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="page-title-box d-sm-flex align-items-center justify-content-between">
                <h4 className="mb-sm-0 font-size-18">Dashboard</h4>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Dashboard</h5>
                <p className="card-text">This is the dashboard content.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">ECharts Example</h5>
                <ReactECharts
                  option={{
                    title: {
                      text: "Stacked Line",
                    },
                    tooltip: {
                      trigger: "axis",
                    },
                    legend: {
                      data: [
                        "Email",
                        "Union Ads",
                        "Video Ads",
                        "Direct",
                        "Search Engine",
                      ],
                    },
                    grid: {
                      left: "3%",
                      right: "4%",
                      bottom: "3%",
                      containLabel: true,
                    },
                    toolbox: {
                      feature: {
                        saveAsImage: {},
                      },
                    },
                    xAxis: {
                      type: "category",
                      boundaryGap: false,
                      data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                    },
                    yAxis: {
                      type: "value",
                    },
                    series: [
                      {
                        name: "Email",
                        type: "line",
                        stack: "Total",
                        data: [120, 132, 101, 134, 90, 230, 210],
                      },
                      {
                        name: "Union Ads",
                        type: "line",
                        stack: "Total",
                        data: [220, 182, 191, 234, 290, 330, 310],
                      },
                      {
                        name: "Video Ads",
                        type: "line",
                        stack: "Total",
                        data: [150, 232, 201, 154, 190, 330, 410],
                      },
                      {
                        name: "Direct",
                        type: "line",
                        stack: "Total",
                        data: [320, 332, 301, 334, 390, 330, 320],
                      },
                      {
                        name: "Search Engine",
                        type: "line",
                        stack: "Total",
                        data: [820, 932, 901, 934, 1290, 1330, 1320],
                      },
                    ],
                  }}
                />
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">ECharts Example</h5>
                <ReactECharts
                  option={{
                    title: {
                      text: "Bar Chart",
                    },
                    tooltip: {},
                    xAxis: {
                      data: [
                        "Shirts",
                        "Cardigans",
                        "Chiffons",
                        "Pants",
                        "Heels",
                        "Socks",
                      ],
                    },
                    yAxis: {},
                    series: [
                      {
                        name: "Sales",
                        type: "bar",
                        data: [5, 20, 36, 10, 10, 20],
                      },
                    ],
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default index;
