package cta.web.dto

import java.time.LocalDateTime

data class AdminBuyerResponse(
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
)