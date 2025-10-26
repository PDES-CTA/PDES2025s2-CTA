package cta.model

import cta.enum.PaymentMethod
import cta.enum.PurchaseStatus
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.JoinColumn
import jakarta.persistence.OneToOne
import jakarta.persistence.Table
import jakarta.validation.constraints.DecimalMin
import java.math.BigDecimal
import java.time.LocalDateTime

@Entity
@Table(name = "purchase")
class Purchase : BaseEntity() {
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = false, unique = true)
    lateinit var buyer: Buyer

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_offer_id", nullable = false, unique = true)
    lateinit var carOffer: CarOffer

    @DecimalMin("0.0")
    @Column(name = "final_price", nullable = false, precision = 15, scale = 2)
    var finalPrice: BigDecimal = BigDecimal.ZERO

    @Column(name = "purchase_date", nullable = false)
    var purchaseDate: LocalDateTime = LocalDateTime.now()

    @Enumerated(EnumType.STRING)
    @Column(name = "purchase_status", nullable = false)
    var purchaseStatus = PurchaseStatus.PENDING

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    var paymentMethod = PaymentMethod.CASH

    @Column(columnDefinition = "TEXT")
    var observations: String? = null

    fun confirmPurchase() {
        this.purchaseStatus = PurchaseStatus.CONFIRMED
        this.carOffer.markAsSold()
    }

    fun cancelPurchase() {
        this.purchaseStatus = PurchaseStatus.CANCELLED
        this.carOffer.markAsAvailable()
    }

    fun deliverPurchase() {
        this.purchaseStatus = PurchaseStatus.DELIVERED
    }

    fun pendingPurchase() {
        this.purchaseStatus = PurchaseStatus.PENDING
    }

    fun obtainDetails(): Map<String, Any?> {
        return mapOf(
            "Purchase ID" to this.id,
            "Car" to this.carOffer.car.getFullName(),
            "Buyer" to this.buyer.firstName + " " + this.buyer.lastName,
            "Dealership" to this.carOffer.dealership.getDisplayName(),
            "Final price" to this.finalPrice,
            "Purchase date" to this.purchaseDate,
            "Status" to this.purchaseStatus,
            "Payment method" to this.paymentMethod,
            "Observations" to this.observations,
        )
    }
}
