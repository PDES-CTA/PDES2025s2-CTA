package cta.web.dto

data class LoginResponse(
    val token: String,
    val type: String = "Bearer",
    val id: Long,
    val email: String,
    val nombre: String,
    val apellido: String,
    val role: String,
)
