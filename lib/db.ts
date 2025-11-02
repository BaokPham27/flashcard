import mysql from "mysql2/promise"

export const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "flashcard_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

export async function query(sql: string, values?: any[]) {
  const connection = await pool.getConnection()
  try {
    const [results] = await connection.execute(sql, values || [])
    return results
  } catch (error) {
    // Log the SQL and values to help debugging DB errors in development
    console.error("[db.query] error executing SQL:", sql, "values:", values, "error:", error)
    throw error
  } finally {
    connection.release()
  }
}

export async function getConnection() {
  return await pool.getConnection()
}
