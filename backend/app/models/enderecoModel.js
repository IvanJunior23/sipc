// backend/app/models/enderecoModel.js
const { pool } = require('../../config/database');

const findAll = async () => {
    const [rows] = await pool.execute("SELECT * FROM endereco WHERE status = TRUE ORDER BY logradouro");
    return rows;
};

const create = async (addressData) => {
    const { logradouro, numero, complemento, bairro, cidade, estado, cep } = addressData;
    const query = "INSERT INTO endereco (logradouro, numero, complemento, bairro, cidade, estado, cep) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const [result] = await pool.execute(query, [logradouro, numero, complemento, bairro, cidade, estado, cep]);
    return { id: result.insertId };
};

const update = async (id, addressData) => {
    const { logradouro, numero, complemento, bairro, cidade, estado, cep } = addressData;
    const query = "UPDATE endereco SET logradouro=?, numero=?, complemento=?, bairro=?, cidade=?, estado=?, cep=? WHERE endereco_id = ?";
    const [result] = await pool.execute(query, [logradouro, numero, complemento, bairro, cidade, estado, cep, id]);
    return result;
};

const remove = async (id) => {
    const [result] = await pool.execute("UPDATE endereco SET status = FALSE WHERE endereco_id = ?", [id]);
    return result;
};

module.exports = { findAll, create, update, remove };
