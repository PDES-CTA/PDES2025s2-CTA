package cta.web.dto

import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotNull
import org.hibernate.validator.constraints.Length
import org.springframework.format.annotation.DateTimeFormat
import java.time.LocalDateTime

data class FavoriteCarCreateRequest(
    @field:NotNull(message = "The buyer ID is mandatory")
    val buyerId: Long,

    @field:NotNull(message = "The car ID is mandatory")
    val carId: Long,

    @field:NotNull(message = "Date of car added as favorite is required")
    @field:DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    var dateAdded: LocalDateTime,

    @field:Min(value = 0, message = "Rating should be greater or equal than 0")
    @field:Max(value = 10, message = "Rating should be less or equal than 10")
    var rating: Int,

    @field:Length(min = 0, max = 1000, message = "Length must be between 0 and 1000")
    var comment: String,

    var priceNotifications: Boolean = false
)