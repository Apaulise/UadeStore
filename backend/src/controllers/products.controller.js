import { getPool, sql } from "../db/pool.js";

export async function listProducts(req, res, next) {
  try {
    const { search = "", category = "" } = req.query;
    const pool = await getPool();
    const result = await pool.request()
      .input("search", sql.VarChar, `%${search}%`)
      .input("category", sql.VarChar, category)
      .query(`
        SELECT TOP 50 p.Id, p.Name, p.Price, p.Stock, p.ImageUrl, c.Name AS Category
        FROM Products p
        LEFT JOIN Categories c ON c.Id = p.CategoryId
        WHERE (@search = '%%' OR p.Name LIKE @search)
          AND (@category = '' OR c.Name = @category)
        ORDER BY p.Id DESC
      `);
    res.json(result.recordset);
  } catch (e) { next(e); }
}

export async function getProductById(req, res, next) {
  try {
    const { id } = req.params;
    const pool = await getPool();
    const result = await pool.request()
      .input("id", sql.Int, Number(id))
      .query(`
        SELECT p.Id, p.Name, p.Description, p.Price, p.Stock, p.ImageUrl, c.Name AS Category
        FROM Products p
        LEFT JOIN Categories c ON c.Id = p.CategoryId
        WHERE p.Id = @id
      `);
    if (result.recordset.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(result.recordset[0]);
  } catch (e) { next(e); }
}
