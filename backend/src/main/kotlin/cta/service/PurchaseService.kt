package cta.service

import cta.enum.PaymentMethod
import cta.enum.PurchaseStatus
import cta.model.Purchase
import cta.repository.CarRepository
import cta.repository.DealershipRepository
import cta.repository.PurchaseRepository
import cta.web.dto.PurchaseCreateRequest
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.NoSuchElementException

@Service
class PurchaseService(
    private val purchaseRepository: PurchaseRepository,
    private val carRepository: CarRepository,
    //private val buyerRepository: BuyerRepository,
    private val dealershipRepository: DealershipRepository
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

    fun findByCarId(carId: Long): Purchase {
        return purchaseRepository.findByCarId(carId)
    }

    fun findByDealershipId(dealershipId: Long): List<Purchase> {
        return purchaseRepository.findByDealershipId(dealershipId)
    }

    @Transactional
    fun createPurchase(purchaseCreateRequest: PurchaseCreateRequest): Purchase {
        val purchase = validateAndTransformPurchaseCreateRequest(purchaseCreateRequest)
        validatePurchase(purchase)
        return purchaseRepository.save(purchase)
    }

    @Transactional
    fun updatePurchase(id: Long, updateData: Map<String, Any>): Purchase {
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
        purchaseRepository.delete(purchase)
    }

    @Transactional
    fun markAsConfirmed(id: Long): Purchase {
        val purchase = findById(id)
        purchase.confirmPurchase()
        return purchaseRepository.save(purchase)
    }

    @Transactional
    fun markAsPending(id: Long): Purchase {
        val purchase = findById(id)
        purchase.pendingPurchase()
        return purchaseRepository.save(purchase)
    }

    @Transactional
    fun markAsCanceled(id: Long): Purchase {
        val purchase = findById(id)
        purchase.cancelPurchase()
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
        val car = carRepository.findByIdOrNull(request.carId)
            ?: throw NoSuchElementException("Car with ID ${request.carId} not found")
            //val buyer = buyerRepository.findById(request.buyerId)
    //    .orElseThrow { NoSuchElementException("Buyer with ID ${request.buyerId} not found") }
        val dealership = dealershipRepository.findByIdOrNull(request.dealershipId)
            ?: throw NoSuchElementException("Dealership with ID ${request.dealershipId} not found")

        require(car.available) { "Car ${car.id} is not available for purchase" }

        // require(car.dealershipId == request.dealershipId) {
        //     "Car ${car.id} doesn't belong to dealership ${request.dealershipId}"
        // }

        //require(buyerRepository.findById(request.buyerId)) {
        //    "Buyer with ID ${request.buyerId} not found"
        //}

        //require(dealershipRepository.existsById(request.dealershipId)) {
        //    "Dealership with ID ${request.dealershipId} not found"
        //}

        require(car.dealershipId == request.dealershipId) {
            "Car ${car.id} doesn't belong to dealership ${request.dealershipId}"
        }

        val purchase = Purchase().apply {
            this.buyerId = request.buyerId
            this.car = car
            this.dealership = dealership
            this.finalPrice = request.finalPrice
            this.paymentMethod = request.paymentMethod
            this.observations = request.observations
            this.purchaseDate = request.purchaseDate
            this.purchaseStatus = request.purchaseStatus
        }
        return purchase
    }
}