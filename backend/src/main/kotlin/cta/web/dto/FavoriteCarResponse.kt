package cta.web.dto

import cta.model.FavoriteCar
import java.time.LocalDateTime

data class FavoriteCarResponse(
    val id: Long?,
    val carId: Long?,
    val buyerId: Long?,
    val dateAdded: LocalDateTime,
    val rating: Int?,
    val comment: String?,
    val priceNotifications: Boolean
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
                priceNotifications =  favorite.priceNotifications
            )
        }
    }
}