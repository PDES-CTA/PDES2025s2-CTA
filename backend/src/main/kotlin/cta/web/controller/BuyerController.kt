package cta.web.controller

import cta.service.BuyerService
import cta.web.dto.BuyerCreateRequest
import cta.web.dto.BuyerResponse
import cta.web.dto.BuyerUpdateRequest
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.slf4j.LoggerFactory
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
    private val logger = LoggerFactory.getLogger(javaClass)

    @PostMapping
    @Operation(summary = "Create a new buyer")
    fun createBuyer(
        @Valid @RequestBody request: BuyerCreateRequest,
    ): ResponseEntity<BuyerResponse?> {
        logger.info("POST /api/buyer - Creation request for buyer: {} {}", request.firstName, request.lastName)

        return try {
            val savedBuyer = buyerService.createBuyer(request.toEntity())
            logger.info("POST /api/buyer - Buyer created with ID: {}", savedBuyer.id)
            ResponseEntity.status(HttpStatus.CREATED).body(BuyerResponse.fromEntity(savedBuyer))
        } catch (ex: IllegalArgumentException) {
            logger.warn("POST /api/buyer - Validation error: {}", ex.message)
            ResponseEntity.badRequest().build()
        } catch (ex: Exception) {
            logger.error("POST /api/buyer - Error creating buyer", ex)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing Buyer")
    fun updateBuyer(
        @PathVariable id: Long,
        @Valid @RequestBody request: BuyerUpdateRequest,
    ): ResponseEntity<BuyerResponse> {
        logger.info("PUT /api/buyer/{} - Update request received", id)

        return try {
            val updatedPurchase = buyerService.updateBuyer(id, request.toMap())
            logger.info("PUT /api/buyer/{} - Buyer updated", id)
            ResponseEntity.ok(BuyerResponse.fromEntity(updatedPurchase))
        } catch (ex: NoSuchElementException) {
            logger.warn("PUT /api/buyer/{} - Buyer not found", id)
            ResponseEntity.notFound().build()
        } catch (ex: IllegalArgumentException) {
            logger.warn("PUT /api/buyer/{} - Validation error: {}", id, ex.message)
            ResponseEntity.badRequest().build()
        } catch (ex: Exception) {
            logger.error("PUT /api/buyer/{} - Error updating buyer", id, ex)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an existing Buyer")
    fun deleteBuyer(
        @PathVariable id: Long,
    ): ResponseEntity<Unit> {
        logger.info("DELETE /api/buyer/{} - Deletion request received", id)

        return try {
            buyerService.deleteBuyer(id)
            logger.info("DELETE /api/buyer/{} - Buyer deleted", id)
            ResponseEntity.noContent().build()
        } catch (ex: NoSuchElementException) {
            logger.warn("DELETE /api/buyer/{} - Buyer not found", id)
            ResponseEntity.notFound().build()
        } catch (ex: Exception) {
            logger.error("DELETE /api/buyer/{} - Error deleting buyer", id, ex)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }
}
