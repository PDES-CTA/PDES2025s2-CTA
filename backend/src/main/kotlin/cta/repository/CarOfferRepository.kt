package cta.repository

import cta.model.CarOffer
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface CarOfferRepository : JpaRepository<CarOffer, Long> {
    fun findAllByDealershipId(dealershipId: Long): List<CarOffer>

    fun findByCarIdAndDealershipId(
        carId: Long,
        dealershipId: Long,
    ): CarOffer?

    @Query(
        """
        SELECT c
        FROM CarOffer c 
        LEFT JOIN c.car car
        WHERE car.available
    """,
    )
    fun findByAvailableCar(): List<CarOffer>
}
