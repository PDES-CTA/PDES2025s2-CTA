package cta.service
import cta.enum.FuelType
import cta.enum.TransmissionType
import cta.model.Car
import cta.repository.CarRepository
import cta.web.dto.CarSearchFilters
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class CarService(
    private val carRepository: CarRepository,
) {
    private val logger = LoggerFactory.getLogger(javaClass)

    fun findById(id: Long): Car {
        logger.debug("Fetching Car with ID: {}", id)

        return carRepository.findById(id).orElseThrow {
            logger.warn("Car with ID {} not found", id)
            NoSuchElementException("Car with ID $id not found")
        }
    }

    fun findAll(): List<Car> {
        logger.debug("Fetching all cars")
        val cars = carRepository.findAll()
        logger.debug("Found {} cars", cars.size)
        return cars
    }

    @Transactional
    fun createCar(car: Car): Car {
        logger.info("Starting creation of Car with brand: {} and model: {}", car.brand, car.model)

        return try {
            validateCar(car)
            val savedCar = carRepository.save(car)
            logger.info("Car created successfully with ID: {}, brand: {}, model: {}", savedCar.id, savedCar.brand, savedCar.model)
            savedCar
        } catch (ex: IllegalArgumentException) {
            logger.warn("Validation error when creating Car: {}", ex.message)
            throw ex
        } catch (ex: Exception) {
            logger.error("Unexpected error when creating Car with brand: {}", car.brand, ex)
            throw ex
        }
    }

    @Transactional
    fun updateCar(
        id: Long,
        updates: Map<String, Any>,
    ): Car {
        logger.info("Starting update of Car with ID: {}", id)

        return try {
            val car = findById(id)

            updates.forEach { (key, value) ->
                when (key) {
                    "brand" -> car.brand = value as String
                    "model" -> car.model = value as String
                    "year" -> car.year = value as Int
                    "color" -> car.color = value as String
                    "fuelType" -> car.fuelType = FuelType.valueOf(value as String)
                    "transmission" -> car.transmission = TransmissionType.valueOf(value as String)
                    "description" -> car.description = value as String?
                    "images" -> car.images = (value as List<*>).map { it as String }.toMutableList()
                }
            }

            validateCar(car)
            val updatedCar = carRepository.save(car)
            logger.info("Car ID {} updated successfully. Changed fields: {}", id, updates.keys.joinToString(", "))

            updatedCar
        } catch (ex: IllegalArgumentException) {
            logger.warn("Validation error when updating Car {}: {}", id, ex.message)
            throw ex
        } catch (ex: Exception) {
            logger.error("Unexpected error when updating Car with ID: {}", id, ex)
            throw ex
        }
    }

    @Transactional
    fun deleteCar(id: Long) {
        logger.info("Starting deletion of Car with ID: {}", id)

        try {
            val car = findById(id)
            carRepository.delete(car)
            logger.info("Car ID {} deleted successfully", id)
        } catch (ex: Exception) {
            logger.error("Error when deleting Car with ID: {}", id, ex)
            throw ex
        }
    }

    fun searchCars(filters: CarSearchFilters): List<Car> {
        logger.info("Starting search for Cars with filters - keyword: {}, brand: {}, fuelType: {}",
            filters.keyword, filters.brand, filters.fuelType)

        val allCars = carRepository.findAll()

        val filteredCars = allCars.filter { car ->
            val keywordMatch =
                filters.keyword?.let {
                    car.brand.contains(it, ignoreCase = true) ||
                            car.model.contains(it, ignoreCase = true) ||
                            car.description?.contains(it, ignoreCase = true) ?: false
                } ?: true

            val yearMatch =
                (filters.minYear?.let { car.year >= it } ?: true) &&
                        (filters.maxYear?.let { car.year <= it } ?: true)

            val brandMatch =
                filters.brand?.let {
                    car.brand.equals(it, ignoreCase = true)
                } ?: true

            val fuelMatch = filters.fuelType?.let { it == car.fuelType } ?: true
            val transMatch = filters.transmission?.let { it == car.transmission } ?: true

            keywordMatch && yearMatch && brandMatch && fuelMatch && transMatch
        }

        logger.info("Car search completed. Found {} cars matching filters", filteredCars.size)
        return filteredCars
    }

    private fun validateCar(car: Car) {
        require(car.brand.isNotBlank()) { "Brand cannot be empty" }
        require(car.model.isNotBlank()) { "Model cannot be empty" }
        require(car.year > 1900) { "Year must be greater than 1900" }
        require(car.year <= java.time.LocalDate.now().year + 1) { "Year cannot be too far in the future" }
        require(car.color.isNotBlank()) { "Color cannot be empty" }
        require(car.description == null || car.description!!.length <= 1000) {
            "Description cannot exceed 1000 characters"
        }
        car.images.forEach {
            require(it.startsWith("http://") || it.startsWith("https://")) {
                "Image URL must start with http:// or https://"
            }
        }
        logger.debug("Car validation completed successfully")
    }
}
