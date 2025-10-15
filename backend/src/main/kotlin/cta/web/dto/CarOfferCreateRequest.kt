package cta.web.dto

import io.swagger.v3.oas.annotations.media.ArraySchema
import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.DecimalMin
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Positive
import java.math.BigDecimal

@Schema(description = "Car offer creation data transfer object")
data class CarOfferCreateRequest(
    @field:Schema(description = "Car that is offered in the dealership", example = "Toyota")
    @field:Positive(message = "Car ID must be positive")
    val carId: Long,
    @field:Schema(description = "Dealership that sells the car")
    @field:Positive(message = "Dealership ID must be positive")
    val dealershipId: Long,
    @field:Schema(description = "Car price", example = "1760.50")
    @field:NotNull(message = "Price is required")
    @field:DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than zero")
    var price: BigDecimal,
    @field:Schema(description = "Dealership notes over the car", example = "Good conditions, brand new")
    val dealershipNotes: String? = null,
    @field:ArraySchema(
        schema = Schema(description = "Link to an image of the car"),
        arraySchema = Schema(description = "List of links of images of the car"),
    )
    val images: MutableList<String> = mutableListOf(),
)
