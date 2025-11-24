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

        return try {
            val dealerships = dealershipService.findActive()
            logger.info("GET /api/dealerships - Retrieved {} dealerships", dealerships.size)
            ResponseEntity.ok(dealerships.map { DealershipResponse.fromEntity(it) })
        } catch (ex: Exception) {
            logger.error("GET /api/dealerships - Unexpected error", ex)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a dealership by id")
    fun getDealershipById(
        @PathVariable id: Long,
    ): ResponseEntity<DealershipResponse> {
        logger.debug("GET /api/dealerships/{} - Request received", id)

        return try {
            val dealership = dealershipService.findById(id)
            logger.info("GET /api/dealerships/{} - Dealership found: {}", id, dealership.businessName)
            ResponseEntity.ok(DealershipResponse.fromEntity(dealership))
        } catch (ex: NoSuchElementException) {
            logger.warn("GET /api/dealerships/{} - Dealership not found", id)
            ResponseEntity.notFound().build()
        } catch (ex: Exception) {
            logger.error("GET /api/dealerships/{} - Unexpected error", id, ex)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
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

        return try {
            val filters =
                DealershipSearchFilters(
                    businessName = businessName,
                    city = city,
                    province = province,
                    cuit = cuit,
                )

            val dealerships = dealershipService.searchDealerships(filters)
            logger.info("GET /api/dealerships/search - Search completed. Found {} dealerships", dealerships.size)
            ResponseEntity.ok(dealerships.map { DealershipResponse.fromEntity(it) })
        } catch (ex: IllegalArgumentException) {
            logger.warn("GET /api/dealerships/search - Invalid parameters: {}", ex.message)
            ResponseEntity.badRequest().build()
        } catch (ex: Exception) {
            logger.error("GET /api/dealerships/search - Unexpected error", ex)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }

    @GetMapping("/cuit/{cuit}")
    @Operation(summary = "Get a dealership by cuit")
    fun getDealershipByCuit(
        @PathVariable cuit: String,
    ): ResponseEntity<DealershipResponse> {
        logger.debug("GET /api/dealerships/cuit/{} - Request received", cuit)

        return try {
            val dealership =
                dealershipService.findByCuit(cuit)
                    ?: return run {
                        logger.warn("GET /api/dealerships/cuit/{} - Dealership not found", cuit)
                        ResponseEntity.notFound().build()
                    }
            logger.info("GET /api/dealerships/cuit/{} - Dealership found: {}", cuit, dealership.businessName)
            ResponseEntity.ok(DealershipResponse.fromEntity(dealership))
        } catch (ex: Exception) {
            logger.error("GET /api/dealerships/cuit/{} - Unexpected error", cuit, ex)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }

    @GetMapping("/email/{email}")
    @Operation(summary = "Get a dealership by email")
    fun getDealershipByEmail(
        @PathVariable email: String,
    ): ResponseEntity<DealershipResponse> {
        logger.debug("GET /api/dealerships/email/{} - Request received", email)

        return try {
            val dealership =
                dealershipService.findByEmail(email)
                    ?: return run {
                        logger.warn("GET /api/dealerships/email/{} - Dealership not found", email)
                        ResponseEntity.notFound().build()
                    }
            logger.info("GET /api/dealerships/email/{} - Dealership found: {}", email, dealership.businessName)
            ResponseEntity.ok(DealershipResponse.fromEntity(dealership))
        } catch (ex: Exception) {
            logger.error("GET /api/dealerships/email/{} - Unexpected error", email, ex)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }

    @PostMapping
    @Operation(summary = "Create a new dealership")
    fun createDealership(
        @Valid @RequestBody request: DealershipCreateRequest,
    ): ResponseEntity<DealershipResponse> {
        logger.info("POST /api/dealerships - Creation request for dealership: {} with CUIT: {}", request.businessName, request.cuit)

        return try {
            val savedDealership = dealershipService.createDealership(request)
            logger.info("POST /api/dealerships - Dealership created with ID: {}", savedDealership.id)
            ResponseEntity.status(HttpStatus.CREATED).body(DealershipResponse.fromEntity(savedDealership))
        } catch (ex: IllegalArgumentException) {
            logger.warn("POST /api/dealerships - Validation error: {}", ex.message)
            ResponseEntity.badRequest().build()
        } catch (ex: Exception) {
            logger.error("POST /api/dealerships - Error creating Dealership", ex)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing dealership")
    fun updateDealership(
        @PathVariable id: Long,
        @Valid @RequestBody request: DealershipUpdateRequest,
    ): ResponseEntity<DealershipResponse> {
        logger.info("PUT /api/dealerships/{} - Update request received", id)

        return try {
            val updatedDealership = dealershipService.updateDealership(id, request.toMap())
            logger.info("PUT /api/dealerships/{} - Dealership updated", id)
            ResponseEntity.ok(DealershipResponse.fromEntity(updatedDealership))
        } catch (ex: NoSuchElementException) {
            logger.warn("PUT /api/dealerships/{} - Dealership not found", id)
            ResponseEntity.notFound().build()
        } catch (ex: IllegalArgumentException) {
            logger.warn("PUT /api/dealerships/{} - Validation error: {}", id, ex.message)
            ResponseEntity.badRequest().build()
        } catch (ex: Exception) {
            logger.error("PUT /api/dealerships/{} - Error updating Dealership", id, ex)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate a dealership")
    fun deactivateDealership(
        @PathVariable id: Long,
    ): ResponseEntity<DealershipResponse> {
        logger.info("PATCH /api/dealerships/{}/deactivate - Deactivation request received", id)

        return try {
            val updatedDealership = dealershipService.deactivate(id)
            logger.info("PATCH /api/dealerships/{}/deactivate - Dealership deactivated", id)
            ResponseEntity.ok(DealershipResponse.fromEntity(updatedDealership))
        } catch (ex: NoSuchElementException) {
            logger.warn("PATCH /api/dealerships/{}/deactivate - Dealership not found", id)
            ResponseEntity.notFound().build()
        } catch (ex: IllegalStateException) {
            logger.warn("PATCH /api/dealerships/{}/deactivate - State error: {}", id, ex.message)
            ResponseEntity.badRequest().build()
        } catch (ex: Exception) {
            logger.error("PATCH /api/dealerships/{}/deactivate - Error deactivating Dealership", id, ex)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activate a dealership")
    fun activateDealership(
        @PathVariable id: Long,
    ): ResponseEntity<DealershipResponse> {
        logger.info("PATCH /api/dealerships/{}/activate - Activation request received", id)

        return try {
            val updatedDealership = dealershipService.activate(id)
            logger.info("PATCH /api/dealerships/{}/activate - Dealership activated", id)
            ResponseEntity.ok(DealershipResponse.fromEntity(updatedDealership))
        } catch (ex: NoSuchElementException) {
            logger.warn("PATCH /api/dealerships/{}/activate - Dealership not found", id)
            ResponseEntity.notFound().build()
        } catch (ex: IllegalStateException) {
            logger.warn("PATCH /api/dealerships/{}/activate - State error: {}", id, ex.message)
            ResponseEntity.badRequest().build()
        } catch (ex: Exception) {
            logger.error("PATCH /api/dealerships/{}/activate - Error activating Dealership", id, ex)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an existing dealership")
    fun deleteDealership(
        @PathVariable id: Long,
    ): ResponseEntity<Unit> {
        logger.info("DELETE /api/dealerships/{} - Deletion request received", id)

        return try {
            dealershipService.deleteDealership(id)
            logger.info("DELETE /api/dealerships/{} - Dealership deleted", id)
            ResponseEntity.noContent().build()
        } catch (ex: NoSuchElementException) {
            logger.warn("DELETE /api/dealerships/{} - Dealership not found", id)
            ResponseEntity.notFound().build()
        } catch (ex: Exception) {
            logger.error("DELETE /api/dealerships/{} - Error deleting Dealership", id, ex)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }
}
