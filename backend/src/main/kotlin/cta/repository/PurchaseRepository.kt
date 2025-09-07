package cta.repository

import cta.model.Purchase
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface PurchaseRepository : JpaRepository<Purchase, Long> {

    fun findByBuyerId(buyerId: Long): List<Purchase>
    fun findByCarId(carId: Long): Purchase
    fun findByDealershipId(dealershipId: Long): List<Purchase>

    @Query(value = """
        SELECT c.brand,
           c.model,
           c.year,
           COUNT(*) AS sales_count
        FROM purchase p 
        JOIN car c ON p.car_id = c.id
        WHERE p.purchase_status IN ('CONFIRMED', 'DELIVERED')
        GROUP BY c.brand, c.model, c.year
        ORDER BY sales_count DESC
        LIMIT :limit
    """, nativeQuery = true)
    fun findMostSoldCars(@Param("limit") limit: Int = 10): List<Array<Any>>
}
