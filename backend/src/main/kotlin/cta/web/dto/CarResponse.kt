package cta.web.dto

import cta.enum.FuelType
import cta.enum.TransmissionType
import cta.model.Car
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
    @field:Schema(description = "Car mileage")
    val mileage: Int,
    @field:Schema(description = "Car plate")
    val plate: String,
    @field:Schema(description = "Car color")
    val color: String,
    @field:Schema(description = "Car fuel type")
    val fuelType: FuelType,
    @field:Schema(description = "Car transmission type")
    val transmission: TransmissionType,
    @field:Schema(description = "Date of publication of the car in the app")
    val publicationDate: LocalDateTime,
    @field:Schema(description = "Boolean that indicates is the car is still available")
    val available: Boolean,
) {
    companion object {
        fun fromEntity(car: Car): CarResponse {
            return CarResponse(
                id = car.id,
                brand = car.brand,
                model = car.model,
                year = car.year,
                mileage = car.mileage,
                color = car.color,
                fuelType = car.fuelType,
                transmission = car.transmission,
                publicationDate = car.publicationDate,
                plate = car.plate,
                available = car.available,
            )
        }
    }
}
