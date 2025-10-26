package cta.web.controller

import cta.enum.FuelType
import cta.enum.TransmissionType
import cta.service.CarService
import cta.web.dto.CarCreateRequest
import cta.web.dto.CarResponse
import cta.web.dto.CarSearchFilters
import cta.web.dto.CarUpdateRequest
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
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/cars")
@CrossOrigin(origins = ["*"])
@Tag(name = "Cars", description = "Car management operations")
class CarController(
    private val carService: CarService,
) {
    @GetMapping
    @Operation(summary = "Get all cars")
    fun getAllCars(): ResponseEntity<List<CarResponse>> {
        val cars = carService.findAll()
        return ResponseEntity.ok(cars.map { CarResponse.fromEntity(it) })
    }

    @GetMapping("/{id}")
    @Operation(summary = "Search an existing car by id")
    fun getCarById(
        @PathVariable id: Long,
    ): ResponseEntity<CarResponse> {
        val car = carService.findById(id)
        return ResponseEntity.ok(CarResponse.fromEntity(car))
    }

    @GetMapping("/search")
    @Operation(summary = "Search cars using filters")
    fun searchCars(
        @RequestParam(required = false) keyword: String?,
        @RequestParam(required = false) minYear: Int?,
        @RequestParam(required = false) maxYear: Int?,
        @RequestParam(required = false) brand: String?,
        @RequestParam(required = false) fuelType: String?,
        @RequestParam(required = false) transmission: String?,
    ): ResponseEntity<List<CarResponse>> {
        val fuelTypeEnum =
            fuelType?.let {
                try {
                    FuelType.valueOf(it.uppercase())
                } catch (e: IllegalArgumentException) {
                    throw IllegalArgumentException("Invalid fuel type: $it. Valid values are: ${FuelType.entries.joinToString()}")
                }
            }

        val transmissionEnum =
            transmission?.let {
                try {
                    TransmissionType.valueOf(it.uppercase())
                } catch (e: IllegalArgumentException) {
                    throw IllegalArgumentException(
                        "Invalid transmission type: $it. Valid values are: ${TransmissionType.entries.joinToString()}",
                    )
                }
            }

        val filters =
            CarSearchFilters(
                keyword = keyword,
                minYear = minYear,
                maxYear = maxYear,
                brand = brand,
                fuelType = fuelTypeEnum,
                transmission = transmissionEnum,
            )

        val cars = carService.searchCars(filters)
        return ResponseEntity.ok(cars.map { CarResponse.fromEntity(it) })
    }

    @PostMapping
    @Operation(summary = "Create a new car")
    fun createCar(
        @Valid @RequestBody request: CarCreateRequest,
    ): ResponseEntity<CarResponse> {
        val car = request.toEntity()
        val savedCar = carService.createCar(car)
        return ResponseEntity.status(HttpStatus.CREATED).body(CarResponse.fromEntity(savedCar))
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing car")
    fun updateCar(
        @PathVariable id: Long,
        @Valid @RequestBody request: CarUpdateRequest,
    ): ResponseEntity<CarResponse> {
        val updatedCar = carService.updateCar(id, request.toMap())
        return ResponseEntity.ok(CarResponse.fromEntity(updatedCar))
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an existing car")
    fun deleteCar(
        @PathVariable id: Long,
    ): ResponseEntity<Unit> {
        carService.deleteCar(id)
        return ResponseEntity.noContent().build()
    }
}
