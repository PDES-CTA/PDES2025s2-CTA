package cta.web.dto

import cta.model.FavoriteCar
import io.swagger.v3.oas.annotations.media.Schema
import java.time.LocalDateTime

@Schema(description = "Favorite car information response object containing all favorite details")
data class FavoriteCarResponse(
    @field:Schema(description = "Unique identifier for the favorite car")
    val id: Long?,
    @field:Schema(description = "Car that was selected as favorite")
    val car: CarResponse,
    @field:Schema(description = "Buyer that selected the favorite car")
    val buyer: BuyerResponse,
    @field:Schema(description = "Date of favorite car creation")
    val dateAdded: LocalDateTime,
    @field:Schema(description = "Rating of the car provided by the buyer")
    val rating: Int?,
    @field:Schema(description = "Comment of the car provided by the buyer")
    val comment: String?,
    @field:Schema(description = "Price notifications is activated")
    val priceNotifications: Boolean,
) {
    companion object {
        fun fromEntity(favorite: FavoriteCar): FavoriteCarResponse {
            return FavoriteCarResponse(
                id = favorite.id,
                car = CarResponse.fromEntity(favorite.car),
                buyer = BuyerResponse.fromEntity(favorite.buyer),
                dateAdded = favorite.dateAdded,
                rating = favorite.rating,
                comment = favorite.comment,
                priceNotifications = favorite.priceNotifications,
            )
        }
    }
}
