package cta.web.controller

import cta.service.CarOfferService
import cta.web.dto.CarOfferCreateRequest
import cta.web.dto.CarOfferResponse
import cta.web.dto.CarOfferUpdateRequest
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
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
    @GetMapping("/available")
    @Operation(summary = "Get all available car offers")
    fun getAllAvailableCarOffers(): ResponseEntity<List<CarOfferResponse>> {
        val carOffers = carOfferService.findAvailableCarOffers()
        return ResponseEntity.ok(carOffers.map { CarOfferResponse.fromEntity(it) })
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a specific car offer by its ID")
    fun getCarOfferById(@PathVariable id: Long): ResponseEntity<CarOfferResponse> {
        val carOffer = carOfferService.findById(id)
        return ResponseEntity.ok(CarOfferResponse.fromEntity(carOffer))
    }

    @PostMapping
    @Operation(summary = "Offer a car in a dealership")
    fun createCarOffer(
        @Valid @RequestBody request: CarOfferCreateRequest,
    ): ResponseEntity<CarOfferResponse> {
        val carOffer = carOfferService.createCarOffer(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(CarOfferResponse.fromEntity(carOffer))
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a car offering in a dealership")
    fun deleteCarOffer(
        @PathVariable id: Long,
    ): ResponseEntity<Unit> {
        carOfferService.deleteCarOffer(id)
        return ResponseEntity.noContent().build()
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a car offering in a dealership")
    fun updateCarOffer(
        @PathVariable id: Long,
        @Valid @RequestBody request: CarOfferUpdateRequest,
    ): ResponseEntity<CarOfferResponse> {
        val updatedCarOffer = carOfferService.updateCarOffer(id, request.toMap())
        return ResponseEntity.ok(CarOfferResponse.fromEntity(updatedCarOffer))
    }
}
