// backend/app/services/authService.js
const userModel = require("../models/userModel")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../../config/jwt")
const jwtDebugger = require("../../utils/jwtDebugger")

const login = async (email, senha) => {
  // 1. Encontra o usuário pelo e-mail
  const user = await userModel.findByEmail(email)
  if (!user) {
    throw new Error("Credenciais inválidas") // Mensagem genérica por segurança
  }

  // 2. Verifica se o usuário está ativo
  if (!user.status) {
    throw new Error("Este usuário está inativo.")
  }

  // 3. Compara a senha enviada com a senha armazenada (hash)
  const senhaValida = await bcrypt.compare(senha, user.senha)
  if (!senhaValida) {
    throw new Error("Credenciais inválidas")
  }

  // 4. Se tudo estiver correto, cria o "payload" para o token
  const payload = {
    id: user.usuario_id,
    nome: user.nome,
    tipo_usuario: user.tipo_usuario,
  }

  try {
    // 5. Gera o token JWT com debugging completo
    const token = jwtDebugger.debugTokenGeneration(payload, { expiresIn: JWT_EXPIRES_IN })

    // Verify token immediately after generation
    const decoded = jwtDebugger.debugTokenVerification(token, JWT_SECRET)

    // Additional payload validation
    if (decoded.id !== user.usuario_id) {
      jwtDebugger.log("ERROR", "Token payload mismatch - user ID", {
        expectedId: user.usuario_id,
        actualId: decoded.id,
      })
      throw new Error("Token payload mismatch - user ID")
    }

    if (decoded.tipo_usuario !== user.tipo_usuario) {
      jwtDebugger.log("ERROR", "Token payload mismatch - user type", {
        expectedType: user.tipo_usuario,
        actualType: decoded.tipo_usuario,
      })
      throw new Error("Token payload mismatch - user type")
    }

    jwtDebugger.log("SUCCESS", "Login completed successfully", {
      userId: user.usuario_id,
      userType: user.tipo_usuario,
      tokenGenerated: true,
    })

    // 6. Prepara o objeto de usuário para retornar ao frontend (sem a senha)
    const userResponse = {
      usuario_id: user.usuario_id,
      nome: user.nome,
      email: user.email,
      tipo_usuario: user.tipo_usuario,
    }

    return { token, user: userResponse }
  } catch (error) {
    jwtDebugger.log("ERROR", "Login process failed", {
      userId: user.usuario_id,
      error: error.message,
      stack: error.stack,
    })
    throw new Error("Erro interno na geração do token")
  }
}

const changePassword = async (userId, senhaAtual, novaSenha) => {
  // 1. Encontra o usuário pelo ID
  const user = await userModel.findById(userId)
  if (!user) {
    throw new Error("Usuário não encontrado")
  }

  // 2. Verifica se o usuário está ativo
  if (!user.status) {
    throw new Error("Este usuário está inativo.")
  }

  // 3. Busca a senha atual do banco para comparação
  const userWithPassword = await userModel.findByEmail(user.email)
  if (!userWithPassword) {
    throw new Error("Erro ao verificar credenciais")
  }

  // 4. Verifica se a senha atual está correta
  const senhaAtualValida = await bcrypt.compare(senhaAtual, userWithPassword.senha)
  if (!senhaAtualValida) {
    throw new Error("Senha atual incorreta")
  }

  // 5. Verifica se a nova senha é diferente da atual
  const novaSenhaIgualAtual = await bcrypt.compare(novaSenha, userWithPassword.senha)
  if (novaSenhaIgualAtual) {
    throw new Error("A nova senha deve ser diferente da senha atual")
  }

  // 6. Criptografa a nova senha
  const novaSenhaCriptografada = await bcrypt.hash(novaSenha, 10)

  // 7. Atualiza a senha no banco de dados
  await userModel.update(userId, { senhaCriptografada: novaSenhaCriptografada })

  return { message: "Senha alterada com sucesso" }
}

module.exports = { login, changePassword }
