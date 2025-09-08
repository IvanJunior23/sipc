// backend/routes/contatos.js
const express = require("express")
const router = express.Router()
const contatoController = require("../app/controllers/contatoController")
const { authenticateToken } = require("../middleware/auth")
const { validateContact } = require("../middleware/validation")

router.use(authenticateToken)

router.get("/", contatoController.list)
router.post("/", validateContact, contatoController.create)
router.put("/:id", validateContact, contatoController.update)
router.delete("/:id", contatoController.remove)

module.exports = router
