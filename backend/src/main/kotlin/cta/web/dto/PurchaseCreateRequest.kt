package cta.web.dto

import cta.enum.PaymentMethod
import cta.enum.PurchaseStatus
import jakarta.validation.constraints.DecimalMax
import jakarta.validation.constraints.DecimalMin
import jakarta.validation.constraints.NotNull
import org.hibernate.validator.constraints.Length
import org.springframework.format.annotation.DateTimeFormat
import java.math.BigDecimal
import java.time.LocalDateTime

data class PurchaseCreateRequest(
    @field:NotNull(message = "buyer ID is required")
    val buyerId: Long,

    @field:NotNull(message = "Car ID is required")
    val carId: Long,

    @field:NotNull(message = "Dealership ID is required")
    val dealershipId: Long,

    @field:NotNull(message = "Price is required")
    @field:DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than zero")
    @field:DecimalMax(value = "99999999999999.99", inclusive = false, message = "Price exceeds maximum acceptable price")
    val finalPrice: BigDecimal,

    @field:NotNull(message = "Purchase date is required")
    @field:DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    val purchaseDate: LocalDateTime,

    @field:NotNull(message = "Purchase status is required")
    val purchaseStatus: PurchaseStatus,

    @field:NotNull(message = "Payment method is required")
    val paymentMethod: PaymentMethod,

    @field:Length(min = 0, max = 1000, message = "Length must be between 0 and 1000")
    val observations: String
)

