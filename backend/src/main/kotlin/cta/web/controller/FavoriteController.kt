package cta.web.controller

import cta.service.FavoriteService
import cta.web.dto.FavoriteCarCreateRequest
import cta.web.dto.FavoriteCarResponse
import cta.web.dto.FavoriteCarUpdateReviewRequest
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/favorite")
@CrossOrigin(origins = ["*"])
@Tag(name = "Favorite Car", description = "Favorite car management operations")
class FavoriteController(
    private val favoriteService: FavoriteService,
) {
    private val logger = LoggerFactory.getLogger(javaClass)

    @PostMapping
    @Operation(summary = "Save a favorite car marked by a buyer")
    fun saveFavorite(
        @Valid @RequestBody request: FavoriteCarCreateRequest,
    ): ResponseEntity<FavoriteCarResponse> {
        logger.info(
            "POST /api/favorite - Save favorite car request - Buyer ID: {}, Car ID: {}",
            request.buyerId,
            request.carId,
        )

        return try {
            val favorite = favoriteService.saveFavorite(request)
            logger.info("POST /api/favorite - Favorite car saved with ID: {}", favorite.id)
            ResponseEntity.ok(FavoriteCarResponse.fromEntity(favorite))
        } catch (ex: IllegalArgumentException) {
            logger.warn("POST /api/favorite - Validation error: {}", ex.message)
            ResponseEntity.badRequest().build()
        } catch (ex: Exception) {
            logger.error("POST /api/favorite - Error saving favorite car", ex)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an existing favorite car marked by a buyer")
    fun deleteFavoriteCar(
        @PathVariable id: Long,
    ): ResponseEntity<Unit> {
        logger.info("DELETE /api/favorite/{} - Deletion request received", id)

        return try {
            favoriteService.deleteFavoriteCar(id)
            logger.info("DELETE /api/favorite/{} - Favorite car deleted", id)
            ResponseEntity.noContent().build()
        } catch (ex: NoSuchElementException) {
            logger.warn("DELETE /api/favorite/{} - Favorite car not found", id)
            ResponseEntity.notFound().build()
        } catch (ex: Exception) {
            logger.error("DELETE /api/favorite/{} - Error deleting favorite car", id, ex)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a favorite car review")
    fun updateReview(
        @PathVariable id: Long,
        @Valid @RequestBody request: FavoriteCarUpdateReviewRequest,
    ): ResponseEntity<FavoriteCarResponse?> {
        logger.info("PUT /api/favorite/{} - Update review request - Rating: {}", id, request.rating)

        return try {
            val updatedFavoriteCarReview = favoriteService.updateReview(id, request.rating, request.comment)
            logger.info("PUT /api/favorite/{} - Review updated", id)
            ResponseEntity.ok(FavoriteCarResponse.fromEntity(updatedFavoriteCarReview))
        } catch (ex: NoSuchElementException) {
            logger.warn("PUT /api/favorite/{} - Favorite car not found", id)
            ResponseEntity.notFound().build()
        } catch (ex: IllegalArgumentException) {
            logger.warn("PUT /api/favorite/{} - Validation error: {}", id, ex.message)
            ResponseEntity.badRequest().build()
        } catch (ex: Exception) {
            logger.error("PUT /api/favorite/{} - Error updating review", id, ex)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get favorite car by its ID")
    fun getFavoriteById(
        @PathVariable id: Long,
    ): ResponseEntity<FavoriteCarResponse> {
        logger.debug("GET /api/favorite/{} - Request received", id)

        return try {
            val favorite = favoriteService.findById(id)
            logger.info("GET /api/favorite/{} - Favorite car found", id)
            ResponseEntity.ok(FavoriteCarResponse.fromEntity(favorite))
        } catch (ex: NoSuchElementException) {
            logger.warn("GET /api/favorite/{} - Favorite car not found", id)
            ResponseEntity.notFound().build()
        } catch (ex: Exception) {
            logger.error("GET /api/favorite/{} - Unexpected error", id, ex)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }

    @GetMapping("/buyer/{buyerId}")
    @Operation(summary = "Get all favorite cars for a specific buyer")
    fun getFavoritesByBuyerId(
        @PathVariable buyerId: Long,
    ): ResponseEntity<List<FavoriteCarResponse>> {
        logger.debug("GET /api/favorite/buyer/{} - Request received", buyerId)

        return try {
            val favorites = favoriteService.findByBuyerId(buyerId)
            logger.info("GET /api/favorite/buyer/{} - Retrieved {} favorite cars", buyerId, favorites.size)
            ResponseEntity.ok(favorites.map { FavoriteCarResponse.fromEntity(it) })
        } catch (ex: Exception) {
            logger.error("GET /api/favorite/buyer/{} - Unexpected error", buyerId, ex)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }

    @GetMapping("/car/{carId}")
    @Operation(summary = "Get all favorites associated with a specific car")
    fun getFavoritesByCarId(
        @PathVariable carId: Long,
    ): ResponseEntity<List<FavoriteCarResponse>> {
        logger.debug("GET /api/favorite/car/{} - Request received", carId)

        return try {
            val favorites = favoriteService.findByCarId(carId)
            logger.info("GET /api/favorite/car/{} - Retrieved {} buyers who favorited this car", carId, favorites.size)
            ResponseEntity.ok(favorites.map { FavoriteCarResponse.fromEntity(it) })
        } catch (ex: Exception) {
            logger.error("GET /api/favorite/car/{} - Unexpected error", carId, ex)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }
}
