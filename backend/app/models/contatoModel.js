// backend/app/models/contatoModel.js
const { pool } = require('../../config/database');

const findAll = async () => {
    const [rows] = await pool.execute("SELECT * FROM contato WHERE status = TRUE ORDER BY nome_completo");
    return rows;
};

const findById = async (id) => {
    const [rows] = await pool.execute("SELECT * FROM contato WHERE contato_id = ?", [id]);
    return rows[0];
};

const create = async (contactData) => {
    const { nome_completo, telefone, email } = contactData;
    const query = "INSERT INTO contato (nome_completo, telefone, email) VALUES (?, ?, ?)";
    const [result] = await pool.execute(query, [nome_completo, telefone, email]);
    return { id: result.insertId };
};

const update = async (id, contactData) => {
    const { nome_completo, telefone, email } = contactData;
    const query = "UPDATE contato SET nome_completo = ?, telefone = ?, email = ? WHERE contato_id = ?";
    const [result] = await pool.execute(query, [nome_completo, telefone, email, id]);
    return result;
};

// Soft delete: Apenas inativa o contato
const remove = async (id) => {
    const [result] = await pool.execute("UPDATE contato SET status = FALSE WHERE contato_id = ?", [id]);
    return result;
};

module.exports = { findAll, findById, create, update, remove };
