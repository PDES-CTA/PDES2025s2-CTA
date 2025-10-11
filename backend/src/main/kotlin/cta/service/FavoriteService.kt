package cta.service

import cta.model.FavoriteCar
import cta.repository.FavoriteCarRepository
import cta.web.dto.FavoriteCarCreateRequest
import org.springframework.transaction.annotation.Transactional
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class FavoriteService(
    private val favoriteCarRepository: FavoriteCarRepository,
    private val carService: CarService,
    private val buyerService: BuyerService
) {
    @Transactional
    fun saveFavorite(favoriteCarCreateRequest: FavoriteCarCreateRequest) : FavoriteCar {
        val favoriteCar = validateAndTransformFavoriteRequest(favoriteCarCreateRequest)
        return favoriteCarRepository.save(favoriteCar)
    }

    @Transactional
    fun deleteFavoriteCar(id: Long) {
        val favoriteCar = favoriteCarRepository.findByIdOrNull(id)
            ?: throw Exception("Favorite car with ID $id not found")
        favoriteCarRepository.delete(favoriteCar)
    }

    @Transactional
    fun updateReview(id: Long, updateData: Map<String, Any>) : FavoriteCar {
        val favoriteCar = favoriteCarRepository.findByIdOrNull(id)
            ?: throw Exception("Favorite car with ID $id not found")

        updateData["rating"]?.let { favoriteCar.rating = (it.toString().toInt()) }
        updateData["comment"]?.let { favoriteCar.comment = (it.toString()) }

        validateFavoriteCar(favoriteCar)
        return favoriteCarRepository.save(favoriteCar)
    }

    private fun validateFavoriteCar(favoriteCar: FavoriteCar) {
        favoriteCar.rating?.let { require(it >= 0) { "Rating must be greater or equal 0" } }
        favoriteCar.rating?.let { require(it <= 10) { "Rating must be less or equal 10" } }
        favoriteCar.comment?.let {
            require(it.length <= 1000) { "Observations cannot exceed 1000 characters" }
        }

        require(favoriteCar.dateAdded.isAfter(LocalDateTime.of(2000, 1, 1, 0, 0))) {
            "Car must be added as favorite after January 1, 2000"
        }
    }

    private fun validateAndTransformFavoriteRequest(request: FavoriteCarCreateRequest) : FavoriteCar {
        val car = carService.findById(request.carId)
        val buyer = buyerService.findById(request.buyerId)
        val existingFavorites = favoriteCarRepository.findFavoriteCarByBuyer(buyer)

        if (existingFavorites.any { it.car.id == car.id }) {
            throw IllegalArgumentException("Car with id ${car.id} is already in favorites")
        }

        val favoriteCar = FavoriteCar().apply {
            this.buyer = buyer
            this.car = car
            this.rating = request.rating
            this.comment = request.comment
            this.dateAdded = request.dateAdded
            this.priceNotifications = request.priceNotifications
        }

        validateFavoriteCar(favoriteCar)
        return favoriteCar
    }
}