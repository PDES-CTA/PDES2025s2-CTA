package cta.web.dto

import cta.enum.PaymentMethod
import cta.enum.PurchaseStatus
import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.DecimalMax
import jakarta.validation.constraints.DecimalMin
import jakarta.validation.constraints.NotNull
import org.hibernate.validator.constraints.Length
import org.springframework.format.annotation.DateTimeFormat
import java.math.BigDecimal
import java.time.LocalDateTime

@Schema(description = "Purchase creation data transfer object")
data class PurchaseCreateRequest(
    @field:NotNull(message = "buyer ID is required")
    @field:Schema(description = "Buyer ID of the buyer involved in the purchase", example = "1234")
    val buyerId: Long,
    @field:NotNull(message = "Car ID is required")
    @field:Schema(description = "Car ID of the car bought", example = "9876")
    val carId: Long,
    @field:NotNull(message = "Dealership ID is required")
    @field:Schema(description = "Dealership ID that sold the car", example = "1112")
    val dealershipId: Long,
    @field:NotNull(message = "Price is required")
    @field:DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than zero")
    @field:DecimalMax(value = "99999999999999.99", inclusive = false, message = "Price exceeds maximum acceptable price")
    @field:Schema(description = "Price of the car that was sold", example = "1499.99")
    val finalPrice: BigDecimal,
    @field:NotNull(message = "Purchase date is required")
    @field:DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @field:Schema(description = "Purchase creation date", example = "2025-01-01T00:00:00")
    val purchaseDate: LocalDateTime,
    @field:NotNull(message = "Purchase status is required")
    @field:Schema(description = "Status of the purchase")
    val purchaseStatus: PurchaseStatus,
    @field:NotNull(message = "Payment method is required")
    @field:Schema(description = "Payment method of the purchase")
    val paymentMethod: PaymentMethod,
    @field:Length(min = 0, max = 1000, message = "Length must be between 0 and 1000")
    @field:Schema(description = "Observations of the purchase")
    val observations: String,
)
