package cta.repository

import cta.model.Purchase
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface PurchaseRepository : JpaRepository<Purchase, Long> {
    fun findByBuyerId(buyerId: Long): List<Purchase>

    fun findByCarOfferCarId(carId: Long): List<Purchase>

    fun findByCarOfferDealershipId(dealershipId: Long): List<Purchase>
}
