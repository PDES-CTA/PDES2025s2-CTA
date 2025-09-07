package cta.web.dto

import cta.enum.PurchaseStatus
import jakarta.validation.constraints.DecimalMax
import jakarta.validation.constraints.DecimalMin
import org.springframework.format.annotation.DateTimeFormat
import java.math.BigDecimal
import java.time.LocalDateTime

data class PurchaseUpdateRequest(
    @field:DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than zero")
    @field:DecimalMax(value = "99999999999999.99", inclusive = false, message = "Price exceeds maximum acceptable price")
    val finalPrice: BigDecimal? = null,

    @field:DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    val purchaseDate: LocalDateTime? = null,

    val purchaseStatus: PurchaseStatus? = null,
    val paymentMethod: String? = null,
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