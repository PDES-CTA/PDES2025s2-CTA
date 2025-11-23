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

        return try {
            val cars = carService.findAll()
            logger.info("GET /api/cars - Retrieved {} cars", cars.size)
            ResponseEntity.ok(cars.map { CarResponse.fromEntity(it) })
        } catch (ex: Exception) {
            logger.error("GET /api/cars - Unexpected error", ex)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Search an existing car by id")
    fun getCarById(
        @PathVariable id: Long,
    ): ResponseEntity<CarResponse> {
        logger.debug("GET /api/cars/{} - Request received", id)

        return try {
            val car = carService.findById(id)
            logger.info("GET /api/cars/{} - Car found: {} {}", id, car.brand, car.model)
            ResponseEntity.ok(CarResponse.fromEntity(car))
        } catch (ex: NoSuchElementException) {
            logger.warn("GET /api/cars/{} - Car not found", id)
            ResponseEntity.notFound().build()
        } catch (ex: Exception) {
            logger.error("GET /api/cars/{} - Unexpected error", id, ex)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
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

        return try {
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
            ResponseEntity.ok(cars.map { CarResponse.fromEntity(it) })
        } catch (ex: IllegalArgumentException) {
            logger.warn("GET /api/cars/search - Invalid parameters: {}", ex.message)
            ResponseEntity.badRequest().build()
        } catch (ex: Exception) {
            logger.error("GET /api/cars/search - Unexpected error", ex)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }

    @PostMapping
    @Operation(summary = "Create a new car")
    fun createCar(
        @Valid @RequestBody request: CarCreateRequest,
    ): ResponseEntity<CarResponse> {
        logger.info("POST /api/cars - Creation request for car: {} {}", request.brand, request.model)

        return try {
            val car = request.toEntity()
            val savedCar = carService.createCar(car)
            logger.info("POST /api/cars - Car created with ID: {}", savedCar.id)
            ResponseEntity.status(HttpStatus.CREATED).body(CarResponse.fromEntity(savedCar))
        } catch (ex: IllegalArgumentException) {
            logger.warn("POST /api/cars - Validation error: {}", ex.message)
            ResponseEntity.badRequest().build()
        } catch (ex: Exception) {
            logger.error("POST /api/cars - Error creating Car", ex)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing car")
    fun updateCar(
        @PathVariable id: Long,
        @Valid @RequestBody request: CarUpdateRequest,
    ): ResponseEntity<CarResponse> {
        logger.info("PUT /api/cars/{} - Update request received", id)

        return try {
            val updatedCar = carService.updateCar(id, request.toMap())
            logger.info("PUT /api/cars/{} - Car updated", id)
            ResponseEntity.ok(CarResponse.fromEntity(updatedCar))
        } catch (ex: NoSuchElementException) {
            logger.warn("PUT /api/cars/{} - Car not found", id)
            ResponseEntity.notFound().build()
        } catch (ex: IllegalArgumentException) {
            logger.warn("PUT /api/cars/{} - Validation error: {}", id, ex.message)
            ResponseEntity.badRequest().build()
        } catch (ex: Exception) {
            logger.error("PUT /api/cars/{} - Error updating Car", id, ex)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an existing car")
    fun deleteCar(
        @PathVariable id: Long,
    ): ResponseEntity<Unit> {
        logger.info("DELETE /api/cars/{} - Deletion request received", id)

        return try {
            carService.deleteCar(id)
            logger.info("DELETE /api/cars/{} - Car deleted", id)
            ResponseEntity.noContent().build()
        } catch (ex: NoSuchElementException) {
            logger.warn("DELETE /api/cars/{} - Car not found", id)
            ResponseEntity.notFound().build()
        } catch (ex: Exception) {
            logger.error("DELETE /api/cars/{} - Error deleting Car", id, ex)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }
}
