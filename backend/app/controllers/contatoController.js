// backend/app/controllers/contatoController.js
const contatoService = require("../services/contatoService")

const list = async (req, res, next) => {
  try {
    const contatos = await contatoService.getAllContatos()
    res.json({ success: true, data: contatos })
  } catch (error) {
    next(error)
  }
}

const create = async (req, res, next) => {
  try {
    const result = await contatoService.createContato(req.body)
    res.status(201).json({ success: true, ...result, message: "Contato criado com sucesso" })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
}

const update = async (req, res, next) => {
  try {
    const result = await contatoService.updateContato(req.params.id, req.body)
    res.json({ success: true, ...result })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
}

const remove = async (req, res, next) => {
  try {
    const result = await contatoService.deleteContato(req.params.id)
    res.json({ success: true, ...result })
  } catch (error) {
    res.status(404).json({ success: false, error: error.message })
  }
}

module.exports = {
  list,
  create,
  update,
  remove,
}
