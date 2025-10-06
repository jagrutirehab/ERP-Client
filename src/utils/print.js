import printJS from "print-js";

export const handlePrint = (ref) => {
  if (printJS && ref.current) {
    printJS({
      printable: ref.current.innerHTML,
      type: "raw-html",
      scanStyles: false,
      style: `
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body { font-family: Arial, sans-serif; }
          /* General Print Styles */
          .p-print {
            padding-left: 1rem;
            padding-right: 1rem;
            padding-top: 2.5rem;
            padding-bottom: 2.5rem;
            position: absolute;
            z-index: -10;
          }

          /* Header */
          .p-header {
            margin-bottom: 1rem;
          }

          /* Title */
          .text-4xl {
            font-size: 2.25rem;
            font-weight: 600;
          }

          .text-3xl {
            font-size: 1.5rem;
            font-weight: 600;
          }

          .text-2xl {
            font-size: 1.5rem;
            font-weight: 600;
          }

          .doc {
            background-color: gray;
          }

          .text-center {
            text-align: center;
          }

          .text-md {
            font-size: 0.7rem;
            font-weight: 600;
          }

          .text-xl {
            font-size: 1.2rem;
            font-weight: 700;
          }

          .text-lg {
            font-size: 1.125rem;
          }

          .font-bold {
            font-weight: 700;
          }

          .font-semibold {
            font-weight: 600;
          }

          .font-normal {
            font-weight: 400;
          }

          /* Text Colors */
          .text-pink-600 {
            color: #db2777;
          }

          .text-gray-600 {
            color: #4b5563;
          }

          .text-gray-800 {
            color: #1f2937;
          }

          .text-blue-600 {
            color: #2563eb;
          }

          .text-green-600 {
            color: #059669;
          }

          .capitalize {
            text-transform: capitalize;
          }

          .col-span-12 {
            grid-column: span 12 / span 12;
          }

          .list-disc {
            list-style-type: disc;
          }

          .pl-6 {
            padding-left: 1.5rem;
          }

          .space-y-1 > * + * {
            margin-top: 0.25rem;
          }

          .mb-1 {
            margin-bottom: 0.25rem;
          }

          /* Grid Layout */
          .grid {
            display: grid;
          }

          .grid-cols-12 {
            grid-template-columns: repeat(12, minmax(0, 1fr));
          }

          .col-span-6 {
            grid-column: span 6 / span 6;
          }

          .col-span-3 {
            grid-column: span 3 / span 3;
          }

          .col-span-2 {
            grid-column: span 2 / span 2;
          }

          .col-span-4 {
            grid-column: span 4 / span 4;
          }

          .col-span-8 {
            grid-column: span 8 / span 8;
          }

          .col-span-7 {
            grid-column: span 7 / span 7;
          }

          .col-span-10 {
            grid-column: span 10 / span 10;
          }

          /* Background Colors */
          .bg-pink-600 {
            background-color: #db2777;
          }

          .bg-secondary {
            background-color: #3b82f6;
          }

          .bg-gray-200 {
            background-color: #e5e7eb;
          }

          .bg-gray-300 {
            background-color: #d1d5db;
          }

          .bg-white {
            background-color: #ffffff;
          }

          .gap-2 {
            gap: 0.5rem;
          }

          .gap-4 {
            gap: 1rem;
          }

          /* Border Styles */
          .border-2 {
            border-width: 2px;
          }

          .border-b-gray-900 {
            border-bottom-color: #111827;
            border-bottom-width: 2px;
          }

          .border-b-gray-900.border-2 {
            border-bottom-width: 2px;
            border-bottom-color: #111827;
          }

          .border {
            border-width: 1px;
          }

          .border-b {
            border-bottom-width: 1px;
          }

          .border-t {
            border-top-width: 1px;
          }

          .border-gray-300 {
            border-color: #d1d5db;
          }

          .h-2 {
            height: 2px;
          }

          /* Padding */
          .p-2 {
            padding: 0.5rem;
          }

          .p-3 {
            padding: 0.75rem;
          }

          .p-4 {
            padding: 1rem;
          }

          .p-5 {
            padding: 1.25rem;
          }

          .p-6 {
            padding: 1.5rem;
          }

          .px-3 {
            padding-left: 0.75rem;
            padding-right: 0.75rem;
          }

          .px-4 {
            padding-left: 1rem;
            padding-right: 1rem;
          }

          .py-2 {
            padding-top: 0.5rem;
            padding-bottom: 0.5rem;
          }

          .py-10 {
            padding-top: 2.5rem;
            padding-bottom: 2.5rem;
          }

          /* Margins */

          .m-auto {
            margin: 0 auto;
          }

          .mb-2 {
            margin-bottom: 0.5rem;
          }

          .mb-4 {
            margin-bottom: 1rem;
          }

          .mb-6 {
            margin-bottom: 1.5rem;
          }

          .mb-8 {
            margin-bottom: 2rem;
          }

          .mt-4 {
            margin-top: 1rem;
          }

          .my-4 {
            margin-top: 1rem;
            margin-bottom: 1rem;
          }

          .my-6 {
            margin-top: 3rem;
            margin-bottom: 3rem;
          }

          /* Flexbox */
          .flex {
            display: flex;
          }

          .flex-col {
            flex-direction: column;
          }

          .justify-between {
            justify-content: space-between;
          }

          .items-center {
            align-items: center;
          }

          /* Position */
          .absolute {
            position: absolute;
          }

          /* Z-Index */
          .-z-10 {
            z-index: -10;
          }

          /* Table Styles */
          .p-table {
            margin-bottom: 1rem;
          }

          .p-table-header .grid {
            background-color: #d1d5db;
            padding: 0.75rem;
          }

          .p-table-body .grid {
            padding-left: 0.75rem;
            padding-right: 0.75rem;
            padding-top: 0.5rem;
            padding-bottom: 0.5rem;
            border-bottom-width: 2px;
            border-bottom-color: #111827;
            background-color: #e5e7eb;
          }

          /* Space utilities */
          .space-y-3 > * + * {
            margin-top: 0.75rem;
          }

          /* Rounded corners */
          .rounded-lg {
            border-radius: 0.5rem;
          }

          /* Shadow */
          .shadow-lg {
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          }
        }
      `,
    });
  }
};
