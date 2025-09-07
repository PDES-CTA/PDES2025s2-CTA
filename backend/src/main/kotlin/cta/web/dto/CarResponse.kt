package cta.web.dto

import cta.enum.FuelType
import cta.enum.TransmissionType
import cta.model.Car
import java.math.BigDecimal
import java.time.LocalDateTime

data class CarResponse(
    val id: Long?,
    val brand: String,
    val model: String,
    val year: Int,
    val price: BigDecimal,
    val mileage: Int,
    val color: String,
    val fuelType: FuelType,
    val transmission: TransmissionType,
    val description: String?,
    val publicationDate: LocalDateTime,
    val available: Boolean,
    val dealershipId: Long,
    val images: List<String>
) {
    companion object {
        fun fromEntity(car: Car): CarResponse {
            return CarResponse(
                id = car.id,
                brand = car.brand,
                model = car.model,
                year = car.year,
                price = car.price,
                mileage = car.mileage,
                color = car.color,
                fuelType = car.fuelType,
                transmission = car.transmission,
                description = car.description,
                publicationDate = car.publicationDate,
                available = car.available,
                dealershipId = car.dealershipId,
                images = car.images.toList()
            )
        }
    }
}