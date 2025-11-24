package cta.service

import cta.model.CarOffer
import cta.repository.CarOfferRepository
import cta.web.dto.CarOfferCreateRequest
import org.slf4j.LoggerFactory
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
    private val logger = LoggerFactory.getLogger(javaClass)

    fun findById(carOfferId: Long): CarOffer {
        logger.debug("Finding car offer with ID: {}", carOfferId)
        return carOfferRepository.findByIdOrNull(carOfferId)
            ?: run {
                logger.warn("Car offer with ID {} not found", carOfferId)
                throw NoSuchElementException("Car offer with ID $carOfferId does not exist.")
            }
    }

    fun findAvailableCarOffers(): List<CarOffer> {
        logger.debug("Searching for available car offers")
        val offers = carOfferRepository.findByAvailableTrue()
        logger.info("Found {} available car offers", offers.size)
        return offers
    }

    fun findByDealershipId(dealershipId: Long): List<CarOffer> {
        logger.debug("Finding car offers for dealership ID: {}", dealershipId)
        val offers = carOfferRepository.findByDealershipId(dealershipId)
        logger.info("Found {} car offers for dealership {}", offers.size, dealershipId)
        return offers
    }

    @Transactional
    fun createCarOffer(request: CarOfferCreateRequest): CarOffer {
        logger.info("Creating car offer for car ID: {} and dealership ID: {}", request.carId, request.dealershipId)
        return try {
            val carOffer = validateAndCreateCarOffer(request)
            val savedOffer = carOfferRepository.save(carOffer)
            logger.info("Car offer created successfully with ID: {}", savedOffer.id)
            savedOffer
        } catch (ex: Exception) {
            logger.error("Error creating car offer for car ID: {} and dealership ID: {}", request.carId, request.dealershipId, ex)
            throw ex
        }
    }

    @Transactional
    fun deleteCarOffer(carOfferId: Long) {
        logger.info("Deleting car offer with ID: {}", carOfferId)
        return try {
            val carOffer =
                carOfferRepository.findByIdOrNull(carOfferId)
                    ?: run {
                        logger.warn("Car offer with ID {} not found for deletion", carOfferId)
                        throw NoSuchElementException("Car offer with ID $carOfferId does not exist.")
                    }
            carOfferRepository.delete(carOffer)
            logger.info("Car offer with ID {} deleted successfully", carOfferId)
        } catch (ex: Exception) {
            logger.error("Error deleting car offer with ID: {}", carOfferId, ex)
            throw ex
        }
    }

    @Transactional
    fun updateCarOffer(
        id: Long,
        updateData: Map<String, Any>,
    ): CarOffer {
        logger.info("Updating car offer with ID: {}", id)
        return try {
            val carOffer =
                carOfferRepository.findByIdOrNull(id)
                    ?: run {
                        logger.warn("Car offer with ID {} not found for update", id)
                        throw Exception("Car offer with ID $id not found")
                    }

            updateData["price"]?.let {
                carOffer.price = (it.toString().toBigDecimal())
                logger.debug("Updated car offer price to: {}", carOffer.price)
            }
            updateData["dealershipNotes"]?.let {
                carOffer.dealershipNotes = (it.toString())
                logger.debug("Updated car offer dealership notes")
            }

            validateCarOffer(carOffer)
            val updatedOffer = carOfferRepository.save(carOffer)
            logger.info("Car offer with ID {} updated successfully", id)
            updatedOffer
        } catch (ex: Exception) {
            logger.error("Error updating car offer with ID: {}", id, ex)
            throw ex
        }
    }

    @Transactional
    fun save(carOffer: CarOffer): CarOffer {
        logger.debug("Saving car offer")
        return carOfferRepository.save(carOffer)
    }

    fun findByCarIdAndDealershipId(
        carId: Long,
        dealershipId: Long,
    ): CarOffer? {
        logger.debug("Finding car offer for car ID: {} and dealership ID: {}", carId, dealershipId)
        return carOfferRepository.findByCarIdAndDealershipId(carId, dealershipId)
    }

    fun findAll(): List<CarOffer> {
        logger.debug("Retrieving all car offers")
        val offers = carOfferRepository.findAll()
        logger.info("Retrieved {} car offers", offers.size)
        return offers
    }

    private fun validateCarOffer(carOffer: CarOffer) {
        logger.debug("Validating car offer")
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
        logger.debug("Car offer validation passed")
    }

    private fun validateAndCreateCarOffer(request: CarOfferCreateRequest): CarOffer {
        logger.debug("Validating and creating car offer from request")
        val car = carService.findById(request.carId)
        val dealership = dealershipService.findById(request.dealershipId)
        val dealershipOffers = carOfferRepository.findAllByDealershipId(request.dealershipId)

        if (dealershipOffers.any { it.car.id == car.id }) {
            logger.warn("Car with ID {} is already being offered by dealership with ID {}", car.id, dealership.id)
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
