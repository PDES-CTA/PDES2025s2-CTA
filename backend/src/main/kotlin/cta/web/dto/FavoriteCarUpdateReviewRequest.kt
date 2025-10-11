package cta.web.dto

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import org.hibernate.validator.constraints.Length

@Schema(description = "Favorite car update data transfer object")
data class FavoriteCarUpdateReviewRequest(
    @field:Min(value = 0, message = "Rating has to be greater or equal than zero")
    @field:Max(value = 10, message = "Rating has to be less or equal than ten")
    @field:Schema(description = "New rating of the car provided by the buyer")
    val rating: Int? = null,

    @field:Length(min = 0, max = 1000, message = "Length must be between 0 and 1000")
    @field:Schema(description = "New comment of the car provided by the buyer")
    val comment: String? = null,
) {
        fun toMap(): Map<String, Any> {
            return listOf(
                "rating" to rating,
                "comment" to comment
            ).mapNotNull { (key, value) ->
                value?.let { key to it }
            }.toMap()
        }
}