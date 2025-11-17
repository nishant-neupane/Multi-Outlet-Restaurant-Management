"use client"

import { useState } from "react"

export default function TablesPage() {
  const [tables, setTables] = useState(
    Array.from({ length: 10 }, (_, i) => ({
      number: i + 1,
      status: Math.random() > 0.6 ? "occupied" : "available",
      occupants: Math.random() > 0.6 ? Math.floor(Math.random() * 4) + 1 : 0,
    }))
  )

  const toggleTableStatus = (tableNumber) => {
    setTables(
      tables.map((table) =>
        table.number === tableNumber
          ? {
              ...table,
              status: table.status === "available" ? "occupied" : "available",
              occupants: table.status === "available" ? 2 : 0,
            }
          : table
      )
    )
  }

  const availableTables = tables.filter((t) => t.status === "available").length
  const occupiedTables = tables.filter((t) => t.status === "occupied").length

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-color-primary mb-8">Table Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-color-background rounded-lg shadow p-6">
          <p className="text-sm text-color-text-light">Total Tables</p>
          <p className="text-3xl font-bold text-color-primary mt-2">{tables.length}</p>
        </div>
        <div className="bg-color-background rounded-lg shadow p-6">
          <p className="text-sm text-color-text-light">Available</p>
          <p className="text-3xl font-bold text-color-success mt-2">{availableTables}</p>
        </div>
        <div className="bg-color-background rounded-lg shadow p-6">
          <p className="text-sm text-color-text-light">Occupied</p>
          <p className="text-3xl font-bold text-color-warning mt-2">{occupiedTables}</p>
        </div>
      </div>

      <div className="bg-color-background rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-color-primary mb-6">Floor Plan</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {tables.map((table) => (
            <button
              key={table.number}
              onClick={() => toggleTableStatus(table.number)}
              className={`p-6 rounded-lg font-bold text-lg transition ${
                table.status === "available"
                  ? "bg-color-success text-white hover:bg-green-700"
                  : "bg-color-warning text-white hover:bg-yellow-700"
              }`}
            >
              <div>Table {table.number}</div>
              {table.status === "occupied" && (
                <div className="text-sm mt-2">{table.occupants} guests</div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
