package cta.web.controller

import cta.service.FavoriteService
import cta.web.dto.FavoriteCarCreateRequest
import cta.web.dto.FavoriteCarResponse
import cta.web.dto.FavoriteCarUpdateReviewRequest
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.slf4j.LoggerFactory
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
        val favorite = favoriteService.saveFavorite(request)
        logger.info("POST /api/favorite - Favorite car saved with ID: {}", favorite.id)
        return ResponseEntity.ok(FavoriteCarResponse.fromEntity(favorite))
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an existing favorite car marked by a buyer")
    fun deleteFavoriteCar(
        @PathVariable id: Long,
    ): ResponseEntity<Unit> {
        logger.info("DELETE /api/favorite/{} - Deletion request received", id)
        favoriteService.deleteFavoriteCar(id)
        logger.info("DELETE /api/favorite/{} - Favorite car deleted", id)
        return ResponseEntity.noContent().build()
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a favorite car review")
    fun updateReview(
        @PathVariable id: Long,
        @Valid @RequestBody request: FavoriteCarUpdateReviewRequest,
    ): ResponseEntity<FavoriteCarResponse> {
        logger.info("PUT /api/favorite/{} - Update review request - Rating: {}", id, request.rating)
        val updatedFavoriteCarReview = favoriteService.updateReview(id, request.rating, request.comment)
        logger.info("PUT /api/favorite/{} - Review updated", id)
        return ResponseEntity.ok(FavoriteCarResponse.fromEntity(updatedFavoriteCarReview))
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get favorite car by its ID")
    fun getFavoriteById(
        @PathVariable id: Long,
    ): ResponseEntity<FavoriteCarResponse> {
        logger.debug("GET /api/favorite/{} - Request received", id)
        val favorite = favoriteService.findById(id)
        logger.info("GET /api/favorite/{} - Favorite car found", id)
        return ResponseEntity.ok(FavoriteCarResponse.fromEntity(favorite))
    }

    @GetMapping("/buyer/{buyerId}")
    @Operation(summary = "Get all favorite cars for a specific buyer")
    fun getFavoritesByBuyerId(
        @PathVariable buyerId: Long,
    ): ResponseEntity<List<FavoriteCarResponse>> {
        logger.debug("GET /api/favorite/buyer/{} - Request received", buyerId)
        val favorites = favoriteService.findByBuyerId(buyerId)
        logger.info("GET /api/favorite/buyer/{} - Retrieved {} favorite cars", buyerId, favorites.size)
        return ResponseEntity.ok(favorites.map { FavoriteCarResponse.fromEntity(it) })
    }

    @GetMapping("/car/{carId}")
    @Operation(summary = "Get all favorites associated with a specific car")
    fun getFavoritesByCarId(
        @PathVariable carId: Long,
    ): ResponseEntity<List<FavoriteCarResponse>> {
        logger.debug("GET /api/favorite/car/{} - Request received", carId)
        val favorites = favoriteService.findByCarId(carId)
        logger.info("GET /api/favorite/car/{} - Retrieved {} buyers who favorited this car", carId, favorites.size)
        return ResponseEntity.ok(favorites.map { FavoriteCarResponse.fromEntity(it) })
    }
}
