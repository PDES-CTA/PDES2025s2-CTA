package cta.service

import cta.model.CarOffer
import cta.repository.CarOfferRepository
import cta.web.dto.CarOfferCreateRequest
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDateTime

@Service
class CarOfferService(
    private val carOfferRepository: CarOfferRepository,
    private val carService: CarService,
    private val dealershipService: DealershipService,
) {
    fun findById(carOfferId: Long): CarOffer {
        return carOfferRepository.findByIdOrNull(carOfferId)
            ?: throw NoSuchElementException("Car offer with ID $carOfferId does not exist.")
    }

    fun findAvailableCarOffers(): List<CarOffer> {
        return carOfferRepository.findByAvailableTrue()
    }

    fun findByDealershipId(dealershipId: Long): List<CarOffer> {
        return carOfferRepository.findByDealershipId(dealershipId)
    }

    @Transactional
    fun createCarOffer(request: CarOfferCreateRequest): CarOffer {
        val carOffer = validateAndCreateCarOffer(request)
        return carOfferRepository.save(carOffer)
    }

    @Transactional
    fun deleteCarOffer(carOfferId: Long) {
        val carOffer =
            carOfferRepository.findByIdOrNull(carOfferId)
                ?: throw NoSuchElementException("Car offer with ID $carOfferId does not exist.")
        carOfferRepository.delete(carOffer)
    }

    @Transactional
    fun updateCarOffer(
        id: Long,
        updateData: Map<String, Any>,
    ): CarOffer {
        val carOffer =
            carOfferRepository.findByIdOrNull(id)
                ?: throw Exception("Car offer with ID $id not found")

        updateData["price"]?.let { carOffer.price = (it.toString().toBigDecimal()) }
        updateData["dealershipNotes"]?.let { carOffer.dealershipNotes = (it.toString()) }

        validateCarOffer(carOffer)
        return carOfferRepository.save(carOffer)
    }

    @Transactional
    fun save(carOffer: CarOffer): CarOffer {
        return carOfferRepository.save(carOffer)
    }

    fun findByCarIdAndDealershipId(
        carId: Long,
        dealershipId: Long,
    ): CarOffer? {
        return carOfferRepository.findByCarIdAndDealershipId(carId, dealershipId)
    }

    fun findAll(): List<CarOffer> {
        return carOfferRepository.findAll()
    }

    private fun validateCarOffer(carOffer: CarOffer) {
        require(carOffer.price > BigDecimal.ZERO) { "Price must be greater than zero" }

        require(carOffer.price <= BigDecimal("99999999.99")) { "Price cannot exceed 99,999,999.99" }

        requireNotNull(carOffer.car.id) { "Car must have a valid ID" }

        requireNotNull(carOffer.dealership.id) { "Dealership must have a valid ID" }

        require(carOffer.dealership.active) { "Cannot create offer for inactive dealership (ID: ${carOffer.dealership.id})" }

        requireNotNull(carOffer.offerDate) { "Offer date must be specified" }

        require(carOffer.offerDate <= LocalDateTime.now().plusMinutes(5)) { "Offer date cannot be in the future" }

        carOffer.dealershipNotes?.let { notes ->
            require(notes.length <= 1000) { "Dealership notes cannot exceed 1000 characters" }
        }
    }

    private fun validateAndCreateCarOffer(request: CarOfferCreateRequest): CarOffer {
        val car = carService.findById(request.carId)
        val dealership = dealershipService.findById(request.dealershipId)
        val dealershipOffers = carOfferRepository.findAllByDealershipId(request.dealershipId)

        if (dealershipOffers.any { it.car.id == car.id }) {
            throw IllegalArgumentException("Car with id ${car.id} is already being offered by dealership with id ${dealership.id}")
        }

        val carOffer =
            CarOffer().apply {
                this.car = car
                this.dealership = dealership
                this.price = request.price
                this.offerDate = LocalDateTime.now()
                this.dealershipNotes = request.dealershipNotes
                this.available = true
            }

        validateCarOffer(carOffer)
        return carOffer
    }
}
