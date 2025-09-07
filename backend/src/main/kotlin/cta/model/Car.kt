package cta.model

import cta.enum.*
import jakarta.persistence.*
import jakarta.validation.constraints.DecimalMin
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Positive
import java.math.BigDecimal
import java.time.LocalDateTime

@Entity
@Table(name = "cars")
class Car : BaseEntity() {

    @NotBlank
    @Column(nullable = false)
    var brand: String = ""

    @NotBlank
    @Column(nullable = false)
    var model: String = ""

    @Positive
    @Column(nullable = false)
    var year: Int = 0

    @NotNull
    @DecimalMin("0.0")
    @Column(nullable = false, precision = 15, scale = 2)
    var price: BigDecimal = BigDecimal.ZERO

    @Column(nullable = false)
    var mileage: Int = 0

    @Column(nullable = false)
    var color: String = ""

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var fuelType: FuelType = FuelType.GASOLINE

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var transmission: TransmissionType = TransmissionType.MANUAL

    @Column(columnDefinition = "TEXT")
    var description: String? = null

    @Column(name = "publication_date", nullable = false)
    var publicationDate: LocalDateTime = LocalDateTime.now()

    @Column(nullable = false)
    var available: Boolean = true

    @Column(name = "dealership_id", nullable = false)
    var dealershipId: Long = 0 // TODO: Once we have the dealership entity we need to set the proper entity instead of the id

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "car_images", joinColumns = [JoinColumn(name = "car_id")])
    @Column(name = "image_url")
    var images: MutableList<String> = mutableListOf()

    fun updatePrice(newPrice: BigDecimal) {
        this.price = newPrice
    }

    fun markAsSold() {
        this.available = false
    }

    fun isAvailable(): Boolean = available

    fun calculateDiscountedPrice(percentage: Double): BigDecimal {
        val discount = price.multiply(BigDecimal(percentage / 100))
        return price.subtract(discount)
    }

    fun getFullName(): String = "$brand $model $year"
}