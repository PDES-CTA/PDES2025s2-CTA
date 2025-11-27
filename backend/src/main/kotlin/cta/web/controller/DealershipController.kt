package cta.web.controller

import cta.service.DealershipSearchFilters
import cta.service.DealershipService
import cta.web.dto.DealershipCreateRequest
import cta.web.dto.DealershipResponse
import cta.web.dto.DealershipUpdateRequest
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
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/dealerships")
@CrossOrigin(origins = ["*"])
@Tag(name = "Dealership", description = "Dealership management operations")
class DealershipController(
    private val dealershipService: DealershipService,
) {
    private val logger = LoggerFactory.getLogger(javaClass)

    @GetMapping
    @Operation(summary = "Get all dealerships")
    fun getAllDealerships(): ResponseEntity<List<DealershipResponse>> {
        logger.debug("GET /api/dealerships - Request received")
        val dealerships = dealershipService.findActive()
        logger.info("GET /api/dealerships - Retrieved {} dealerships", dealerships.size)
        return ResponseEntity.ok(dealerships.map { DealershipResponse.fromEntity(it) })
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a dealership by id")
    fun getDealershipById(
        @PathVariable id: Long,
    ): ResponseEntity<DealershipResponse> {
        logger.debug("GET /api/dealerships/{} - Request received", id)
        val dealership = dealershipService.findById(id)
        logger.info("GET /api/dealerships/{} - Dealership found: {}", id, dealership.businessName)
        return ResponseEntity.ok(DealershipResponse.fromEntity(dealership))
    }

    @GetMapping("/search")
    @Operation(summary = "Search dealerships using filters")
    fun searchDealerships(
        @RequestParam(required = false) businessName: String?,
        @RequestParam(required = false) city: String?,
        @RequestParam(required = false) province: String?,
        @RequestParam(required = false) cuit: String?,
    ): ResponseEntity<List<DealershipResponse>> {
        logger.info("GET /api/dealerships/search - Search request with filters - businessName: {}, city: {}", businessName, city)

        val filters =
            DealershipSearchFilters(
                businessName = businessName,
                city = city,
                province = province,
                cuit = cuit,
            )

        val dealerships = dealershipService.searchDealerships(filters)
        logger.info("GET /api/dealerships/search - Search completed. Found {} dealerships", dealerships.size)
        return ResponseEntity.ok(dealerships.map { DealershipResponse.fromEntity(it) })
    }

    @GetMapping("/cuit/{cuit}")
    @Operation(summary = "Get a dealership by cuit")
    fun getDealershipByCuit(
        @PathVariable cuit: String,
    ): ResponseEntity<DealershipResponse> {
        logger.debug("GET /api/dealerships/cuit/{} - Request received", cuit)
        val dealership =
            dealershipService.findByCuit(cuit)
                ?: return run {
                    logger.warn("GET /api/dealerships/cuit/{} - Dealership not found", cuit)
                    ResponseEntity.notFound().build()
                }
        logger.info("GET /api/dealerships/cuit/{} - Dealership found: {}", cuit, dealership.businessName)
        return ResponseEntity.ok(DealershipResponse.fromEntity(dealership))
    }

    @GetMapping("/email/{email}")
    @Operation(summary = "Get a dealership by email")
    fun getDealershipByEmail(
        @PathVariable email: String,
    ): ResponseEntity<DealershipResponse> {
        logger.debug("GET /api/dealerships/email/{} - Request received", email)
        val dealership =
            dealershipService.findByEmail(email)
                ?: return run {
                    logger.warn("GET /api/dealerships/email/{} - Dealership not found", email)
                    ResponseEntity.notFound().build()
                }
        logger.info("GET /api/dealerships/email/{} - Dealership found: {}", email, dealership.businessName)
        return ResponseEntity.ok(DealershipResponse.fromEntity(dealership))
    }

    @PostMapping
    @Operation(summary = "Create a new dealership")
    fun createDealership(
        @Valid @RequestBody request: DealershipCreateRequest,
    ): ResponseEntity<DealershipResponse> {
        logger.info("POST /api/dealerships - Creation request for dealership: {} with CUIT: {}", request.businessName, request.cuit)
        val savedDealership = dealershipService.createDealership(request)
        logger.info("POST /api/dealerships - Dealership created with ID: {}", savedDealership.id)
        return ResponseEntity.status(HttpStatus.CREATED).body(DealershipResponse.fromEntity(savedDealership))
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing dealership")
    fun updateDealership(
        @PathVariable id: Long,
        @Valid @RequestBody request: DealershipUpdateRequest,
    ): ResponseEntity<DealershipResponse> {
        logger.info("PUT /api/dealerships/{} - Update request received", id)
        val updatedDealership = dealershipService.updateDealership(id, request.toMap())
        logger.info("PUT /api/dealerships/{} - Dealership updated", id)
        return ResponseEntity.ok(DealershipResponse.fromEntity(updatedDealership))
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate a dealership")
    fun deactivateDealership(
        @PathVariable id: Long,
    ): ResponseEntity<DealershipResponse> {
        logger.info("PATCH /api/dealerships/{}/deactivate - Deactivation request received", id)
        val updatedDealership = dealershipService.deactivate(id)
        logger.info("PATCH /api/dealerships/{}/deactivate - Dealership deactivated", id)
        return ResponseEntity.ok(DealershipResponse.fromEntity(updatedDealership))
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activate a dealership")
    fun activateDealership(
        @PathVariable id: Long,
    ): ResponseEntity<DealershipResponse> {
        logger.info("PATCH /api/dealerships/{}/activate - Activation request received", id)
        val updatedDealership = dealershipService.activate(id)
        logger.info("PATCH /api/dealerships/{}/activate - Dealership activated", id)
        return ResponseEntity.ok(DealershipResponse.fromEntity(updatedDealership))
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an existing dealership")
    fun deleteDealership(
        @PathVariable id: Long,
    ): ResponseEntity<Unit> {
        logger.info("DELETE /api/dealerships/{} - Deletion request received", id)
        dealershipService.deleteDealership(id)
        logger.info("DELETE /api/dealerships/{} - Dealership deleted", id)
        return ResponseEntity.noContent().build()
    }
}
