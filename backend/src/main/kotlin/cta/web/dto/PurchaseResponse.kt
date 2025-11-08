package cta.web.dto

import cta.model.Purchase
import io.swagger.v3.oas.annotations.media.Schema
import java.math.BigDecimal
import java.time.LocalDateTime

@Schema(description = "Purchase information response object containing all purchase details")
data class PurchaseResponse(
    @field:Schema(description = "Unique identifier for the purchase")
    val id: Long?,
    @field:Schema(description = "Buyer involved in the purchase")
    val buyer: BuyerResponse,
    @field:Schema(description = "Car Offer that was bought")
    val carOffer: CarOfferResponse,
    @field:Schema(description = "Purchase date creation")
    val purchaseDate: LocalDateTime,
    @field:Schema(description = "Price of the car that was sold")
    val finalPrice: BigDecimal,
    @field:Schema(description = "Status of the purchase")
    val purchaseStatus: String,
    @field:Schema(description = "Payment method of the purchase")
    val paymentMethod: String,
    @field:Schema(description = "Observations of the purchase")
    val observations: String?,
) {
    companion object {
        fun fromEntity(purchase: Purchase): PurchaseResponse {
            return PurchaseResponse(
                id = purchase.id,
                buyer = BuyerResponse.fromEntity(purchase.buyer),
                carOffer = CarOfferResponse.fromEntity(purchase.carOffer),
                purchaseDate = purchase.purchaseDate,
                finalPrice = purchase.finalPrice,
                purchaseStatus = purchase.purchaseStatus.toString(),
                paymentMethod = purchase.paymentMethod.toString(),
                observations = purchase.observations,
            )
        }
    }
}
