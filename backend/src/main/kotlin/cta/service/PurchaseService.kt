package cta.service

import cta.enum.PaymentMethod
import cta.enum.PurchaseStatus
import cta.model.Purchase
import cta.repository.PurchaseRepository
import cta.web.dto.PurchaseCreateRequest
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
    fun findById(id: Long): Purchase {
        return purchaseRepository.findByIdOrNull(id)
            ?: throw NoSuchElementException("Purchase with id $id not found")
    }

    fun findAll(): List<Purchase> {
        return purchaseRepository.findAll()
    }

    fun findByBuyerId(buyerId: Long): List<Purchase> {
        return purchaseRepository.findByBuyerId(buyerId)
    }

    fun findByCarId(carId: Long): List<Purchase> {
        return purchaseRepository.findByCarOfferCarId(carId)
    }

    fun findByDealershipId(dealershipId: Long): List<Purchase> {
        return purchaseRepository.findByCarOfferDealershipId(dealershipId)
    }

    @Transactional
    fun createPurchase(purchaseCreateRequest: PurchaseCreateRequest): Purchase {
        val purchase = validateAndTransformPurchaseCreateRequest(purchaseCreateRequest)
        validatePurchase(purchase)
        return purchaseRepository.save(purchase)
    }

    @Transactional
    fun updatePurchase(
        id: Long,
        updateData: Map<String, Any>,
    ): Purchase {
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
        return purchaseRepository.save(purchase)
    }

    @Transactional
    fun deletePurchase(id: Long) {
        val purchase = findById(id)
        purchase.carOffer.markAsAvailable()
        carOfferService.save(purchase.carOffer)
        purchaseRepository.delete(purchase)
    }

    @Transactional
    fun markAsConfirmed(id: Long): Purchase {
        val purchase = findById(id)
        carOfferService.save(purchase.carOffer)
        return purchaseRepository.save(purchase)
    }

    @Transactional
    fun markAsPending(id: Long): Purchase {
        val purchase = findById(id)
        purchase.pendingPurchase()
        if (!purchase.carOffer.available) {
            purchase.carOffer.markAsSold()
            carOfferService.save(purchase.carOffer)
        }
        return purchaseRepository.save(purchase)
    }

    @Transactional
    fun markAsCanceled(id: Long): Purchase {
        val purchase = findById(id)
        purchase.cancelPurchase()
        carOfferService.save(purchase.carOffer)
        return purchaseRepository.save(purchase)
    }

    @Transactional
    fun markAsDelivered(id: Long): Purchase {
        val purchase = findById(id)
        purchase.deliverPurchase()
        return purchaseRepository.save(purchase)
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
    }

    private fun validateAndTransformPurchaseCreateRequest(request: PurchaseCreateRequest): Purchase {
        val carOffer = carOfferService.findById(request.carOfferId)
        val buyer = buyerService.findById(request.buyerId)

        require(carOffer.available) { "Car Offer ${carOffer.id} is not available for purchase" }
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
        return purchase
    }
}
