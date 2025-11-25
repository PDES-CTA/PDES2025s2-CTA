package cta.web.dto

import java.time.LocalDateTime

data class AdminFavoriteCarResponse(
    val id: Long,
    val buyerEmail: String,
    val carId: Long,
    val carName: String,
    val rating: Int?,
    val comment: String?,
    val dateAdded: LocalDateTime,
    val isReviewed: Boolean,
    val priceNotifications: Boolean,
)
