package cta.web.dto

import java.math.BigDecimal
import java.time.LocalDateTime

data class AdminPurchaseResponse(
    val id: Long,
    val buyerEmail: String,
    val buyerName: String,
    val carName: String,
    val dealershipName: String,
    val finalPrice: BigDecimal,
    val purchaseDate: LocalDateTime,
    val purchaseStatus: String,
    val paymentMethod: String,
    val observations: String?,
)
