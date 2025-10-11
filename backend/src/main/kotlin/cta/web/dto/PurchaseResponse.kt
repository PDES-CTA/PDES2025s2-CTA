package cta.web.dto

import cta.model.Purchase
import io.swagger.v3.oas.annotations.media.Schema
import java.math.BigDecimal
import java.time.LocalDateTime

@Schema(description = "Purchase information response object containing all purchase details")
data class PurchaseResponse(
    @field:Schema(description = "Unique identifier for the purchase")
    val id: Long?,

    @field:Schema(description = "Buyer ID of the buyer involved in the purchase")
    val buyerId: Long?,

    @field:Schema(description = "Car ID of the car bought")
    val carId: Long?,

    @field:Schema(description = "Dealership ID that sold the car")
    val dealershipId: Long?,

    @field:Schema(description = "Purchase date creation")
    val purchaseDate: LocalDateTime,

    @field:Schema(description = "Price of the car that was sold")
    val finalPrice: BigDecimal,

    @field:Schema(description = "Status of the purchase")
    val purchaseStatus: String,

    @field:Schema(description = "Payment method of the purchase")
    val paymentMethod: String,

    @field:Schema(description = "Observations of the purchase")
    val observations: String?
) {
    companion object {
        fun fromEntity(purchase: Purchase): PurchaseResponse {
            return PurchaseResponse(
                id = purchase.id,
                buyerId = purchase.buyerId,
                carId = purchase.car.id,
                dealershipId = purchase.dealership.id,
                purchaseDate = purchase.purchaseDate,
                finalPrice = purchase.finalPrice,
                purchaseStatus = purchase.purchaseStatus.toString(),
                paymentMethod = purchase.paymentMethod.toString(),
                observations = purchase.observations,
            )
        }
    }
}