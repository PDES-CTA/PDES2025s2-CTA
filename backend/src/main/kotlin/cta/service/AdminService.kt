package cta.service

import cta.model.Buyer
import cta.model.Dealership
import cta.model.FavoriteCar
import cta.model.Purchase
import cta.repository.BuyerRepository
import cta.repository.DealershipRepository
import cta.repository.FavoriteCarRepository
import cta.repository.PurchaseRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.math.BigDecimal

@Service
class AdminService(
    private val buyerRepository: BuyerRepository,
    private val dealershipRepository: DealershipRepository,
    private val favoriteCarRepository: FavoriteCarRepository,
    private val purchaseRepository: PurchaseRepository,
) {
    private val logger = LoggerFactory.getLogger(javaClass)

    // ===== USERS & DEALERSHIPS =====

    fun getAllBuyers(): List<Buyer> {
        logger.debug("Fetching all registered buyers")
        val buyers = buyerRepository.findAll()
        logger.info("Retrieved {} buyers", buyers.size)
        return buyers
    }

    fun getAllDealerships(): List<Dealership> {
        logger.debug("Fetching all registered dealerships")
        val dealerships = dealershipRepository.findAll()
        logger.info("Retrieved {} dealerships", dealerships.size)
        return dealerships
    }

    fun getBuyerCount(): Long {
        logger.debug("Counting total buyers")
        val count = buyerRepository.count()
        logger.info("Total buyers: {}", count)
        return count
    }

    fun getDealershipCount(): Long {
        logger.debug("Counting total dealerships")
        val count = dealershipRepository.count()
        logger.info("Total dealerships: {}", count)
        return count
    }

    // ===== FAVORITE CARS =====

    fun getUserFavorites(buyerId: Long): List<FavoriteCar> {
        logger.debug("Fetching favorite cars for buyer ID: {}", buyerId)
        val favorites = favoriteCarRepository.findByBuyerId(buyerId)
        logger.info("Found {} favorite cars for buyer {}", favorites.size, buyerId)
        return favorites
    }

    fun getCarFavoriteCount(carId: Long): Long {
        logger.debug("Counting favorite count for car ID: {}", carId)
        val count = favoriteCarRepository.countByCarId(carId)
        logger.info("Car {} has {} favorites", carId, count)
        return count
    }

    fun getAllFavoritesWithReviews(): List<FavoriteCar> {
        logger.debug("Fetching all favorite cars that have reviews")
        val allFavorites = favoriteCarRepository.findAll()
        val withReviews = allFavorites.filter { it.isReviewed() }
        logger.info("Found {} favorite cars with reviews", withReviews.size)
        return withReviews
    }

    fun getUserFavoritesWithReviews(buyerId: Long): List<FavoriteCar> {
        logger.debug("Fetching favorite cars with reviews for buyer ID: {}", buyerId)
        val favorites = favoriteCarRepository.findByBuyerId(buyerId)
        val withReviews = favorites.filter { it.isReviewed() }
        logger.info("Found {} favorite cars with reviews for buyer {}", withReviews.size, buyerId)
        return withReviews
    }

    // ===== REVIEWS/OPINIONS =====

    fun getCarReviews(carId: Long): List<FavoriteCar> {
        logger.debug("Fetching all reviews for car ID: {}", carId)
        val reviews = favoriteCarRepository.findByCarIdAndReviewExists(carId)
        logger.info("Found {} reviews for car {}", reviews.size, carId)
        return reviews
    }

    fun getUserReviews(buyerId: Long): List<FavoriteCar> {
        logger.debug("Fetching all reviews by buyer ID: {}", buyerId)
        val reviews = favoriteCarRepository.findByBuyerIdAndReviewExists(buyerId)
        logger.info("Found {} reviews by buyer {}", reviews.size, buyerId)
        return reviews
    }

    fun getAverageCarRating(carId: Long): Double {
        logger.debug("Calculating average rating for car ID: {}", carId)
        val reviews = favoriteCarRepository.findByCarIdAndReviewExists(carId)
        val ratings = reviews.mapNotNull { it.rating }.toList()

        return if (ratings.isNotEmpty()) {
            val average = ratings.average()
            logger.info("Average rating for car {}: {}", carId, average)
            average
        } else {
            logger.info("No ratings found for car {}", carId)
            0.0
        }
    }

    fun getHighestRatedCars(limit: Int = 10): List<Pair<Long, Double>> {
        logger.debug("Fetching top {} highest rated cars", limit)
        val allFavorites: List<FavoriteCar?> = favoriteCarRepository.findAll()

        val carRatings =
            allFavorites
                .groupBy { it?.car?.id }
                .mapNotNull { (carId, favorites) ->
                    val ratings = favorites.mapNotNull { it?.rating }
                    if (carId != null && ratings.isNotEmpty()) {
                        carId to ratings.average()
                    } else {
                        null
                    }
                }
                .sortedByDescending { it.second }
                .take(limit)

        logger.info("Found {} cars with ratings", carRatings.size)
        return carRatings
    }

    // ===== PURCHASES =====

    fun getUserPurchases(buyerId: Long): List<Purchase> {
        logger.debug("Fetching purchases for buyer ID: {}", buyerId)
        val purchases = purchaseRepository.findByBuyerId(buyerId)
        logger.info("Found {} purchases for buyer {}", purchases.size, buyerId)
        return purchases
    }

    fun getAllPurchases(): List<Purchase> {
        logger.debug("Fetching all purchases in the system")
        val purchases = purchaseRepository.findAll()
        logger.info("Found {} total purchases", purchases.size)
        return purchases
    }

    fun getPurchaseCount(): Long {
        logger.debug("Counting total purchases")
        val count = purchaseRepository.count()
        logger.info("Total purchases: {}", count)
        return count
    }

    fun getDealershipPurchases(dealershipId: Long): List<Purchase> {
        logger.debug("Fetching purchases for dealership ID: {}", dealershipId)
        val purchases = purchaseRepository.findByCarOfferDealershipId(dealershipId)
        logger.info("Found {} purchases for dealership {}", purchases.size, dealershipId)
        return purchases
    }

    fun getDealershipRevenue(dealershipId: Long): BigDecimal {
        logger.debug("Calculating revenue for dealership ID: {}", dealershipId)
        val purchases = getDealershipPurchases(dealershipId)
        val revenue =
            purchases.fold(BigDecimal.ZERO) { acc, purchase ->
                acc.plus(purchase.finalPrice)
            }
        logger.info("Dealership {} revenue: {}", dealershipId, revenue)
        return revenue
    }

    fun getTotalSystemRevenue(): BigDecimal {
        logger.debug("Calculating total system revenue")
        val allPurchases = getAllPurchases()
        val revenue =
            allPurchases.fold(BigDecimal.ZERO) { acc, purchase ->
                acc.plus(purchase.finalPrice)
            }
        logger.info("Total system revenue: {}", revenue)
        return revenue
    }

    fun getTopSellingCars(limit: Int = 5): List<Pair<Long, Long>> {
        logger.debug("Fetching top {} best-selling cars", limit)
        val allPurchases = getAllPurchases()

        val carSales =
            allPurchases
                .groupBy { it.carOffer.car.id }
                .mapNotNull { (carId, purchases) ->
                    if (carId != null) {
                        carId to purchases.size.toLong()
                    } else {
                        null
                    }
                }
                .sortedByDescending { it.second }
                .take(limit)

        logger.info("Found {} cars with sales", carSales.size)
        return carSales
    }

    fun getTopBuyersByPurchases(limit: Int = 5): List<Pair<Long, Long>> {
        logger.debug("Fetching top {} buyers by purchase count", limit)
        val allPurchases = getAllPurchases()

        val buyerPurchases =
            allPurchases
                .groupBy { it.buyer.id }
                .mapNotNull { (buyerId, purchases) ->
                    if (buyerId != null) {
                        buyerId to purchases.size.toLong()
                    } else {
                        null
                    }
                }
                .sortedByDescending { it.second }
                .take(limit)

        logger.info("Found {} buyers with purchases", buyerPurchases.size)
        return buyerPurchases
    }

    fun getTopDealershipsBySales(limit: Int = 5): List<Pair<Long, Long>> {
        logger.debug("Fetching top {} dealerships by sales count", limit)
        val allPurchases = getAllPurchases()

        val dealershipSales =
            allPurchases
                .groupBy { it.carOffer.dealership.id }
                .mapNotNull { (dealershipId, purchases) ->
                    if (dealershipId != null) {
                        dealershipId to purchases.size.toLong()
                    } else {
                        null
                    }
                }
                .sortedByDescending { it.second }
                .take(limit)

        logger.info("Found {} dealerships with sales", dealershipSales.size)
        return dealershipSales
    }

    fun getCarNameById(carId: Long): String {
        return try {
            val purchases = getAllPurchases()
            val car = purchases.find { it.carOffer.car.id == carId }?.carOffer?.car

            if (car != null) {
                car.getFullName()
            } else {
                logger.warn("Car not found for ID {}", carId)
                "Unknown Car"
            }
        } catch (e: Exception) {
            logger.warn("Error fetching car name for ID {}", carId, e)
            "Unknown Car"
        }
    }

    fun getBuyerNameById(buyerId: Long): String {
        return try {
            val buyer = buyerRepository.findById(buyerId).orElse(null)
            if (buyer != null) {
                "${buyer.firstName} ${buyer.lastName}"
            } else {
                logger.warn("Buyer not found for ID {}", buyerId)
                "Unknown Buyer"
            }
        } catch (e: Exception) {
            logger.warn("Error fetching buyer name for ID {}", buyerId, e)
            "Unknown Buyer"
        }
    }

    fun getDealershipNameById(dealershipId: Long): String {
        return try {
            val dealership = dealershipRepository.findById(dealershipId).orElse(null)
            if (dealership != null) {
                dealership.businessName
            } else {
                logger.warn("Dealership not found for ID {}", dealershipId)
                "Unknown Dealership"
            }
        } catch (e: Exception) {
            logger.warn("Error fetching dealership name for ID {}", dealershipId, e)
            "Unknown Dealership"
        }
    }
}
