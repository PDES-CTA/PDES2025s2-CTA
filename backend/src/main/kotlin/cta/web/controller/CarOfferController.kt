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
import org.springframework.web.bind.annotation.PatchMapping
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
        val carOffers = carOfferService.findAvailableCarOffers()
        logger.info("GET /api/offer/available - Retrieved {} available car offers", carOffers.size)
        return ResponseEntity.ok(carOffers.map { CarOfferResponse.fromEntity(it) })
    }

    @GetMapping("/dealership/{dealershipId}")
    @Operation(summary = "Get all offers by dealership")
    fun getAllCarOffersPerDealership(
        @PathVariable dealershipId: Long,
    ): ResponseEntity<List<CarOfferResponse>> {
        logger.debug("GET /api/offer/dealership/{} - Request received", dealershipId)
        val carOffers = carOfferService.findByDealershipId(dealershipId)
        logger.info("GET /api/offer/dealership/{} - Retrieved {} car offers", dealershipId, carOffers.size)
        return ResponseEntity.ok(carOffers.map { CarOfferResponse.fromEntity(it) })
    }

    @GetMapping("/dealership/{dealershipId}/available")
    @Operation(summary = "Get all available offers by dealership")
    fun getAvailableCarOffersPerDealership(
        @PathVariable dealershipId: Long,
    ): ResponseEntity<List<CarOfferResponse>> {
        logger.debug("GET /api/offer/dealership/{}/available - Request received", dealershipId)
        val carOffers = carOfferService.findByDealershipIdAndAvailableTrue(dealershipId)
        logger.info("GET /api/offer/dealership/{}/available - Retrieved {} car offers", dealershipId, carOffers.size)
        return ResponseEntity.ok(carOffers.map { CarOfferResponse.fromEntity(it) })
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a specific car offer by its ID")
    fun getCarOfferById(
        @PathVariable id: Long,
    ): ResponseEntity<CarOfferResponse> {
        logger.debug("GET /api/offer/{} - Request received", id)
        val carOffer = carOfferService.findById(id)
        logger.info("GET /api/offer/{} - Car offer found with price: {}", id, carOffer.price)
        return ResponseEntity.ok(CarOfferResponse.fromEntity(carOffer))
    }

    @PostMapping
    @Operation(summary = "Offer a car in a dealership")
    fun createCarOffer(
        @Valid @RequestBody request: CarOfferCreateRequest,
    ): ResponseEntity<CarOfferResponse> {
        logger.info("POST /api/offer - Creation request for car ID: {} and dealership ID: {}", request.carId, request.dealershipId)
        val carOffer = carOfferService.createCarOffer(request)
        logger.info("POST /api/offer - Car offer created with ID: {}", carOffer.id)
        return ResponseEntity.status(HttpStatus.CREATED).body(CarOfferResponse.fromEntity(carOffer))
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a car offering in a dealership")
    fun deleteCarOffer(
        @PathVariable id: Long,
    ): ResponseEntity<Unit> {
        logger.info("DELETE /api/offer/{} - Deletion request received", id)
        carOfferService.deleteCarOffer(id)
        logger.info("DELETE /api/offer/{} - Car offer deleted", id)
        return ResponseEntity.noContent().build()
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a car offering in a dealership")
    fun updateCarOffer(
        @PathVariable id: Long,
        @Valid @RequestBody request: CarOfferUpdateRequest,
    ): ResponseEntity<CarOfferResponse> {
        logger.info("PUT /api/offer/{} - Update request received", id)
        val updatedCarOffer = carOfferService.updateCarOffer(id, request.toMap())
        logger.info("PUT /api/offer/{} - Car offer updated", id)
        return ResponseEntity.ok(CarOfferResponse.fromEntity(updatedCarOffer))
    }

    @PatchMapping("/{id}/unavailable")
    @Operation(summary = "Mark a car offer as unavailable")
    fun markCarOfferAsUnavailable(
        @PathVariable id: Long,
    ): ResponseEntity<CarOfferResponse> {
        logger.info("PATCH /api/offer/{}/unavailable - Mark as unavailable request received", id)
        val updatedCarOffer = carOfferService.markAsUnavailable(id)
        logger.info("PATCH /api/offer/{}/unavailable - Car offer marked as unavailable", id)
        return ResponseEntity.ok(CarOfferResponse.fromEntity(updatedCarOffer))
    }
}
