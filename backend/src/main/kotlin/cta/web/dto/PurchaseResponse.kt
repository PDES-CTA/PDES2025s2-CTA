package cta.web.dto

import cta.model.Purchase
import java.math.BigDecimal
import java.time.LocalDateTime

data class PurchaseResponse(
    val id: Long?,
    val buyerId: Long?,
    val carId: Long?,
    val dealershipId: Long?,
    val purchaseDate: LocalDateTime,
    val finalPrice: BigDecimal,
    val purchaseStatus: String,
    val paymentMethod: String,
    val observations: String?
) {
    companion object {
        fun fromEntity(purchase: Purchase): PurchaseResponse {
            return PurchaseResponse(
                id = purchase.id,
                buyerId = purchase.buyerId,
                carId = purchase.car.id,
                dealershipId = purchase.dealershipId,
                purchaseDate = purchase.purchaseDate,
                finalPrice = purchase.finalPrice,
                purchaseStatus = purchase.purchaseStatus.toString(),
                paymentMethod = purchase.paymentMethod.toString(),
                observations = purchase.observations,
            )
        }
    }
}