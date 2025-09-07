package cta.web.controller

import cta.service.CarService
import cta.enum.FuelType
import cta.enum.TransmissionType
import cta.service.CarSearchFilters
import cta.web.dto.CarCreateRequest
import cta.web.dto.CarResponse
import cta.web.dto.CarUpdateRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.math.BigDecimal
import jakarta.validation.Valid
@RestController
@RequestMapping("/api/cars")
@CrossOrigin(origins = ["*"])
class CarController(
    private val carService: CarService
) {

    @GetMapping
    fun getAllCars(): ResponseEntity<List<CarResponse>> {
        val cars = carService.findAvailableCars()
        return ResponseEntity.ok(cars.map { CarResponse.fromEntity(it) })
    }

    @GetMapping("/{id}")
    fun getCarById(@PathVariable id: Long): ResponseEntity<CarResponse> {
        return try {
            val car = carService.findById(id)
            ResponseEntity.ok(CarResponse.fromEntity(car))
        } catch (e: NoSuchElementException) {
            ResponseEntity.notFound().build()
        }
    }

    @GetMapping("/search")
    fun searchCars(
        @RequestParam(required = false) keyword: String?,
        @RequestParam(required = false) minPrice: BigDecimal?,
        @RequestParam(required = false) maxPrice: BigDecimal?,
        @RequestParam(required = false) minYear: Int?,
        @RequestParam(required = false) maxYear: Int?,
        @RequestParam(required = false) brand: String?,
        @RequestParam(required = false) fuelType: String?,
        @RequestParam(required = false) transmission: String?
    ): ResponseEntity<Any> {
        return try {
            val fuelTypeEnum = fuelType?.let {
                try {
                    FuelType.valueOf(it.uppercase())
                } catch (e: IllegalArgumentException) {
                    return ResponseEntity.badRequest().body(mapOf(
                        "error" to "Invalid fuel type: $it. Valid values are: ${FuelType.entries.joinToString()}"
                    ))
                }
            }

            val transmissionEnum = transmission?.let {
                try {
                    TransmissionType.valueOf(it.uppercase())
                } catch (e: IllegalArgumentException) {
                    return ResponseEntity.badRequest().body(mapOf(
                        "error" to "Invalid transmission type: $it. Valid values are: ${TransmissionType.entries.joinToString()}"
                    ))
                }
            }

            val filters = CarSearchFilters(
                keyword = keyword,
                minPrice = minPrice,
                maxPrice = maxPrice,
                minYear = minYear,
                maxYear = maxYear,
                brand = brand,
                fuelType = fuelTypeEnum,
                transmission = transmissionEnum
            )

            val cars = carService.searchCars(filters)
            ResponseEntity.ok(cars.map { CarResponse.fromEntity(it) })

        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf(
                "error" to "Search failed",
                "message" to (e.message ?: "Unknown error"),
                "timestamp" to java.time.LocalDateTime.now()
            ))
        }
    }

    @GetMapping("/dealership/{dealershipId}")
    fun getCarsByDealership(@PathVariable dealershipId: Long): ResponseEntity<List<CarResponse>> {
        val cars = carService.findByDealership(dealershipId)
        return ResponseEntity.ok(cars.map { CarResponse.fromEntity(it) })
    }

    @PostMapping
    fun createCar(@Valid @RequestBody request: CarCreateRequest): ResponseEntity<CarResponse> {
        return try {
            val car = request.toEntity()
            val savedCar = carService.createCar(car)
            ResponseEntity.status(HttpStatus.CREATED).body(CarResponse.fromEntity(savedCar))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @PutMapping("/{id}")
    fun updateCar(
        @PathVariable id: Long,
        @Valid @RequestBody request: CarUpdateRequest
    ): ResponseEntity<CarResponse> {
        return try {
            val updatedCar = carService.updateCar(id, request.toMap())
            ResponseEntity.ok(CarResponse.fromEntity(updatedCar))
        } catch (e: NoSuchElementException) {
            ResponseEntity.notFound().build()
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @PatchMapping("/{id}/price")
    fun updatePrice(
        @PathVariable id: Long,
        @RequestParam price: BigDecimal
    ): ResponseEntity<CarResponse> {
        return try {
            val updatedCar = carService.updatePrice(id, price)
            ResponseEntity.ok(CarResponse.fromEntity(updatedCar))
        } catch (e: NoSuchElementException) {
            ResponseEntity.notFound().build()
        }
    }

    @PatchMapping("/{id}/sold")
    fun markAsSold(@PathVariable id: Long): ResponseEntity<CarResponse> {
        return try {
            val updatedCar = carService.markAsSold(id)
            ResponseEntity.ok(CarResponse.fromEntity(updatedCar))
        } catch (e: NoSuchElementException) {
            ResponseEntity.notFound().build()
        }
    }

    @PatchMapping("/{id}/available")
    fun markAsAvailable(@PathVariable id: Long): ResponseEntity<CarResponse> {
        return try {
            val updatedCar = carService.markAsAvailable(id)
            ResponseEntity.ok(CarResponse.fromEntity(updatedCar))
        } catch (e: NoSuchElementException) {
            ResponseEntity.notFound().build()
        }
    }

    @DeleteMapping("/{id}")
    fun deleteCar(@PathVariable id: Long): ResponseEntity<Unit> {
        return try {
            carService.deleteCar(id)
            ResponseEntity.noContent().build()
        } catch (e: NoSuchElementException) {
            ResponseEntity.notFound().build()
        }
    }
}