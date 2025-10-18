package cta.repository

import cta.model.FavoriteCar
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface FavoriteCarRepository : JpaRepository<FavoriteCar, Long> {
    fun findByBuyerId(buyerId: Long): List<FavoriteCar>

    fun findByCarId(carId: Long): List<FavoriteCar>

    fun findByBuyerIdAndCarId(buyerId: Long, carId: Long): FavoriteCar?
}