package cta.web.dto

import cta.enum.FuelType
import cta.enum.TransmissionType
import cta.model.Car
import io.swagger.v3.oas.annotations.media.ArraySchema
import io.swagger.v3.oas.annotations.media.Schema
import java.math.BigDecimal
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

    @field:Schema(description = "Price of the car")
    val price: BigDecimal,

    @field:Schema(description = "Car mileage")
    val mileage: Int,

    @field:Schema(description = "Car color")
    val color: String,

    @field:Schema(description = "Car fuel type")
    val fuelType: FuelType,

    @field:Schema(description = "Car transmission type")
    val transmission: TransmissionType,

    @field:Schema(description = "Description of the car")
    val description: String?,

    @field:Schema(description = "Date of publication of the car in the app")
    val publicationDate: LocalDateTime,

    @field:Schema(description = "Boolean that indicates is the car is still available")
    val available: Boolean,

    @field:Schema(description = "Dealership offering the car")
    val dealershipId: Long,

    @field:ArraySchema(
        schema = Schema(description = "Link to an image of the car"),
        arraySchema = Schema(description = "List of links of images of the car")
    )
    val images: List<String>
) {
    companion object {
        fun fromEntity(car: Car): CarResponse {
            return CarResponse(
                id = car.id,
                brand = car.brand,
                model = car.model,
                year = car.year,
                price = car.price,
                mileage = car.mileage,
                color = car.color,
                fuelType = car.fuelType,
                transmission = car.transmission,
                description = car.description,
                publicationDate = car.publicationDate,
                available = car.available,
                dealershipId = car.dealershipId,
                images = car.images.toList()
            )
        }
    }
}