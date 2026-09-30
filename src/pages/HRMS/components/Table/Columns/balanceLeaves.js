import { formatLeaveDays } from "../../../../../utils/leaveDays";

export const balanceLeavesColumn = ({
  showWeekOffs = false,
  showCompOff = false,
} = {}) => [
  {
    name: "Category",
    cell: (row) => row.category,
  },
  {
    name: "Earned",
    cell: (row) => formatLeaveDays(row.earnedLeaves),
  },
  {
    name: "Festive",
    cell: (row) => formatLeaveDays(row.festiveLeaves),
  },
  // Week-off balance is only relevant for rotational-shift employees.
  ...(showWeekOffs
    ? [
        {
          name: "Week Offs",
          cell: (row) => formatLeaveDays(row.weekOffs),
        },
      ]
    : []),
  {
    name: "Unpaid",
    cell: (row) => formatLeaveDays(row.unpaidLeaves),
  },
  ...(showCompOff
    ? [
        {
          name: "Comp-Off's",
          cell: (row) => formatLeaveDays(row.compOff),
        },
      ]
    : []),
  // {
  //   name: "Comp-Off Carry Forwards",
  //   cell: (row) => {
  //     return row?.compOff ?? "-";
  //   }
  // },
  // {
  //   name: "Earned Carry Forwards",
  //   cell: (row) => row?.earnedLeaves ?? "-"
  // },

];
