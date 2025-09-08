const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { pool } = require("../config/database")
const authController = require("../app/controllers/authController")
const passwordResetController = require("../app/controllers/passwordResetController")
const { authenticateToken, authorizeRole, validatePasswordChange } = require("../middleware/auth")
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../config/jwt")
const router = express.Router()

router.post("/login", authController.login)

router.post("/change-password", authenticateToken, validatePasswordChange, authController.changePassword)

router.post("/forgot-password", passwordResetController.forgotPassword)
router.post("/reset-password", passwordResetController.resetPassword)

// Verificar token
router.get("/verificar", authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: {
      usuario_id: req.user.id,
      email: req.user.email,
      tipo: req.user.tipo_usuario,
      nome: req.user.nome,
    },
  })
})

// Refresh token
router.post("/refresh", authenticateToken, (req, res) => {
  const newToken = jwt.sign(
    {
      id: req.user.id,
      nome: req.user.nome,
      tipo_usuario: req.user.tipo_usuario,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  )

  console.log("🔄 Token refreshed:", {
    userId: req.user.id,
    tokenLength: newToken.length,
    expiresIn: JWT_EXPIRES_IN,
  })

  res.json({
    success: true,
    token: newToken,
  })
})

// Logout
router.post("/logout", authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: "Logout realizado com sucesso",
  })
})

module.exports = router
