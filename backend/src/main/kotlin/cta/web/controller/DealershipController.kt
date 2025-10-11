package cta.web.controller

import cta.service.DealershipSearchFilters
import cta.service.DealershipService
import cta.web.dto.DealershipCreateRequest
import cta.web.dto.DealershipResponse
import cta.web.dto.DealershipUpdateRequest
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
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
    @GetMapping
    @Operation(summary = "Get all dealerships")
    fun getAllDealerships(): ResponseEntity<List<DealershipResponse>> {
        val dealerships = dealershipService.findActive()
        return ResponseEntity.ok(dealerships.map { DealershipResponse.fromEntity(it) })
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a dealership by id")
    fun getDealershipById(
        @PathVariable id: Long,
    ): ResponseEntity<DealershipResponse> {
        val dealership = dealershipService.findById(id)
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
        val filters =
            DealershipSearchFilters(
                businessName = businessName,
                city = city,
                province = province,
                cuit = cuit,
            )

        val dealerships = dealershipService.searchDealerships(filters)
        return ResponseEntity.ok(dealerships.map { DealershipResponse.fromEntity(it) })
    }

    @GetMapping("/cuit/{cuit}")
    @Operation(summary = "Get a dealership by cuit")
    fun getDealershipByCuit(
        @PathVariable cuit: String,
    ): ResponseEntity<DealershipResponse> {
        val dealership =
            dealershipService.findByCuit(cuit)
                ?: throw NoSuchElementException("Dealership with CUIT $cuit not found")
        return ResponseEntity.ok(DealershipResponse.fromEntity(dealership))
    }

    @GetMapping("/email/{email}")
    @Operation(summary = "Get a dealership by email")
    fun getDealershipByEmail(
        @PathVariable email: String,
    ): ResponseEntity<DealershipResponse> {
        val dealership =
            dealershipService.findByEmail(email)
                ?: throw NoSuchElementException("Dealership with email $email not found")
        return ResponseEntity.ok(DealershipResponse.fromEntity(dealership))
    }

    @PostMapping
    @Operation(summary = "Create a new dealership")
    fun createDealership(
        @Valid @RequestBody request: DealershipCreateRequest,
    ): ResponseEntity<DealershipResponse> {
        val savedDealership = dealershipService.createDealership(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(DealershipResponse.fromEntity(savedDealership))
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing dealership")
    fun updateDealership(
        @PathVariable id: Long,
        @Valid @RequestBody request: DealershipUpdateRequest,
    ): ResponseEntity<DealershipResponse> {
        val updatedDealership = dealershipService.updateDealership(id, request.toMap())
        return ResponseEntity.ok(DealershipResponse.fromEntity(updatedDealership))
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate a dealership")
    fun deactivateDealership(
        @PathVariable id: Long,
    ): ResponseEntity<DealershipResponse> {
        val updatedDealership = dealershipService.deactivate(id)
        return ResponseEntity.ok(DealershipResponse.fromEntity(updatedDealership))
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activate a dealership")
    fun activateDealership(
        @PathVariable id: Long,
    ): ResponseEntity<DealershipResponse> {
        val updatedDealership = dealershipService.activate(id)
        return ResponseEntity.ok(DealershipResponse.fromEntity(updatedDealership))
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an existing dealership")
    fun deleteDealership(
        @PathVariable id: Long,
    ): ResponseEntity<Unit> {
        dealershipService.deleteDealership(id)
        return ResponseEntity.noContent().build()
    }
}
