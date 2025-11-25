package cta.repository

import cta.model.FavoriteCar
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface FavoriteCarRepository : JpaRepository<FavoriteCar, Long> {
    fun findByBuyerId(buyerId: Long): List<FavoriteCar>

    fun findByCarId(carId: Long): List<FavoriteCar>

    fun findByBuyerIdAndCarId(
        buyerId: Long,
        carId: Long,
    ): FavoriteCar?

    @Query("SELECT COUNT(f) FROM FavoriteCar f WHERE f.buyer.id = :buyerId")
    fun countByBuyerId(
        @Param("buyerId") buyerId: Long,
    ): Int

    @Query("SELECT f FROM FavoriteCar f WHERE f.car.id = :carId AND (f.rating IS NOT NULL OR f.comment IS NOT NULL)")
    fun findByCarIdAndReviewExists(
        @Param("carId") carId: Long,
    ): List<FavoriteCar>

    @Query("SELECT f FROM FavoriteCar f WHERE f.buyer.id = :buyerId AND (f.rating IS NOT NULL OR f.comment IS NOT NULL)")
    fun findByBuyerIdAndReviewExists(
        @Param("buyerId") buyerId: Long,
    ): List<FavoriteCar>

    fun countByCarId(carId: Long): Long
}
