package cta.web.controller

import cta.service.PurchaseService
import cta.web.dto.PurchaseCreateRequest
import cta.web.dto.PurchaseResponse
import cta.web.dto.PurchaseUpdateRequest
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/purchases")
@CrossOrigin(origins = ["*"])
class PurchaseController(
    private val purchaseService: PurchaseService,
) {

    @GetMapping
    fun getAllPurchases(): ResponseEntity<List<PurchaseResponse>> {
        val allPurchases = purchaseService.findAll()
        return ResponseEntity.ok(allPurchases.map { PurchaseResponse.fromEntity(it) })
    }

    @GetMapping("/{id}")
    fun getPurchaseById(@PathVariable id: Long): ResponseEntity<PurchaseResponse> {
        val purchase = purchaseService.findById(id)
        return ResponseEntity.ok(PurchaseResponse.fromEntity(purchase))
    }

    @GetMapping("/buyer/{id}")
    fun getPurchaseByBuyerId(@PathVariable id: Long): ResponseEntity<List<PurchaseResponse>> {
        val purchases = purchaseService.findByBuyerId(id)
        return ResponseEntity.ok(purchases.map { PurchaseResponse.fromEntity(it) })
    }

    @GetMapping("/car/{id}")
    fun getPurchaseByCarId(@PathVariable id: Long): ResponseEntity<PurchaseResponse> {
        val purchase = purchaseService.findByCarId(id)
        return ResponseEntity.ok(PurchaseResponse.fromEntity(purchase))
    }

    @GetMapping("/dealership/{id}")
    fun getPurchaseByDealershipId(@PathVariable id: Long): ResponseEntity<List<PurchaseResponse>> {
        val purchases = purchaseService.findByDealershipId(id)
        return ResponseEntity.ok(purchases.map { PurchaseResponse.fromEntity(it) })
    }

    @PostMapping
    fun createPurchase(@Valid @RequestBody request: PurchaseCreateRequest): ResponseEntity<PurchaseResponse> {
        val savedPurchase = purchaseService.createPurchase(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(PurchaseResponse.fromEntity(savedPurchase))
    }

    @PutMapping("/{id}")
    fun updatePurchase(
        @PathVariable id: Long,
        @Valid @RequestBody request: PurchaseUpdateRequest
    ): ResponseEntity<PurchaseResponse> {
        val updatedPurchase = purchaseService.updatePurchase(id, request.toMap())
        return ResponseEntity.ok(PurchaseResponse.fromEntity(updatedPurchase))
    }

    @DeleteMapping("/{id}")
    fun deletePurchase(@PathVariable id: Long): ResponseEntity<Unit> {
        purchaseService.deletePurchase(id)
        return ResponseEntity.noContent().build()
    }

    @PatchMapping("/{id}/canceled")
    fun markAsCanceled(@PathVariable id: Long): ResponseEntity<PurchaseResponse> {
        val updatedPurchase = purchaseService.markAsCanceled(id)
        return ResponseEntity.ok(PurchaseResponse.fromEntity(updatedPurchase))
    }

    @PatchMapping("/{id}/pending")
    fun markAsPending(@PathVariable id: Long): ResponseEntity<PurchaseResponse> {
        val updatedPurchase = purchaseService.markAsPending(id)
        return ResponseEntity.ok(PurchaseResponse.fromEntity(updatedPurchase))
    }

    @PatchMapping("/{id}/confirmed")
    fun markAsConfirmed(@PathVariable id: Long): ResponseEntity<PurchaseResponse> {
        val updatedPurchase = purchaseService.markAsConfirmed(id)
        return ResponseEntity.ok(PurchaseResponse.fromEntity(updatedPurchase))
    }

    @PatchMapping("/{id}/delivered")
    fun markAsDelivered(@PathVariable id: Long): ResponseEntity<PurchaseResponse> {
        val updatedPurchase = purchaseService.markAsDelivered(id)
        return ResponseEntity.ok(PurchaseResponse.fromEntity(updatedPurchase))
    }
}
