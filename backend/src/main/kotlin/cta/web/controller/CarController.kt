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
import org.slf4j.LoggerFactory
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
    private val logger = LoggerFactory.getLogger(javaClass)

    @GetMapping
    @Operation(summary = "Get all cars")
    fun getAllCars(): ResponseEntity<List<CarResponse>> {
        logger.debug("GET /api/cars - Request received")
        val cars = carService.findAll()
        logger.info("GET /api/cars - Retrieved {} cars", cars.size)
        return ResponseEntity.ok(cars.map { CarResponse.fromEntity(it) })
    }

    @GetMapping("/{id}")
    @Operation(summary = "Search an existing car by id")
    fun getCarById(
        @PathVariable id: Long,
    ): ResponseEntity<CarResponse> {
        logger.debug("GET /api/cars/{} - Request received", id)
        val car = carService.findById(id)
        logger.info("GET /api/cars/{} - Car found: {} {}", id, car.brand, car.model)
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
        logger.info("GET /api/cars/search - Search request with filters - keyword: {}, brand: {}", keyword, brand)

        val fuelTypeEnum =
            fuelType?.let {
                try {
                    FuelType.valueOf(it.uppercase())
                } catch (e: IllegalArgumentException) {
                    logger.warn("GET /api/cars/search - Invalid fuel type: {}", it)
                    throw IllegalArgumentException("Invalid fuel type: $it. Valid values are: ${FuelType.entries.joinToString()}")
                }
            }

        val transmissionEnum =
            transmission?.let {
                try {
                    TransmissionType.valueOf(it.uppercase())
                } catch (e: IllegalArgumentException) {
                    logger.warn("GET /api/cars/search - Invalid transmission type: {}", it)
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
        logger.info("GET /api/cars/search - Search completed. Found {} cars", cars.size)
        return ResponseEntity.ok(cars.map { CarResponse.fromEntity(it) })
    }

    @PostMapping
    @Operation(summary = "Create a new car")
    fun createCar(
        @Valid @RequestBody request: CarCreateRequest,
    ): ResponseEntity<CarResponse> {
        logger.info("POST /api/cars - Creation request for car: {} {}", request.brand, request.model)
        val car = request.toEntity()
        val savedCar = carService.createCar(car)
        logger.info("POST /api/cars - Car created with ID: {}", savedCar.id)
        return ResponseEntity.status(HttpStatus.CREATED).body(CarResponse.fromEntity(savedCar))
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing car")
    fun updateCar(
        @PathVariable id: Long,
        @Valid @RequestBody request: CarUpdateRequest,
    ): ResponseEntity<CarResponse> {
        logger.info("PUT /api/cars/{} - Update request received", id)
        val updatedCar = carService.updateCar(id, request.toMap())
        logger.info("PUT /api/cars/{} - Car updated", id)
        return ResponseEntity.ok(CarResponse.fromEntity(updatedCar))
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an existing car")
    fun deleteCar(
        @PathVariable id: Long,
    ): ResponseEntity<Unit> {
        logger.info("DELETE /api/cars/{} - Deletion request received", id)
        carService.deleteCar(id)
        logger.info("DELETE /api/cars/{} - Car deleted", id)
        return ResponseEntity.noContent().build()
    }
}
