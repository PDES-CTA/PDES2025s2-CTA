package cta.web.dto

import java.time.LocalDateTime

data class AdminDealershipResponse(
    val id: Long,
    val businessName: String,
    val email: String,
    val phone: String,
    val address: String,
    val cuit: String,
    val active: Boolean,
    val createdAt: LocalDateTime,
    val totalListings: Int,
    val totalSales: Int,
)
