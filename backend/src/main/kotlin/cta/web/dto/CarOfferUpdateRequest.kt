package cta.web.dto

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.DecimalMin
import java.math.BigDecimal

class CarOfferUpdateRequest(
    @field:Schema(description = "Car price", example = "1760.50")
    @field:DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than zero")
    var price: BigDecimal? = null,
    @field:Schema(description = "Dealership notes over the car", example = "Good conditions, brand new")
    val dealershipNotes: String? = null,
) {
    fun toMap(): Map<String, Any> {
        return listOf(
            "price" to price,
            "dealershipNotes" to dealershipNotes,
        ).mapNotNull { (key, value) ->
            value?.let { key to it }
        }.toMap()
    }
}
