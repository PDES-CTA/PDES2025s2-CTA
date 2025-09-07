package cta.web.dto

import cta.enum.FuelType
import cta.enum.TransmissionType
import jakarta.validation.constraints.*
import java.math.BigDecimal

data class CarUpdateRequest(
    val brand: String? = null,
    val model: String? = null,

    @field:Positive(message = "Year must be positive")
    @field:Min(value = 1900, message = "Year must be greater than 1900")
    val year: Int? = null,

    @field:DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than zero")
    val price: BigDecimal? = null,

    @field:PositiveOrZero(message = "Mileage cannot be negative")
    val mileage: Int? = null,

    val color: String? = null,
    val fuelType: FuelType? = null,
    val transmission: TransmissionType? = null,
    val description: String? = null,
    val available: Boolean? = null,
    val images: List<String>? = null
) {
    fun toMap(): Map<String, Any> {
        return listOf(
            "brand" to brand,
            "model" to model,
            "year" to year,
            "price" to price,
            "mileage" to mileage,
            "color" to color,
            "fuelType" to fuelType,
            "transmission" to transmission,
            "description" to description,
            "available" to available,
            "images" to images
        ).mapNotNull { (key, value) ->
            value?.let { key to it }
        }.toMap()
    }
}