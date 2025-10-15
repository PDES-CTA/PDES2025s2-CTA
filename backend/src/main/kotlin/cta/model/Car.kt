package cta.model

import cta.enum.FuelType
import cta.enum.TransmissionType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Table
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Positive
import java.time.LocalDateTime

@Entity
@Table(name = "car")
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
    @Column(nullable = false)
    var plate: String = ""

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

    @Column(name = "publication_date", nullable = false)
    var publicationDate: LocalDateTime = LocalDateTime.now()

    @Column(nullable = false)
    var available: Boolean = true

    fun getFullName(): String = "$brand $model $year"

    fun markAsSold() {
        this.available = false
    }

    fun markAsAvailable() {
        this.available = true
    }

    fun isAvailable(): Boolean = available
}
