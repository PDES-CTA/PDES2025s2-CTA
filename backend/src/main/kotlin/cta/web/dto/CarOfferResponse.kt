package cta.web.dto

import cta.model.CarOffer
import io.swagger.v3.oas.annotations.media.Schema
import java.math.BigDecimal
import java.time.LocalDateTime

@Schema(description = "Car offer response object containing all the offering details")
class CarOfferResponse(
    @field:Schema(description = "Unique identifier for the car offer")
    val id: Long?,
    @field:Schema(description = "Unique identifier for the dealership offering the car")
    val dealershipId: Long?,
    @field:Schema(description = "Unique identifier for the car offered")
    val carId: Long?,
    @field:Schema(description = "Car price in the offer")
    val price: BigDecimal,
    @field:Schema(description = "Date in which the car was published by the dealership")
    val offerDate: LocalDateTime,
    @field:Schema(description = "Dealership notes over the car offered")
    val dealershipNotes: String?,
    @field:Schema(description = "Indicates if the offer is still available")
    val available: Boolean,
) {
    companion object {
        fun fromEntity(carOffer: CarOffer): CarOfferResponse {
            return CarOfferResponse(
                id = carOffer.id,
                dealershipId = carOffer.dealership.id,
                carId = carOffer.car.id,
                price = carOffer.price,
                offerDate = carOffer.offerDate,
                dealershipNotes = carOffer.dealershipNotes,
                available = carOffer.available,
            )
        }
    }
}
