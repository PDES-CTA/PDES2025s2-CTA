package cta.web.dto

import cta.enum.PaymentMethod
import cta.enum.PurchaseStatus
import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.DecimalMin
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import java.math.BigDecimal
import java.time.LocalDateTime

@Schema(description = "Purchase creation data transfer object")
data class PurchaseCreateRequest(
    @field:Schema(description = "Buyer ID of the buyer involved in the purchase", example = "1")
    @field:NotNull
    val buyerId: Long,
    @field:Schema(description = "Car Offer ID of the offer being purchased", example = "1")
    @field:NotNull
    val carOfferId: Long,
    @field:Schema(description = "Price of the car that was sold", example = "25000.50")
    @field:NotNull
    @field:DecimalMin("0.0", inclusive = false)
    val finalPrice: BigDecimal,
    @field:Schema(description = "Purchase creation date")
    @field:NotNull
    val purchaseDate: LocalDateTime = LocalDateTime.now(),

    @field:Schema(description = "Status of the purchase")
    @field:NotNull
    val purchaseStatus: PurchaseStatus = PurchaseStatus.PENDING,
    @field:Schema(description = "Payment method of the purchase")
    @field:NotNull
    val paymentMethod: PaymentMethod,
    @field:Schema(description = "Observations of the purchase")
    val observations: String? = null,
)
