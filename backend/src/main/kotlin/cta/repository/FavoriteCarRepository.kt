package cta.repository


import cta.model.Buyer
import cta.model.FavoriteCar
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface FavoriteCarRepository : JpaRepository<FavoriteCar, Long> {
     fun findFavoriteCarByBuyer(buyer: Buyer): List<FavoriteCar>
}