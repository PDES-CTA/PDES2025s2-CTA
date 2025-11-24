package cta.web.controller

import cta.service.CarOfferService
import cta.web.dto.CarOfferCreateRequest
import cta.web.dto.CarOfferResponse
import cta.web.dto.CarOfferUpdateRequest
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
@RequestMapping("/api/offer")
@CrossOrigin(origins = ["*"])
@Tag(name = "Car Offer", description = "Car offering management operations")
class CarOfferController(
    private val carOfferService: CarOfferService,
) {
    private val logger = LoggerFactory.getLogger(javaClass)

    @GetMapping("/available")
    @Operation(summary = "Get all available car offers")
    fun getAllAvailableCarOffers(): ResponseEntity<List<CarOfferResponse>> {
        logger.debug("GET /api/offer/available - Request received")

        return try {
            val carOffers = carOfferService.findAvailableCarOffers()
            logger.info("GET /api/offer/available - Retrieved {} available car offers", carOffers.size)
            ResponseEntity.ok(carOffers.map { CarOfferResponse.fromEntity(it) })
        } catch (ex: Exception) {
            logger.error("GET /api/offer/available - Unexpected error", ex)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }

    @GetMapping("/dealership/{dealershipId}")
    @Operation(summary = "Get all offers by dealership")
    fun getAllCarOffersPerDealership(
        @PathVariable dealershipId: Long,
    ): ResponseEntity<List<CarOfferResponse>> {
        logger.debug("GET /api/offer/dealership/{} - Request received", dealershipId)

        return try {
            val carOffers = carOfferService.findByDealershipId(dealershipId)
            logger.info("GET /api/offer/dealership/{} - Retrieved {} car offers", dealershipId, carOffers.size)
            ResponseEntity.ok(carOffers.map { CarOfferResponse.fromEntity(it) })
        } catch (ex: Exception) {
            logger.error("GET /api/offer/dealership/{} - Unexpected error", dealershipId, ex)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a specific car offer by its ID")
    fun getCarOfferById(
        @PathVariable id: Long,
    ): ResponseEntity<CarOfferResponse> {
        logger.debug("GET /api/offer/{} - Request received", id)

        return try {
            val carOffer = carOfferService.findById(id)
            logger.info("GET /api/offer/{} - Car offer found with price: {}", id, carOffer.price)
            ResponseEntity.ok(CarOfferResponse.fromEntity(carOffer))
        } catch (ex: NoSuchElementException) {
            logger.warn("GET /api/offer/{} - Car offer not found", id)
            ResponseEntity.notFound().build()
        } catch (ex: Exception) {
            logger.error("GET /api/offer/{} - Unexpected error", id, ex)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }

    @PostMapping
    @Operation(summary = "Offer a car in a dealership")
    fun createCarOffer(
        @Valid @RequestBody request: CarOfferCreateRequest,
    ): ResponseEntity<CarOfferResponse> {
        logger.info("POST /api/offer - Creation request for car ID: {} and dealership ID: {}", request.carId, request.dealershipId)

        return try {
            val carOffer = carOfferService.createCarOffer(request)
            logger.info("POST /api/offer - Car offer created with ID: {}", carOffer.id)
            ResponseEntity.status(HttpStatus.CREATED).body(CarOfferResponse.fromEntity(carOffer))
        } catch (ex: IllegalArgumentException) {
            logger.warn("POST /api/offer - Validation error: {}", ex.message)
            ResponseEntity.badRequest().build()
        } catch (ex: Exception) {
            logger.error("POST /api/offer - Error creating car offer", ex)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a car offering in a dealership")
    fun deleteCarOffer(
        @PathVariable id: Long,
    ): ResponseEntity<Unit> {
        logger.info("DELETE /api/offer/{} - Deletion request received", id)

        return try {
            carOfferService.deleteCarOffer(id)
            logger.info("DELETE /api/offer/{} - Car offer deleted", id)
            ResponseEntity.noContent().build()
        } catch (ex: NoSuchElementException) {
            logger.warn("DELETE /api/offer/{} - Car offer not found", id)
            ResponseEntity.notFound().build()
        } catch (ex: Exception) {
            logger.error("DELETE /api/offer/{} - Error deleting car offer", id, ex)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a car offering in a dealership")
    fun updateCarOffer(
        @PathVariable id: Long,
        @Valid @RequestBody request: CarOfferUpdateRequest,
    ): ResponseEntity<CarOfferResponse> {
        logger.info("PUT /api/offer/{} - Update request received", id)

        return try {
            val updatedCarOffer = carOfferService.updateCarOffer(id, request.toMap())
            logger.info("PUT /api/offer/{} - Car offer updated", id)
            ResponseEntity.ok(CarOfferResponse.fromEntity(updatedCarOffer))
        } catch (ex: NoSuchElementException) {
            logger.warn("PUT /api/offer/{} - Car offer not found", id)
            ResponseEntity.notFound().build()
        } catch (ex: IllegalArgumentException) {
            logger.warn("PUT /api/offer/{} - Validation error: {}", id, ex.message)
            ResponseEntity.badRequest().build()
        } catch (ex: Exception) {
            logger.error("PUT /api/offer/{} - Error updating car offer", id, ex)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }
}
