package cta.web.controller

import cta.enum.UserRole
import cta.service.AdminService
import cta.web.dto.AdminDashboardResponse
import cta.web.dto.CarReviewResponse
import cta.web.dto.PurchaseResponse
import cta.web.dto.UserResponse
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/admin")
@CrossOrigin
@PreAuthorize("hasRole('ADMINISTRATOR')")
class AdminController(
    private val adminService: AdminService,
) {
    private val logger = LoggerFactory.getLogger(javaClass)

    // ===== DASHBOARD OVERVIEW =====

    @GetMapping("/dashboard")
    fun getDashboardOverview(): ResponseEntity<AdminDashboardResponse> {
        logger.info("Admin accessing dashboard overview")
        val response =
            AdminDashboardResponse(
                totalBuyers = adminService.getBuyerCount(),
                totalDealerships = adminService.getDealershipCount(),
                totalPurchases = adminService.getPurchaseCount(),
                totalRevenue = adminService.getTotalSystemRevenue(),
            )
        return ResponseEntity.ok(response)
    }

    // ===== USERS & DEALERSHIPS =====

    @GetMapping("/buyers")
    fun getAllBuyers(): ResponseEntity<List<UserResponse>> {
        logger.info("Admin fetching all buyers")
        val buyers = adminService.getAllBuyers()
        val response =
            buyers.map { buyer ->
                UserResponse(
                    id = buyer.id!!,
                    email = buyer.email,
                    firstName = buyer.firstName,
                    lastName = buyer.lastName,
                    phone = buyer.phone,
                    role = UserRole.BUYER,
                )
            }
        logger.info("Returning {} buyers", response.size)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/dealerships")
    fun getAllDealerships(): ResponseEntity<List<Map<String, Any>>> {
        logger.info("Admin fetching all dealerships")
        val dealerships = adminService.getAllDealerships()
        val response =
            dealerships.map { dealership ->
                mapOf<String, Any>(
                    "id" to (dealership.id ?: 0),
                    "email" to dealership.email,
                    "businessName" to dealership.businessName,
                    "phone" to dealership.phone,
                    "address" to (dealership.address ?: ""),
                    "active" to dealership.active,
                    "createdAt" to dealership.createdAt.toString(),
                )
            }
        logger.info("Returning {} dealerships", response.size)
        return ResponseEntity.ok(response)
    }

    // ===== FAVORITE CARS =====

    @GetMapping("/users/{userId}/favorites")
    fun getUserFavorites(
        @PathVariable userId: Long,
    ): ResponseEntity<List<Map<String, Any?>>> {
        logger.info("Admin fetching favorites for user ID: {}", userId)
        val favorites = adminService.getUserFavorites(userId)
        val response =
            favorites.map { favorite ->
                mapOf(
                    "id" to favorite.id,
                    "carId" to favorite.car.id,
                    "carName" to favorite.car.getFullName(),
                    "rating" to favorite.rating,
                    "comment" to favorite.comment,
                    "dateAdded" to favorite.dateAdded,
                    "priceNotifications" to favorite.priceNotifications,
                    "isReviewed" to favorite.isReviewed(),
                )
            }
        logger.info("Returning {} favorites for user {}", response.size, userId)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/cars/{carId}/favorite-count")
    fun getCarFavoriteCount(
        @PathVariable carId: Long,
    ): ResponseEntity<Map<String, Any>> {
        logger.info("Admin fetching favorite count for car ID: {}", carId)
        val count = adminService.getCarFavoriteCount(carId)
        return ResponseEntity.ok(
            mapOf(
                "carId" to carId,
                "favoriteCount" to count,
            ),
        )
    }

    @GetMapping("/favorites-with-reviews")
    fun getAllFavoritesWithReviews(): ResponseEntity<List<Map<String, Any?>>> {
        logger.info("Admin fetching all favorites with reviews")
        val favorites = adminService.getAllFavoritesWithReviews()
        val response =
            favorites.map { favorite ->
                mapOf(
                    "id" to favorite.id,
                    "buyerId" to favorite.buyer.id,
                    "buyerName" to "${favorite.buyer.firstName} ${favorite.buyer.lastName}",
                    "carId" to favorite.car.id,
                    "carName" to favorite.car.getFullName(),
                    "rating" to favorite.rating,
                    "comment" to favorite.comment,
                    "dateAdded" to favorite.dateAdded,
                )
            }
        logger.info("Returning {} favorites with reviews", response.size)
        return ResponseEntity.ok(response)
    }

    // ===== REVIEWS/OPINIONS =====

    @GetMapping("/cars/{carId}/reviews")
    fun getCarReviews(
        @PathVariable carId: Long,
    ): ResponseEntity<CarReviewResponse> {
        logger.info("Admin fetching reviews for car ID: {}", carId)
        val reviews = adminService.getCarReviews(carId)
        val averageRating = adminService.getAverageCarRating(carId)

        val reviewsList =
            reviews.map { review ->
                mapOf(
                    "id" to review.id,
                    "buyerId" to review.buyer.id,
                    "buyerName" to "${review.buyer.firstName} ${review.buyer.lastName}",
                    "rating" to review.rating,
                    "comment" to review.comment,
                    "dateAdded" to review.dateAdded,
                )
            }

        val response =
            CarReviewResponse(
                carId = carId,
                totalReviews = reviews.size.toLong(),
                averageRating = averageRating,
                reviews = reviewsList,
            )
        logger.info("Returning {} reviews for car {}", reviews.size, carId)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/users/{userId}/reviews")
    fun getUserReviews(
        @PathVariable userId: Long,
    ): ResponseEntity<List<Map<String, Any?>>> {
        logger.info("Admin fetching reviews by user ID: {}", userId)
        val reviews = adminService.getUserReviews(userId)
        val response =
            reviews.map { review ->
                mapOf(
                    "id" to review.id,
                    "carId" to review.car.id,
                    "carName" to review.car.getFullName(),
                    "rating" to review.rating,
                    "comment" to review.comment,
                    "dateAdded" to review.dateAdded,
                )
            }
        logger.info("Returning {} reviews by user {}", response.size, userId)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/top-rated-cars")
    fun getTopRatedCars(): ResponseEntity<List<Map<String, Any>>> {
        logger.info("Admin fetching top rated cars")
        val topCars = adminService.getHighestRatedCars(10)
        val response =
            topCars.map { (carId, avgRating) ->
                mapOf(
                    "carId" to carId,
                    "averageRating" to avgRating,
                )
            }
        logger.info("Returning {} top rated cars", response.size)
        return ResponseEntity.ok(response)
    }

    // ===== PURCHASES =====

    @GetMapping("/purchases")
    fun getAllPurchases(): ResponseEntity<List<PurchaseResponse>> {
        logger.info("Admin fetching all purchases")
        val purchases = adminService.getAllPurchases()
        val response =
            purchases.map { purchase ->
                PurchaseResponse.fromEntity(purchase)
            }
        logger.info("Returning {} purchases", response.size)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/users/{userId}/purchases")
    fun getUserPurchases(
        @PathVariable userId: Long,
    ): ResponseEntity<List<PurchaseResponse>> {
        logger.info("Admin fetching purchases for user ID: {}", userId)
        val purchases = adminService.getUserPurchases(userId)
        val response =
            purchases.map { purchase ->
                PurchaseResponse.fromEntity(purchase)
            }
        logger.info("Returning {} purchases for user {}", response.size, userId)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/dealerships/{dealershipId}/purchases")
    fun getDealershipPurchases(
        @PathVariable dealershipId: Long,
    ): ResponseEntity<List<PurchaseResponse>> {
        logger.info("Admin fetching purchases for dealership ID: {}", dealershipId)
        val purchases = adminService.getDealershipPurchases(dealershipId)
        val response =
            purchases.map { purchase ->
                PurchaseResponse.fromEntity(purchase)
            }
        logger.info("Returning {} purchases for dealership {}", response.size, dealershipId)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/dealerships/{dealershipId}/revenue")
    fun getDealershipRevenue(
        @PathVariable dealershipId: Long,
    ): ResponseEntity<Map<String, Any>> {
        logger.info("Admin calculating revenue for dealership ID: {}", dealershipId)
        val revenue = adminService.getDealershipRevenue(dealershipId)
        return ResponseEntity.ok(
            mapOf(
                "dealershipId" to dealershipId,
                "revenue" to revenue,
            ),
        )
    }

    @GetMapping("/revenue")
    fun getTotalRevenue(): ResponseEntity<Map<String, Any>> {
        logger.info("Admin fetching total system revenue")
        val revenue = adminService.getTotalSystemRevenue()
        return ResponseEntity.ok(
            mapOf(
                "totalRevenue" to revenue,
            ),
        )
    }
}
