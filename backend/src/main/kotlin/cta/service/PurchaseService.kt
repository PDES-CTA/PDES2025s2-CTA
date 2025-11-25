package cta.service

import cta.enum.PaymentMethod
import cta.enum.PurchaseStatus
import cta.model.Purchase
import cta.repository.PurchaseRepository
import cta.web.dto.PurchaseCreateRequest
import org.slf4j.LoggerFactory
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDateTime

@Service
class PurchaseService(
    private val purchaseRepository: PurchaseRepository,
    private val carOfferService: CarOfferService,
    private val buyerService: BuyerService,
) {
    private val logger = LoggerFactory.getLogger(javaClass)

    fun findById(id: Long): Purchase {
        logger.debug("Fetching Purchase with ID: {}", id)

        return purchaseRepository.findByIdOrNull(id)
            ?.also { logger.debug("Purchase found: {}", it.id) }
            ?: run {
                logger.warn("Purchase with ID {} not found", id)
                throw NoSuchElementException("Purchase with id $id not found")
            }
    }

    fun findAll(): List<Purchase> {
        logger.debug("Fetching all purchases")
        val purchases = purchaseRepository.findAll()
        logger.debug("Found {} purchases", purchases.size)
        return purchases
    }

    fun findByBuyerId(buyerId: Long): List<Purchase> {
        logger.debug("Fetching purchases for Buyer with ID: {}", buyerId)
        val purchases = purchaseRepository.findByBuyerId(buyerId)
        logger.debug("Found {} purchases for Buyer {}", purchases.size, buyerId)
        return purchases
    }

    fun findByCarId(carId: Long): List<Purchase> {
        logger.debug("Fetching purchases for Car with ID: {}", carId)
        val purchases = purchaseRepository.findByCarOfferCarId(carId)
        logger.debug("Found {} purchases for Car {}", purchases.size, carId)
        return purchases
    }

    fun findByDealershipId(dealershipId: Long): List<Purchase> {
        logger.debug("Fetching purchases for Dealership with ID: {}", dealershipId)
        val purchases = purchaseRepository.findByCarOfferDealershipId(dealershipId)
        logger.debug("Found {} purchases for Dealership {}", purchases.size, dealershipId)
        return purchases
    }

    @Transactional
    fun createPurchase(purchaseCreateRequest: PurchaseCreateRequest): Purchase {
        logger.info(
            "Starting creation of Purchase - Buyer ID: {}, Car Offer ID: {}",
            purchaseCreateRequest.buyerId,
            purchaseCreateRequest.carOfferId,
        )

        return try {
            val purchase = validateAndTransformPurchaseCreateRequest(purchaseCreateRequest)
            validatePurchase(purchase)
            val savedPurchase = purchaseRepository.save(purchase)
            logger.info(
                "Purchase created successfully with ID: {} - Buyer: {}, Car Offer: {}",
                savedPurchase.id,
                purchaseCreateRequest.buyerId,
                purchaseCreateRequest.carOfferId,
            )
            savedPurchase
        } catch (ex: IllegalArgumentException) {
            logger.warn("Validation error when creating Purchase: {}", ex.message)
            throw ex
        } catch (ex: Exception) {
            logger.error("Unexpected error when creating Purchase", ex)
            throw ex
        }
    }

    @Transactional
    fun updatePurchase(
        id: Long,
        updateData: Map<String, Any>,
    ): Purchase {
        logger.info("Starting update of Purchase with ID: {}", id)

        return try {
            val purchase = findById(id)

            updateData["finalPrice"]?.let { purchase.finalPrice = BigDecimal(it.toString()) }
            updateData["purchaseDate"]?.let { purchase.purchaseDate = LocalDateTime.parse(it.toString()) }
            updateData["purchaseStatus"]?.let {
                purchase.purchaseStatus = PurchaseStatus.valueOf(it.toString())
            }
            updateData["paymentMethod"]?.let {
                purchase.paymentMethod = PaymentMethod.valueOf(it.toString())
            }
            updateData["observations"]?.let { purchase.observations = it.toString() }

            validatePurchase(purchase)
            val updatedPurchase = purchaseRepository.save(purchase)
            logger.info("Purchase ID {} updated successfully. Changed fields: {}", id, updateData.keys.joinToString(", "))
            updatedPurchase
        } catch (ex: IllegalArgumentException) {
            logger.warn("Validation error when updating Purchase {}: {}", id, ex.message)
            throw ex
        } catch (ex: Exception) {
            logger.error("Unexpected error when updating Purchase with ID: {}", id, ex)
            throw ex
        }
    }

    @Transactional
    fun deletePurchase(id: Long) {
        logger.info("Starting deletion of Purchase with ID: {}", id)

        try {
            val purchase = findById(id)
            carOfferService.save(purchase.carOffer)
            purchaseRepository.delete(purchase)
            logger.info("Purchase ID {} deleted successfully", id)
        } catch (ex: Exception) {
            logger.error("Error when deleting Purchase with ID: {}", id, ex)
            throw ex
        }
    }

    @Transactional
    fun markAsConfirmed(id: Long): Purchase {
        logger.info("Starting confirmation of Purchase with ID: {}", id)

        return try {
            val purchase = findById(id)
            purchase.confirmPurchase()
            carOfferService.save(purchase.carOffer)
            val confirmedPurchase = purchaseRepository.save(purchase)
            logger.info("Purchase ID {} marked as confirmed", id)
            confirmedPurchase
        } catch (ex: Exception) {
            logger.error("Error when confirming Purchase with ID: {}", id, ex)
            throw ex
        }
    }

    @Transactional
    fun markAsPending(id: Long): Purchase {
        logger.info("Starting pending operation for Purchase with ID: {}", id)

        return try {
            val purchase = findById(id)
            purchase.pendingPurchase()
            carOfferService.save(purchase.carOffer)
            val pendingPurchase = purchaseRepository.save(purchase)
            logger.info("Purchase ID {} marked as pending", id)
            pendingPurchase
        } catch (ex: Exception) {
            logger.error("Error when marking Purchase {} as pending", id, ex)
            throw ex
        }
    }

    @Transactional
    fun markAsCanceled(id: Long): Purchase {
        logger.info("Starting cancellation of Purchase with ID: {}", id)

        return try {
            val purchase = findById(id)
            purchase.cancelPurchase()
            carOfferService.save(purchase.carOffer)
            val canceledPurchase = purchaseRepository.save(purchase)
            logger.info("Purchase ID {} marked as canceled", id)
            canceledPurchase
        } catch (ex: Exception) {
            logger.error("Error when canceling Purchase with ID: {}", id, ex)
            throw ex
        }
    }

    @Transactional
    fun markAsDelivered(id: Long): Purchase {
        logger.info("Starting delivery operation for Purchase with ID: {}", id)

        return try {
            val purchase = findById(id)
            purchase.deliverPurchase()
            val deliveredPurchase = purchaseRepository.save(purchase)
            logger.info("Purchase ID {} marked as delivered", id)
            deliveredPurchase
        } catch (ex: Exception) {
            logger.error("Error when marking Purchase {} as delivered", id, ex)
            throw ex
        }
    }

    private fun validatePurchase(purchase: Purchase) {
        require(purchase.finalPrice > BigDecimal.ZERO) { "Final price must be greater than zero" }
        require(purchase.finalPrice <= BigDecimal("99999999999999.99")) { "Final price exceeds maximum allowed value" }
        require(purchase.finalPrice.scale() <= 2) { "Final price cannot have more than 2 decimal places" }

        require(purchase.purchaseDate.isBefore(LocalDateTime.now())) { "Purchase date has to be in the past" }
        require(purchase.purchaseDate <= LocalDateTime.now()) { "Purchase date cannot be in the future" }
        require(purchase.purchaseDate.isAfter(LocalDateTime.of(2000, 1, 1, 0, 0))) {
            "Purchase date must be after January 1, 2000"
        }

        purchase.observations?.let {
            require(it.length <= 1000) { "Observations cannot exceed 1000 characters" }
        }

        logger.debug("Purchase validation completed successfully")
    }

    private fun validateAndTransformPurchaseCreateRequest(request: PurchaseCreateRequest): Purchase {
        val carOffer = carOfferService.findById(request.carOfferId)
        val buyer = buyerService.findById(request.buyerId)

        require(buyer.isActive()) { "Buyer ${buyer.id} is not active" }
        require(carOffer.dealership.isActive()) { "Dealership ${carOffer.dealership.id} is not active" }

        val purchase =
            Purchase().apply {
                this.buyer = buyer
                this.carOffer = carOffer
                this.finalPrice = request.finalPrice
                this.paymentMethod = request.paymentMethod
                this.observations = request.observations
                this.purchaseDate = request.purchaseDate
                this.purchaseStatus = request.purchaseStatus
            }

        logger.debug("Purchase request validated and transformed successfully")
        return purchase
    }
}
