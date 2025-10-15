package cta.web.dto

import cta.enum.FuelType
import cta.enum.TransmissionType
import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.Positive
import jakarta.validation.constraints.PositiveOrZero

@Schema(description = "Car update data transfer object")
data class CarUpdateRequest(
    @field:Schema(description = "New brand of the car")
    val brand: String? = null,
    @field:Schema(description = "New model of the carr")
    val model: String? = null,
    @field:Positive(message = "Year must be positive")
    @field:Min(value = 1900, message = "Year must be greater than 1900")
    @field:Schema(description = "New year of the car")
    val year: Int? = null,
    @field:PositiveOrZero(message = "Mileage cannot be negative")
    @field:Schema(description = "New mileage of the car")
    val mileage: Int? = null,
    @field:Schema(description = "New color of the car")
    val color: String? = null,
    @field:Schema(description = "New fuel type of the car")
    val fuelType: FuelType? = null,
    @field:Schema(description = "New transmission type of the car")
    val transmission: TransmissionType? = null,
    @field:Schema(description = "New available status of the car")
    val available: Boolean? = null,
) {
    fun toMap(): Map<String, Any> {
        return listOf(
            "brand" to brand,
            "model" to model,
            "year" to year,
            "mileage" to mileage,
            "color" to color,
            "fuelType" to fuelType,
            "transmission" to transmission,
            "available" to available,
        ).mapNotNull { (key, value) ->
            value?.let { key to it }
        }.toMap()
    }
}
