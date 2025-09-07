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
        val car = carService.findById(id)
        return ResponseEntity.ok(CarResponse.fromEntity(car))
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
    ): ResponseEntity<List<CarResponse>> {
        val fuelTypeEnum = fuelType?.let {
            try {
                FuelType.valueOf(it.uppercase())
            } catch (e: IllegalArgumentException) {
                throw IllegalArgumentException("Invalid fuel type: $it. Valid values are: ${FuelType.entries.joinToString()}")
            }
        }

        val transmissionEnum = transmission?.let {
            try {
                TransmissionType.valueOf(it.uppercase())
            } catch (e: IllegalArgumentException) {
                throw IllegalArgumentException("Invalid transmission type: $it. Valid values are: ${TransmissionType.entries.joinToString()}")
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
        return ResponseEntity.ok(cars.map { CarResponse.fromEntity(it) })
    }

    @GetMapping("/dealership/{dealershipId}")
    fun getCarsByDealership(@PathVariable dealershipId: Long): ResponseEntity<List<CarResponse>> {
        val cars = carService.findByDealership(dealershipId)
        return ResponseEntity.ok(cars.map { CarResponse.fromEntity(it) })
    }

    @PostMapping
    fun createCar(@Valid @RequestBody request: CarCreateRequest): ResponseEntity<CarResponse> {
        val car = request.toEntity()
        val savedCar = carService.createCar(car)
        return ResponseEntity.status(HttpStatus.CREATED).body(CarResponse.fromEntity(savedCar))
    }

    @PutMapping("/{id}")
    fun updateCar(
        @PathVariable id: Long,
        @Valid @RequestBody request: CarUpdateRequest
    ): ResponseEntity<CarResponse> {
        val updatedCar = carService.updateCar(id, request.toMap())
        return ResponseEntity.ok(CarResponse.fromEntity(updatedCar))
    }

    @PatchMapping("/{id}/price")
    fun updatePrice(
        @PathVariable id: Long,
        @RequestParam price: BigDecimal
    ): ResponseEntity<CarResponse> {
        val updatedCar = carService.updatePrice(id, price)
        return ResponseEntity.ok(CarResponse.fromEntity(updatedCar))
    }

    @PatchMapping("/{id}/sold")
    fun markAsSold(@PathVariable id: Long): ResponseEntity<CarResponse> {
        val updatedCar = carService.markAsSold(id)
        return ResponseEntity.ok(CarResponse.fromEntity(updatedCar))
    }

    @PatchMapping("/{id}/available")
    fun markAsAvailable(@PathVariable id: Long): ResponseEntity<CarResponse> {
        val updatedCar = carService.markAsAvailable(id)
        return ResponseEntity.ok(CarResponse.fromEntity(updatedCar))
    }

    @DeleteMapping("/{id}")
    fun deleteCar(@PathVariable id: Long): ResponseEntity<Unit> {
        carService.deleteCar(id)
        return ResponseEntity.noContent().build()
    }
}