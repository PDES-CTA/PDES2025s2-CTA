package cta.web.dto

import cta.enum.FuelType
import cta.enum.TransmissionType
import io.swagger.v3.oas.annotations.media.ArraySchema
import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.Min

@Schema(description = "Car update data transfer object")
data class CarUpdateRequest(
    @field:Schema(description = "New brand of the car")
    val brand: String? = null,
    @field:Schema(description = "New model of the car")
    val model: String? = null,
    @field:Min(value = 1900, message = "Year must be greater than 1900")
    @field:Schema(description = "New year of the car")
    val year: Int? = null,
    @field:Schema(description = "New color of the car")
    val color: String? = null,
    @field:Schema(description = "New fuel type of the car")
    val fuelType: FuelType? = null,
    @field:Schema(description = "New transmission type of the car")
    val transmission: TransmissionType? = null,
    @field:Schema(description = "New description of the car")
    val description: String? = null,
    @field:ArraySchema(
        schema = Schema(description = "New link to an image of the car"),
        arraySchema = Schema(description = "Updated list of links of images of the car"),
    )
    val images: List<String>? = null,
) {
    fun toMap(): Map<String, Any> {
        return listOf(
            "brand" to brand,
            "model" to model,
            "year" to year,
            "color" to color,
            "fuelType" to fuelType,
            "transmission" to transmission,
            "description" to description,
            "images" to images,
        ).mapNotNull { (key, value) ->
            value?.let { key to it }
        }.toMap()
    }
}
