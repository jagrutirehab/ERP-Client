export const balanceLeavesColumn = ({ showWeekOffs = false } = {}) => [
  {
    name: "Category",
    cell: (row) => row.category,
  },
  {
    name: "Earned",
    cell: (row) => row.earnedLeaves ?? "-",
  },
  {
    name: "Festive",
    cell: (row) => row.festiveLeaves ?? "-",
  },
  // Week-off balance is only relevant for rotational-shift employees.
  ...(showWeekOffs
    ? [
        {
          name: "Week Offs",
          cell: (row) => row.weekOffs ?? "-",
        },
      ]
    : []),
  {
    name: "Unpaid",
    cell: (row) => row.unpaidLeaves ?? "-",
  },
  {
    name: "Comp-Off's",
    cell: (row) => row.compOff ?? "-",
  },
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
