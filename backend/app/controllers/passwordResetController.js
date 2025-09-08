const crypto = require("crypto")
const bcrypt = require("bcryptjs")
const UserModel = require("../models/userModel")

// Store reset codes temporarily (in production, use Redis or database)
const resetCodes = new Map()

let transporter = null
let emailConfigured = false

try {
  const nodemailer = require("nodemailer")

  // Check if SMTP configuration is available
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
    emailConfigured = true
    console.log("✅ Email transporter configured successfully")
  } else {
    console.log("⚠️ SMTP credentials not configured - email functionality disabled")
  }
} catch (error) {
  console.log("⚠️ Nodemailer not available - email functionality disabled:", error.message)
}

const forgotPassword = async (req, res) => {
  try {
    console.log("🔄 Processing forgot password request for:", req.body.email)

    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "E-mail é obrigatório",
      })
    }

    // Check if user exists
    const user = await UserModel.findByEmail(email)
    if (!user) {
      console.log("❌ User not found for email:", email)
      return res.status(404).json({
        success: false,
        message: "E-mail não encontrado",
      })
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // Store code with expiration (15 minutes)
    resetCodes.set(email, {
      code,
      expires: Date.now() + 15 * 60 * 1000,
      userId: user.usuario_id, // Fixed: use usuario_id instead of id
    })

    if (!emailConfigured) {
      console.log("⚠️ Email not configured - showing code directly for development")
      return res.json({
        success: true,
        message: "E-mail não configurado. Use o código abaixo:",
        developmentMode: true,
        code: code, // Show code directly when email is not configured
        warning: "ATENÇÃO: Em produção, configure o SMTP para envio por e-mail",
      })
    }

    console.log("📧 Sending reset code to:", email)

    // Send email
    const mailOptions = {
      from: process.env.SMTP_FROM || "noreply@sipc.com",
      to: email,
      subject: "SIPC - Código de Recuperação de Senha",
      html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1ABC9C;">SIPC - Recuperação de Senha</h2>
                    <p>Você solicitou a recuperação de senha para sua conta no SIPC.</p>
                    <p>Use o código abaixo para alterar sua senha:</p>
                    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0;">
                        <h1 style="color: #1ABC9C; font-size: 32px; letter-spacing: 8px; margin: 0;">${code}</h1>
                    </div>
                    <p><strong>Este código expira em 15 minutos.</strong></p>
                    <p>Se você não solicitou esta recuperação, ignore este e-mail.</p>
                    <hr style="margin: 30px 0;">
                    <p style="color: #666; font-size: 12px;">
                        Sistema de Inventário de Peças para Computadores<br>
                        Este é um e-mail automático, não responda.
                    </p>
                </div>
            `,
    }

    await transporter.sendMail(mailOptions)
    console.log("✅ Reset code sent successfully to:", email)

    res.json({
      success: true,
      message: "Código enviado para seu e-mail",
    })
  } catch (error) {
    console.error("❌ Erro ao enviar código de recuperação:", error)
    res.status(500).json({
      success: false,
      message: "Erro ao enviar e-mail. Verifique a configuração SMTP.",
    })
  }
}

const resetPassword = async (req, res) => {
  try {
    console.log("🔄 Processing password reset for:", req.body.email)

    const { email, codigo, novaSenha } = req.body

    if (!email || !codigo || !novaSenha) {
      return res.status(400).json({
        success: false,
        message: "Todos os campos são obrigatórios",
      })
    }

    // Check if code exists and is valid
    const resetData = resetCodes.get(email)
    if (!resetData) {
      console.log("❌ Reset code not found for email:", email)
      return res.status(400).json({
        success: false,
        message: "Código não encontrado",
      })
    }

    // Check if code is expired
    if (Date.now() > resetData.expires) {
      resetCodes.delete(email)
      console.log("❌ Reset code expired for email:", email)
      return res.status(400).json({
        success: false,
        message: "Código expirado",
      })
    }

    // Check if code matches
    if (resetData.code !== codigo) {
      console.log("❌ Invalid reset code for email:", email)
      return res.status(400).json({
        success: false,
        message: "Código inválido",
      })
    }

    // Validate password length
    if (novaSenha.length < 6) {
      return res.status(400).json({
        success: false,
        message: "A senha deve ter pelo menos 6 caracteres",
      })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(novaSenha, 10)

    // Update user password
    await UserModel.updatePassword(resetData.userId, hashedPassword)

    // Remove used code
    resetCodes.delete(email)

    console.log("✅ Password reset successfully for user:", resetData.userId)

    res.json({
      success: true,
      message: "Senha alterada com sucesso",
    })
  } catch (error) {
    console.error("❌ Erro ao alterar senha:", error)
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    })
  }
}

module.exports = {
  forgotPassword,
  resetPassword,
}
