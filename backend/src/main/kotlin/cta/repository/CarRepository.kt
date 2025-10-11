package cta.repository

import cta.model.Car
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface CarRepository : JpaRepository<Car, Long> {
    fun findByAvailableTrue(): List<Car>

    fun findByDealershipId(dealershipId: Long): List<Car>

    fun findByDealershipIdAndAvailableTrue(dealershipId: Long): List<Car>
//    fun findByFuelTypeAndAvailableTrue(fuelType: FuelType): List<Car>
//    fun findByTransmissionAndAvailableTrue(transmission: TransmissionType): List<Car>
//    fun findByBrandContainingIgnoreCaseAndAvailableTrue(brand: String): List<Car>

    @Query("SELECT c FROM Car c WHERE c.available = true ORDER BY c.publicationDate DESC")
    fun findAvailableOrderedByDate(): List<Car>
}
