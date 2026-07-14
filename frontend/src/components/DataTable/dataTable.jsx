import React, { useState } from "react";
import "./DataTable.css";

const DataTable = ({ data, columns, idField, deleteAPI, onUpdate }) => {
  const [selected, setSelected] = useState([]);

  // Select / Unselect one row
  const toggleSelect = (id) => {
    setSelected((prevSelected) => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter((item) => item !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  };

  // Select all rows
  const selectAll = (e) => {
    if (e.target.checked) {
      setSelected(data.map((item) => item[idField]));
    } else {
      setSelected([]);
    }
  };

  return (
    <div className="data-table-container">
      {/* Action Buttons */}
      <div className="action-bar">
        {/* ADDED type="button" HERE */}
        <button
          type="button" 
          disabled={selected.length !== 1}
          onClick={() => {
            const selectedRow = data.find(
              (row) => row[idField] === selected[0],
            );

            if (selectedRow) {
              onUpdate(selectedRow);
            }
          }}
        >
          Update
        </button>

        {/* ADDED type="button" HERE */}
        <button type="button" disabled={selected.length === 0}>
          Delete
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>
              <input type="checkbox" onChange={selectAll} />
            </th>

            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.length > 0 ? (
            data.map((row) => (
              <tr key={row[idField]}>
                <td>
                  <input
                    type="checkbox"
                    checked={selected.includes(row[idField])}
                    onChange={() => toggleSelect(row[idField])}
                  />
                </td>

                {columns.map((col) => (
                  <td key={col.key}>{row[col.key]}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + 1}>No data found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;