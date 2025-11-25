package cta.repository

import cta.model.Purchase
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface PurchaseRepository : JpaRepository<Purchase, Long> {
    fun findByBuyerId(buyerId: Long): List<Purchase>

    fun findByCarOfferCarId(carId: Long): List<Purchase>

    fun findByCarOfferDealershipId(dealershipId: Long): List<Purchase>

    @Query("SELECT COUNT(p) FROM Purchase p WHERE p.buyer.id = :buyerId")
    fun countByBuyerId(
        @Param("buyerId") buyerId: Long,
    ): Int

    @Query("SELECT COUNT(p) FROM Purchase p WHERE p.carOffer.dealership.id = :dealershipId")
    fun countByCarOfferDealershipId(
        @Param("dealershipId") dealershipId: Long,
    ): Int
}
