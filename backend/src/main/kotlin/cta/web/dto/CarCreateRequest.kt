package cta.web.dto
import cta.enum.FuelType
import cta.enum.TransmissionType
import cta.model.Car
import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Positive
import jakarta.validation.constraints.PositiveOrZero
import java.time.LocalDateTime

@Schema(description = "Car creation data transfer object")
data class CarCreateRequest(
    @field:Schema(description = "Car brand", example = "Toyota")
    @field:NotBlank(message = "Brand is required")
    val brand: String,
    @field:Schema(description = "Car model", example = "Camry")
    @field:NotBlank(message = "Model is required")
    val model: String,
    @field:Schema(description = "Car year", example = "2015")
    @field:Positive(message = "Year must be positive")
    @field:Min(value = 1900, message = "Year must be greater than 1900")
    val year: Int,
    @field:Schema(description = "Car plate", example = "ABC123")
    @field:NotNull(message = "Car plate is required")
    var plate: String,
    @field:Schema(description = "Car mileage", example = "24600")
    @field:PositiveOrZero(message = "Mileage cannot be negative")
    val mileage: Int = 0,
    @field:Schema(description = "Car color", example = "Blue")
    @field:NotBlank(message = "Color is required")
    val color: String,
    @field:Schema(description = "Car fuel type")
    @field:NotNull(message = "Fuel type is required")
    var fuelType: FuelType,
    @field:Schema(description = "Car transmission type")
    @field:NotNull(message = "Transmission type is required")
    var transmission: TransmissionType,
) {
    fun toEntity(): Car {
        return Car().apply {
            brand = this@CarCreateRequest.brand
            model = this@CarCreateRequest.model
            year = this@CarCreateRequest.year
            plate = this@CarCreateRequest.plate
            mileage = this@CarCreateRequest.mileage
            color = this@CarCreateRequest.color
            fuelType = this@CarCreateRequest.fuelType
            transmission = this@CarCreateRequest.transmission
            publicationDate = LocalDateTime.now()
            available = true
        }
    }
}
