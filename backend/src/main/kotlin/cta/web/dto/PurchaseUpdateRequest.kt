package cta.web.dto

import cta.enum.PurchaseStatus
import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.DecimalMax
import jakarta.validation.constraints.DecimalMin
import org.springframework.format.annotation.DateTimeFormat
import java.math.BigDecimal
import java.time.LocalDateTime

@Schema(description = "Favorite car update data transfer object")
data class PurchaseUpdateRequest(
    @field:DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than zero")
    @field:DecimalMax(value = "99999999999999.99", inclusive = false, message = "Price exceeds maximum acceptable price")
    @field:Schema(description = "New price for the car sold")
    val finalPrice: BigDecimal? = null,

    @field:DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @field:Schema(description = "New purchase date")
    val purchaseDate: LocalDateTime? = null,

    @field:Schema(description = "New purchase status")
    val purchaseStatus: PurchaseStatus? = null,

    @field:Schema(description = "New payment method of the purchase")
    val paymentMethod: String? = null,

    @field:Schema(description = "New observations of the purchase")
    val observations: String? = null
) {
    fun toMap(): Map<String, Any> {
        return listOf(
            "finalPrice" to finalPrice,
            "purchaseDate" to purchaseDate,
            "purchaseStatus" to purchaseStatus,
            "paymentMethod" to paymentMethod,
            "observations" to observations
        ).mapNotNull { (key, value) ->
            value?.let { key to it }
        }.toMap()
    }
}