package cta.web.dto

import cta.model.FavoriteCar
import io.swagger.v3.oas.annotations.media.Schema
import java.time.LocalDateTime

@Schema(description = "Favorite car information response object containing all favorite details")
data class FavoriteCarResponse(
    @field:Schema(description = "Unique identifier for the favorite car")
    val id: Long?,
    @field:Schema(description = "Car ID that was selected as favorite")
    val carId: Long?,
    @field:Schema(description = "Buyer ID that selected the favorite car")
    val buyerId: Long?,
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
                carId = favorite.car.id,
                buyerId = favorite.buyer.id,
                dateAdded = favorite.dateAdded,
                rating = favorite.rating,
                comment = favorite.comment,
                priceNotifications = favorite.priceNotifications,
            )
        }
    }
}
