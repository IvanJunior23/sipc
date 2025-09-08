// backend/app/controllers/enderecoController.js
const enderecoService = require("../services/enderecoService")

const list = async (req, res, next) => {
  try {
    const enderecos = await enderecoService.getAllEnderecos()
    res.json({ success: true, data: enderecos })
  } catch (error) {
    next(error)
  }
}

const create = async (req, res, next) => {
  try {
    const result = await enderecoService.createEndereco(req.body)
    res.status(201).json({ success: true, ...result, message: "Endereço criado com sucesso" })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
}

const update = async (req, res, next) => {
  try {
    const result = await enderecoService.updateEndereco(req.params.id, req.body)
    res.json({ success: true, ...result })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
}

const remove = async (req, res, next) => {
  try {
    const result = await enderecoService.deleteEndereco(req.params.id)
    res.json({ success: true, ...result })
  } catch (error) {
    res.status(404).json({ success: false, error: error.message })
  }
}

module.exports = { list, create, update, remove }
