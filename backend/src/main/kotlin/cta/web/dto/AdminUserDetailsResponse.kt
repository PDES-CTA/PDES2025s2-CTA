package cta.web.dto

import java.math.BigDecimal
import java.time.LocalDateTime

data class AdminUserDetailsResponse(
    val id: Long,
    val email: String,
    val firstName: String,
    val lastName: String,
    val phone: String,
    val dni: String,
    val address: String,
    val active: Boolean,
    val createdAt: LocalDateTime,
    val totalFavorites: Int,
    val totalPurchases: Int,
    val totalMoneySpent: BigDecimal,
    val favoriteCount: Int,
    val reviewCount: Int,
)
