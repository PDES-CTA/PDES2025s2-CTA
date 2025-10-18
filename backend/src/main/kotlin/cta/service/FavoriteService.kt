package cta.service

import cta.model.FavoriteCar
import cta.repository.BuyerRepository
import cta.repository.FavoriteCarRepository
import cta.web.dto.FavoriteCarCreateRequest
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
class FavoriteService(
    private val favoriteCarRepository: FavoriteCarRepository,
    private val carService: CarService,
    private val buyerService: BuyerService,
) {
    fun findById(id: Long): FavoriteCar {
        return favoriteCarRepository.findByIdOrNull(id)
            ?: throw NoSuchElementException("Favorite car with id $id not found")
    }

    fun findByBuyerId(buyerId: Long): List<FavoriteCar> {
        return favoriteCarRepository.findByBuyerId(buyerId)
    }

    fun findByCarId(carId: Long): List<FavoriteCar> {
        return favoriteCarRepository.findByCarId(carId)
    }

    @Transactional
    fun saveFavorite(favoriteCarCreateRequest: FavoriteCarCreateRequest): FavoriteCar {
        val favoriteCar = validateAndTransformFavoriteRequest(favoriteCarCreateRequest)
        return favoriteCarRepository.save(favoriteCar)
    }

    @Transactional
    fun deleteFavoriteCar(id: Long) {
        val favoriteCar = findById(id)
        favoriteCarRepository.delete(favoriteCar)
    }

    @Transactional
    fun updateReview(
        id: Long,
        rating: Int?,
        comment: String?,
    ): FavoriteCar {
        val favoriteCar = findById(id)

        favoriteCar.rating = rating
        favoriteCar.comment = comment?.ifBlank { null }

        validateFavoriteCar(favoriteCar)
        return favoriteCarRepository.save(favoriteCar)
    }

    @Transactional
    fun updateReview(
        id: Long,
        updateData: Map<String, Any>,
    ): FavoriteCar {
        val favoriteCar = findById(id)

        updateData["rating"]?.let {
            val r = it.toString().toInt()
            favoriteCar.rating = r
        }
        updateData["comment"]?.let {
            val c = it.toString()
             favoriteCar.comment = c.ifBlank { null }
        }

        validateFavoriteCar(favoriteCar)
        return favoriteCarRepository.save(favoriteCar)
    }

    private fun validateFavoriteCar(favoriteCar: FavoriteCar) {
        favoriteCar.rating?.let {
            require(it in 0..10) { "Rating must be between 0 and 10" }
        }
        favoriteCar.comment?.let {
            require(it.length <= 1000) { "Comment cannot exceed 1000 characters" }
        }

    }

    private fun validateAndTransformFavoriteRequest(request: FavoriteCarCreateRequest): FavoriteCar {
        val car = carService.findById(request.carId)
        val buyer = buyerService.findById(request.buyerId)
        val existingFavorite = favoriteCarRepository.findByBuyerIdAndCarId(request.buyerId, request.carId)
        if (existingFavorite != null) {
            throw IllegalArgumentException("Buyer ${request.buyerId} already has car ${request.carId} as favorite")
        }

        request.rating?.let {
            require(it in 0..10) { "Rating must be between 0 and 10" }
        }
        request.comment?.let {
            require(it.length <= 1000) { "Comment cannot exceed 1000 characters" }
        }

        val favoriteCar =
            FavoriteCar().apply {
                this.buyer = buyer
                this.car = car
                this.rating = request.rating
                this.comment = request.comment?.ifBlank { null }
                this.dateAdded = request.dateAdded
                this.priceNotifications = request.priceNotifications
            }

        return favoriteCar
    }
}
