package cta.model

import cta.enum.FuelType
import cta.enum.TransmissionType
import jakarta.persistence.CollectionTable
import jakarta.persistence.Column
import jakarta.persistence.ElementCollection
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.JoinColumn
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

    @NotNull
    @Positive
    @Column(nullable = false)
    var year: Int = 0

    @NotBlank
    @Column(nullable = false)
    var color: String = ""

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var fuelType: FuelType = FuelType.GASOLINE

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var transmission: TransmissionType = TransmissionType.MANUAL

    @Column(columnDefinition = "TEXT")
    var description: String? = null

    @Column(name = "publication_date", nullable = false)
    var publicationDate: LocalDateTime = LocalDateTime.now()

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "car_image", joinColumns = [JoinColumn(name = "car_id")])
    @Column(name = "image_url")
    var images: MutableList<String> = mutableListOf()

    fun getFullName(): String = "$brand $model $year"
}
