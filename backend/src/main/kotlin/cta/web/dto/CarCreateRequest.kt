package cta.web.dto
import cta.model.Car
import cta.enum.FuelType
import cta.enum.TransmissionType
import io.swagger.v3.oas.annotations.media.ArraySchema
import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.*
import java.math.BigDecimal
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

    @field:Schema(description = "Car price", example = "1760.50")
    @field:NotNull(message = "Price is required")
    @field:DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than zero")
    var price: BigDecimal,

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

    @field:Schema(description = "Car description", example = "Good conditions")
    val description: String? = null,

    @field:Schema(description = "Dealership that sells the car")
    @field:Positive(message = "Dealership ID must be positive")
    val dealershipId: Long,

    @field:ArraySchema(
        schema = Schema(description = "Link to an image of the car"),
        arraySchema = Schema(description = "List of links of images of the car")
    )
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
