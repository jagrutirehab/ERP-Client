import { Badge } from "reactstrap";
import moment from "moment";

const Center = ({ children }) => (
  <div className="text-center w-100">{children}</div>
);

const minutesTo12HourTime = (minutes) => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  const period = hrs >= 12 ? "PM" : "AM";
  const hour12 = hrs % 12 || 12;

  return `${hour12}:${mins.toString().padStart(2, "0")} ${period}`;
};

const minutesTo24HourTime = (minutes) => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${hrs.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}`;
};

export const MyRegularizationsColumn = () => [
  {
    name: <Center>Date</Center>,
    cell: (row) => (
      <Center>{row?.date ? moment(row.date).format("DD-MM-YYYY") : "-"}</Center>
    ),
    width: "150px",
  },

  {
    name: <Center>Requested In</Center>,
    cell: (row) => (
      <Center>
        {row?.reqClockInTime != null
          ? minutesTo24HourTime(row.reqClockInTime)
          : "-"}
      </Center>
    ),
    width: "150px",
  },

  {
    name: <Center>Requested Out</Center>,
    cell: (row) => (
      <Center>
        {row?.reqClockOutTime != null
          ? minutesTo24HourTime(row.reqClockOutTime)
          : "-"}
      </Center>
    ),
    width: "150px",
  },

  {
    name: <Center>Manager Name</Center>,
    cell: (row) => <Center>{row?.manager_id?.name}</Center>,
    width: "150px",
  },

  {
    name: <Center>Reason</Center>,
    cell: (row) => (
      <Center>
        <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
          {row?.description || "-"}
        </div>
      </Center>
    ),
    wrap: true,
    minWidth: "250px",
  },

  {
    name: <Center>Status</Center>,
    cell: (row) => {
      const status = row?.status?.toLowerCase();

      if (status === "regularized")
        return (
          <Center>
            <Badge pill color="success">
              Regularized
            </Badge>
          </Center>
        );

      if (status === "pending")
        return (
          <Center>
            <Badge pill color="warning">
              Pending
            </Badge>
          </Center>
        );

      if (status === "rejected")
        return (
          <Center>
            <Badge pill color="danger">
              Rejected
            </Badge>
          </Center>
        );

      return (
        <Center>
          <Badge pill color="secondary">
            Unknown
          </Badge>
        </Center>
      );
    },
    width: "150px",
  },

  {
    name: <Center>Requested On</Center>,
    cell: (row) => (
      <Center>
        {row?.createdAt ? moment(row.createdAt).format("DD-MM-YYYY") : "-"}
      </Center>
    ),
    width: "150px",
  },
  {
    name: <Center>Action On</Center>,
    cell: (row) => (
      <Center>
        {row?.action_on ? moment(row?.action_on).format("DD-MM-YYYY") : "-"}
      </Center>
    ),
    width: "150px",
  },
];
