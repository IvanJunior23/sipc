// backend/app/services/contatoService.js
const contatoModel = require("../models/contatoModel")

const getAllContatos = async () => {
  return await contatoModel.findAll()
}

const createContato = async (contactData) => {
  return await contatoModel.create(contactData)
}

const updateContato = async (id, contactData) => {
  const result = await contatoModel.update(id, contactData)
  if (result.affectedRows === 0) {
    throw new Error("Contato não encontrado ou nenhum dado alterado.")
  }
  return { message: "Contato atualizado com sucesso" }
}

const deleteContato = async (id) => {
  const result = await contatoModel.remove(id)
  if (result.affectedRows === 0) {
    throw new Error("Contato não encontrado.")
  }
  return { message: "Contato inativado com sucesso" }
}

module.exports = { getAllContatos, createContato, updateContato, deleteContato }
