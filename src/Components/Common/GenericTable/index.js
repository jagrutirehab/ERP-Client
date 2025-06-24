import React from "react";
import PropTypes from "prop-types";
import { Table, Button } from "reactstrap";

const GenericTable = ({ data, columns, onEdit, onDelete, renderCustomRow }) => {
  return (
    <Table bordered hover className="bg-white">
      <thead className="table-primary text-center">
        <tr>
          {columns.map((col) => (
            <th key={col.key}>{col.label}</th>
          ))}
          {(onEdit || onDelete) && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {(data || []).map((item, idx) => {
          if (renderCustomRow) {
            return renderCustomRow(item, idx);
          }

          return (
            <tr key={item._id || idx}>
              {columns.map((col) => (
                <td key={col.key}>{item[col.key] || ""}</td>
              ))}
              {(onEdit || onDelete) && (
                <td>
                  {onEdit && (
                    <Button
                      size="sm"
                      color="info"
                      className="me-2"
                      onClick={() => onEdit(idx, item)}
                    >
                      <i className="ri-quill-pen-line"></i>
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      size="sm"
                      color="danger"
                      outline
                      onClick={() => onDelete(item)}
                    >
                      <i className="ri-close-circle-line"></i>
                    </Button>
                  )}
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};

GenericTable.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      label: PropTypes.string,
    })
  ).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  renderCustomRow: PropTypes.func,
};

export default GenericTable;
