package cta.web.dto
import cta.model.Car
import cta.enum.FuelType
import cta.enum.TransmissionType
import jakarta.validation.constraints.*
import java.math.BigDecimal
import java.time.LocalDateTime

data class CarCreateRequest(
    @field:NotBlank(message = "Brand is required")
    val brand: String,

    @field:NotBlank(message = "Model is required")
    val model: String,

    @field:Positive(message = "Year must be positive")
    @field:Min(value = 1900, message = "Year must be greater than 1900")
    val year: Int,

    @field:NotNull(message = "Price is required")
    @field:DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than zero")
    var price: BigDecimal,

    @field:PositiveOrZero(message = "Mileage cannot be negative")
    val mileage: Int = 0,

    @field:NotBlank(message = "Color is required")
    val color: String,

    @field:NotNull(message = "Fuel type is required")
    var fuelType: FuelType,

    @field:NotNull(message = "Transmission type is required")
    var transmission: TransmissionType,

    val description: String? = null,

    @field:Positive(message = "Dealership ID must be positive")
    val dealershipId: Long,

    val images: List<String> = emptyList()
) {
    fun toEntity(): Car {
        return Car().apply {
            brand = this@CarCreateRequest.brand
            model = this@CarCreateRequest.model
            year = this@CarCreateRequest.year
            price = this@CarCreateRequest.price
            mileage = this@CarCreateRequest.mileage
            color = this@CarCreateRequest.color
            fuelType = this@CarCreateRequest.fuelType
            transmission = this@CarCreateRequest.transmission
            description = this@CarCreateRequest.description
            dealershipId = this@CarCreateRequest.dealershipId
            images = this@CarCreateRequest.images.toMutableList()
            publicationDate = LocalDateTime.now()
            available = true
        }
    }
}
