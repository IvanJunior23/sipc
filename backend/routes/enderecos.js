// backend/routes/enderecos.js
const express = require("express")
const router = express.Router()
const enderecoController = require("../app/controllers/enderecoController")
const { authenticateToken } = require("../middleware/auth")
const { validateAddress } = require("../middleware/validation")

router.use(authenticateToken)

router.get("/", enderecoController.list)
router.post("/", validateAddress, enderecoController.create)
router.put("/:id", validateAddress, enderecoController.update)
router.delete("/:id", enderecoController.remove)

module.exports = router
