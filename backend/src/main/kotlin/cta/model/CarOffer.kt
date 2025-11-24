package cta.model

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import jakarta.validation.constraints.DecimalMin
import java.math.BigDecimal
import java.time.LocalDateTime

@Entity
@Table(name = "car_offer")
class CarOffer : BaseEntity() {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dealership_id", nullable = false)
    lateinit var dealership: Dealership

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_id", nullable = false)
    lateinit var car: Car

    @DecimalMin("0.0")
    @Column(nullable = false, precision = 15, scale = 2)
    var price: BigDecimal = BigDecimal.ZERO

    @Column(name = "offer_date", nullable = false)
    var offerDate: LocalDateTime = LocalDateTime.now()

    @Column(name = "dealership_notes", length = 500, columnDefinition = "TEXT")
    var dealershipNotes: String? = null

    @Column(nullable = false)
    var available: Boolean = true

    fun updatePrice(newPrice: BigDecimal) {
        this.price = newPrice
    }

    fun markAsSold() {
        this.available = false
    }

    fun markAsAvailable() {
        this.available = true
    }
}
