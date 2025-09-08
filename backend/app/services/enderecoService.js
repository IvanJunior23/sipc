// backend/app/services/enderecoService.js
const enderecoModel = require("../models/enderecoModel")

const getAllEnderecos = async () => {
  return await enderecoModel.findAll()
}

const createEndereco = async (addressData) => {
  return await enderecoModel.create(addressData)
}

const updateEndereco = async (id, addressData) => {
  const result = await enderecoModel.update(id, addressData)
  if (result.affectedRows === 0) throw new Error("Endereço não encontrado.")
  return { message: "Endereço atualizado com sucesso" }
}

const deleteEndereco = async (id) => {
  const result = await enderecoModel.remove(id)
  if (result.affectedRows === 0) throw new Error("Endereço não encontrado.")
  return { message: "Endereço inativado com sucesso" }
}

module.exports = { getAllEnderecos, createEndereco, updateEndereco, deleteEndereco }
