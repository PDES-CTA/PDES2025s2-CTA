package cta.model

import cta.enum.PaymentMethod
import cta.enum.PurchaseStatus
import jakarta.persistence.*
import jakarta.validation.constraints.DecimalMin
import java.math.BigDecimal
import java.time.LocalDateTime


@Entity
@Table(name = "purchase")
class Purchase : BaseEntity() {

    //@ManyToOne(fetch = FetchType.LAZY)
    //@JoinColumn(name = "buyer_id", nullable = false)
    //lateinit var buyer: Buyer
    // TODO: Replace buyer ID with the right mapping of the Buyer entity
    @Column(name = "buyer_id", nullable = false)
    var buyerId: Long = 0

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_id", nullable = false)
    lateinit var car: Car

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dealership_id", nullable = false)
    lateinit var dealership: Dealership

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
        this.car.markAsSold()
    }

    fun cancelPurchase() {
        this.purchaseStatus = PurchaseStatus.CANCELLED
        this.car.available = true
    }

    fun deliverPurchase() {
        this.purchaseStatus = PurchaseStatus.DELIVERED
    }

    fun pendingPurchase() {
        this.purchaseStatus = PurchaseStatus.PENDING
    }

    // TODO: Once we have all the entities update details obtaining buyer's name, for instance
    fun obtainDetails(): Map<String, Any?> {
        return mapOf(
            "Purchase ID" to this.id,
            "Car" to this.car.getFullName(),
            "Dealership" to this.dealership.getDisplayName(),
            "Final price" to this.finalPrice,
            "Purchase date" to this.purchaseDate,
            "Status" to this.purchaseStatus,
            "Payment method" to this.paymentMethod,
            "Observations" to this.observations
        )
    }
}