package cta.web.controller

import cta.service.FavoriteService
import cta.web.dto.FavoriteCarCreateRequest
import cta.web.dto.FavoriteCarResponse
import cta.web.dto.FavoriteCarUpdateReviewRequest
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
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
    @PostMapping
    @Operation(summary = "Save a favorite car marked by a buyer")
    fun saveFavorite(
        @Valid @RequestBody request: FavoriteCarCreateRequest,
    ): ResponseEntity<FavoriteCarResponse> {
        val favorite = favoriteService.saveFavorite(request)
        return ResponseEntity.ok(FavoriteCarResponse.fromEntity(favorite))
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an existing favorite car marked by a buyer")
    fun deleteFavoriteCar(
        @PathVariable id: Long,
    ): ResponseEntity<Unit> {
        favoriteService.deleteFavoriteCar(id)
        return ResponseEntity.noContent().build()
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a favorite car review")
    fun updateReview(
        @PathVariable id: Long,
        @Valid @RequestBody request: FavoriteCarUpdateReviewRequest,
    ): ResponseEntity<FavoriteCarResponse?> {
        val updatedFavoriteCarReview = favoriteService.updateReview(id, request.rating, request.comment)
        return ResponseEntity.ok(FavoriteCarResponse.fromEntity(updatedFavoriteCarReview))
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get favorite car by its ID")
    fun getFavoriteById(
        @PathVariable id: Long,
    ): ResponseEntity<FavoriteCarResponse> {
        val favorite = favoriteService.findById(id)
        return ResponseEntity.ok(FavoriteCarResponse.fromEntity(favorite))
    }

    @GetMapping("/buyer/{buyerId}")
    @Operation(summary = "Get all favorite cars for a specific buyer")
    fun getFavoritesByBuyerId(
        @PathVariable buyerId: Long,
    ): ResponseEntity<List<FavoriteCarResponse>> {
        val favorites = favoriteService.findByBuyerId(buyerId)
        return ResponseEntity.ok(favorites.map { FavoriteCarResponse.fromEntity(it) })
    }

    @GetMapping("/car/{carId}")
    @Operation(summary = "Get all favorites associated with a specific car")
    fun getFavoritesByCarId(
        @PathVariable carId: Long,
    ): ResponseEntity<List<FavoriteCarResponse>> {
        val favorites = favoriteService.findByCarId(carId)
        return ResponseEntity.ok(favorites.map { FavoriteCarResponse.fromEntity(it) })
    }
}
