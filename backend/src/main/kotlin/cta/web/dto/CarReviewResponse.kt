package cta.web.dto

import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "Car reviews summary with average rating and individual reviews")
data class CarReviewResponse(
    @field:Schema(description = "Unique identifier of the car")
    val carId: Long,
    @field:Schema(description = "Total number of reviews for this car")
    val totalReviews: Long,
    @field:Schema(description = "Average rating of all reviews")
    val averageRating: Double,
    @field:Schema(description = "List of individual reviews")
    val reviews: List<Map<String, Any?>>,
)
