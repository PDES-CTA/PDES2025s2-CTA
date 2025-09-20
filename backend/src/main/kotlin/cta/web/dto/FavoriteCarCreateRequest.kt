package cta.web.dto

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotNull
import org.hibernate.validator.constraints.Length
import org.springframework.format.annotation.DateTimeFormat
import java.time.LocalDateTime

@Schema(description = "Favorite car creation data transfer object")
data class FavoriteCarCreateRequest(
    @field:NotNull(message = "The buyer ID is mandatory")
    @field:Schema(description = "Buyer ID that selected the favorite car", example = "1234")
    val buyerId: Long,

    @field:NotNull(message = "The car ID is mandatory")
    @field:Schema(description = "Car ID that was selected as favorite", example = "9876")
    val carId: Long,

    @field:NotNull(message = "Date of car added as favorite is required")
    @field:DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @field:Schema(description = "Date of favorite car creation", example = "2025-01-01T00:00:00")
    var dateAdded: LocalDateTime,

    @field:Min(value = 0, message = "Rating should be greater or equal than 0")
    @field:Max(value = 10, message = "Rating should be less or equal than 10")
    @field:Schema(description = "Rating of the car provided by the buyer", example = "5")
    var rating: Int,

    @field:Length(min = 0, max = 1000, message = "Length must be between 0 and 1000")
    @field:Schema(description = "Comment of the car provided by the buyer")
    var comment: String,

    @field:Schema(description = "Price notifications is activated")
    var priceNotifications: Boolean = false
)