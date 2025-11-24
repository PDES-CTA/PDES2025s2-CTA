package cta.web.dto

import cta.enum.FuelType
import cta.enum.TransmissionType
import cta.model.Car
import io.swagger.v3.oas.annotations.media.ArraySchema
import io.swagger.v3.oas.annotations.media.Schema
import java.time.LocalDateTime

@Schema(description = "Car information response object containing all car details")
data class CarResponse(
    @field:Schema(description = "Unique identifier for the car")
    val id: Long?,
    @field:Schema(description = "Car brand")
    val brand: String,
    @field:Schema(description = "Car model")
    val model: String,
    @field:Schema(description = "Car year")
    val year: Int,
    @field:Schema(description = "Car color")
    val color: String,
    @field:Schema(description = "Car fuel type")
    val fuelType: FuelType,
    @field:Schema(description = "Car transmission type")
    val transmission: TransmissionType,
    @field:Schema(description = "Date of publication of the car in the app")
    val publicationDate: LocalDateTime,
    @field:Schema(description = "Description of the car")
    val description: String?,
    @field:ArraySchema(
        schema = Schema(description = "Link to an image of the car"),
        arraySchema = Schema(description = "List of links of images of the car"),
    )
    val images: List<String>,
) {
    companion object {
        fun fromEntity(car: Car): CarResponse {
            return CarResponse(
                id = car.id,
                brand = car.brand,
                model = car.model,
                year = car.year,
                color = car.color,
                fuelType = car.fuelType,
                transmission = car.transmission,
                publicationDate = car.publicationDate,
                description = car.description,
                images = car.images.toList(),
            )
        }
    }
}
