package cta.repository

import cta.model.CarOffer
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface CarOfferRepository : JpaRepository<CarOffer, Long> {
    fun findAllByDealershipId(dealershipId: Long): List<CarOffer>

    fun findByDealershipIdAndAvailableTrue(dealershipId: Long): List<CarOffer>

    fun findByCarIdAndDealershipId(
        carId: Long,
        dealershipId: Long,
    ): CarOffer?

    fun findByDealershipId(dealershipId: Long): List<CarOffer>

    fun findByAvailableTrue(): List<CarOffer>

    @Query("SELECT COUNT(c) FROM CarOffer c WHERE c.dealership.id = :dealershipId")
    fun countByDealershipId(
        @Param("dealershipId") dealershipId: Long,
    ): Int
}
