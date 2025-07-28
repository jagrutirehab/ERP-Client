// import React from "react";
// import { Card } from "./Card";
// import {
//   Trash2 as TrashIcon,
//   Edit as PencilAltIcon,
//   Plus as PlusIcon,
// } from "lucide-react";

// export const RoleCard = ({
//   totalUsers = 0,
//   avatars = [],
//   roleName = "Unnamed Role",
//   onEdit,
//   onDelete,
// }) => (
//   <Card className="flex flex-col justify-between w-full sm:w-64 md:w-72 h-full p-4">
//     <div className="flex justify-between items-center mb-4">
//       <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
//         Total {totalUsers} user{totalUsers !== 1 && "s"}
//       </span>
//       {totalUsers > 0 && avatars.length > 0 && (
//         <div className="flex -space-x-2">
//           {avatars.slice(0, 3).map((src, i) => (
//             <img
//               key={i}
//               src={src}
//               className="w-8 h-8 rounded-full ring-2 ring-white dark:ring-gray-800"
//               alt=""
//             />
//           ))}
//           {avatars.length > 3 && (
//             <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 ring-2 ring-white dark:ring-gray-800">
//               +{avatars.length - 3}
//             </span>
//           )}
//         </div>
//       )}
//     </div>

//     <div className="flex items-center justify-between">
//       <div>
//         <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
//           {roleName}
//         </h3>
//         <button
//           onClick={onEdit}
//           className="mt-1 text-sm text-indigo-600 hover:underline dark:text-indigo-400"
//         >
//           <PencilAltIcon className="inline w-4 h-4 mr-1" /> Edit Role
//         </button>
//       </div>
//       <button
//         onClick={onDelete}
//         className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
//       >
//         <TrashIcon className="w-5 h-5" />
//       </button>
//     </div>
//   </Card>
// );

// export const AddRoleCard = ({ onAdd }) => (
//   <Card className="flex flex-col items-center justify-center text-center w-full sm:w-64 md:w-72 h-full p-4">
//     {/* <PlusIcon className="w-12 h-12 text-indigo-500 mb-4" /> */}
//     <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
//       Add Role
//     </h3>
//     <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
//       Add new role, if it doesn’t exist.
//     </p>
//     <button
//       onClick={onAdd}
//       className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
//     >
//       <PlusIcon className="w-5 h-5 mr-2" /> Add Role
//     </button>
//   </Card>
// );
