package cta.web.controller

import cta.service.BuyerService
import cta.web.dto.BuyerCreateRequest
import cta.web.dto.BuyerResponse
import cta.web.dto.BuyerUpdateRequest
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/buyer")
@CrossOrigin(origins = ["*"])
@Tag(name = "Buyer", description = "Buyer management operations")
class BuyerController(
    private val buyerService: BuyerService,
) {
    @PostMapping
    @Operation(summary = "Create a new buyer")
    fun createBuyer(
        @Valid @RequestBody request: BuyerCreateRequest,
    ): ResponseEntity<BuyerResponse?> {
        val savedBuyer = buyerService.createBuyer(request.toEntity())
        return ResponseEntity.status(HttpStatus.CREATED).body(BuyerResponse.fromEntity(savedBuyer))
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing Buyer")
    fun updateBuyer(
        @PathVariable id: Long,
        @Valid @RequestBody request: BuyerUpdateRequest,
    ): ResponseEntity<BuyerResponse> {
        val updatedPurchase = buyerService.updateBuyer(id, request.toMap())
        return ResponseEntity.ok(BuyerResponse.fromEntity(updatedPurchase))
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an existing Buyer")
    fun deleteBuyer(
        @PathVariable id: Long,
    ): ResponseEntity<Unit> {
        buyerService.deleteBuyer(id)
        return ResponseEntity.noContent().build()
    }
}
