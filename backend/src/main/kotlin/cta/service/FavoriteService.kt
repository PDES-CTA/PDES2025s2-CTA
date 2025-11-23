package cta.service

import cta.model.FavoriteCar
import cta.repository.FavoriteCarRepository
import cta.web.dto.FavoriteCarCreateRequest
import org.slf4j.LoggerFactory
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class FavoriteService(
    private val favoriteCarRepository: FavoriteCarRepository,
    private val carService: CarService,
    private val buyerService: BuyerService,
) {
    private val logger = LoggerFactory.getLogger(javaClass)

    fun findById(id: Long): FavoriteCar {
        logger.debug("Fetching Favorite Car with ID: {}", id)

        return favoriteCarRepository.findByIdOrNull(id)
            ?.also { logger.debug("Favorite Car found: {}", it.id) }
            ?: run {
                logger.warn("Favorite Car with ID {} not found", id)
                throw NoSuchElementException("Favorite car with id $id not found")
            }
    }

    fun findByBuyerId(buyerId: Long): List<FavoriteCar> {
        logger.debug("Fetching favorite cars for Buyer with ID: {}", buyerId)

        val favorites = favoriteCarRepository.findByBuyerId(buyerId)
        logger.debug("Found {} favorite cars for Buyer {}", favorites.size, buyerId)
        return favorites
    }

    fun findByCarId(carId: Long): List<FavoriteCar> {
        logger.debug("Fetching all buyers who favorited Car with ID: {}", carId)

        val favorites = favoriteCarRepository.findByCarId(carId)
        logger.debug("Found {} buyers who favorited Car {}", favorites.size, carId)
        return favorites
    }

    @Transactional
    fun saveFavorite(favoriteCarCreateRequest: FavoriteCarCreateRequest): FavoriteCar {
        logger.info("Starting save of favorite car - Buyer ID: {}, Car ID: {}",
            favoriteCarCreateRequest.buyerId, favoriteCarCreateRequest.carId)

        return try {
            val favoriteCar = validateAndTransformFavoriteRequest(favoriteCarCreateRequest)
            val savedFavorite = favoriteCarRepository.save(favoriteCar)
            logger.info("Favorite car saved successfully with ID: {} - Buyer: {}, Car: {}",
                savedFavorite.id, favoriteCarCreateRequest.buyerId, favoriteCarCreateRequest.carId)
            savedFavorite
        } catch (ex: IllegalArgumentException) {
            logger.warn("Validation error when saving favorite car: {}", ex.message)
            throw ex
        } catch (ex: Exception) {
            logger.error("Unexpected error when saving favorite car", ex)
            throw ex
        }
    }

    @Transactional
    fun deleteFavoriteCar(id: Long) {
        logger.info("Starting deletion of Favorite Car with ID: {}", id)

        try {
            val favoriteCar = findById(id)
            favoriteCarRepository.delete(favoriteCar)
            logger.info("Favorite Car ID {} deleted successfully", id)
        } catch (ex: Exception) {
            logger.error("Error when deleting Favorite Car with ID: {}", id, ex)
            throw ex
        }
    }

    @Transactional
    fun updateReview(
        id: Long,
        rating: Int?,
        comment: String?,
    ): FavoriteCar {
        logger.info("Starting update of review for Favorite Car with ID: {}", id)

        return try {
            val favoriteCar = findById(id)

            favoriteCar.rating = rating
            favoriteCar.comment = comment?.ifBlank { null }

            validateFavoriteCar(favoriteCar)
            val updatedFavorite = favoriteCarRepository.save(favoriteCar)
            logger.info("Favorite Car ID {} review updated successfully. Rating: {}", id, rating)
            updatedFavorite
        } catch (ex: IllegalArgumentException) {
            logger.warn("Validation error when updating favorite car review {}: {}", id, ex.message)
            throw ex
        } catch (ex: Exception) {
            logger.error("Unexpected error when updating favorite car review for ID {}", id, ex)
            throw ex
        }
    }

    @Transactional
    fun updateReview(
        id: Long,
        updateData: Map<String, Any>,
    ): FavoriteCar {
        logger.info("Starting update of review for Favorite Car with ID: {}", id)

        return try {
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
            val updatedFavorite = favoriteCarRepository.save(favoriteCar)
            logger.info("Favorite Car ID {} review updated successfully. Changed fields: {}", id, updateData.keys.joinToString(", "))
            updatedFavorite
        } catch (ex: IllegalArgumentException) {
            logger.warn("Validation error when updating favorite car review {}: {}", id, ex.message)
            throw ex
        } catch (ex: Exception) {
            logger.error("Unexpected error when updating favorite car review for ID {}", id, ex)
            throw ex
        }
    }

    private fun validateFavoriteCar(favoriteCar: FavoriteCar) {
        favoriteCar.rating?.let {
            require(it in 0..10) { "Rating must be between 0 and 10" }
        }
        favoriteCar.comment?.let {
            require(it.length <= 1000) { "Comment cannot exceed 1000 characters" }
        }
        logger.debug("Favorite Car validation completed successfully")
    }

    private fun validateAndTransformFavoriteRequest(request: FavoriteCarCreateRequest): FavoriteCar {
        try {
            val car = carService.findById(request.carId)
            val buyer = buyerService.findById(request.buyerId)

            val existingFavorite = favoriteCarRepository.findByBuyerIdAndCarId(request.buyerId, request.carId)
            if (existingFavorite != null) {
                logger.warn("Buyer {} already has car {} as favorite", request.buyerId, request.carId)
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

            logger.debug("Favorite Car validated and transformed successfully")
            return favoriteCar
        } catch (ex: IllegalArgumentException) {
            throw ex
        } catch (ex: Exception) {
            logger.error("Error validating and transforming favorite car request", ex)
            throw ex
        }
    }
}
