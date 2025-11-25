package cta.web.dto

import cta.enum.UserRole

data class UserResponse(
    val id: Long,
    val email: String,
    val firstName: String,
    val lastName: String,
    val phone: String,
    val role: UserRole,
)
