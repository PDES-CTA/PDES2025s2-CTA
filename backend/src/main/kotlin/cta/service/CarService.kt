package cta.service
import cta.enum.FuelType
import cta.enum.TransmissionType
import cta.model.Car
import cta.repository.CarRepository
import org.springframework.stereotype.Service
import java.time.LocalDate
import cta.web.dto.CarSearchFilters

@Service
class CarService(
    private val carRepository: CarRepository,
) {
    fun findById(id: Long): Car {
        return carRepository.findById(id).orElseThrow {
            NoSuchElementException("Car with ID $id not found")
        }
    }

    fun findAll(): List<Car> {
        return carRepository.findAll()
    }

    fun createCar(car: Car): Car {
        validateCar(car)
        return carRepository.save(car)
    }

    fun updateCar(
        id: Long,
        updates: Map<String, Any>,
    ): Car {
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
        return carRepository.save(car)
    }

    fun deleteCar(id: Long) {
        val car = findById(id)
        carRepository.delete(car)
    }

    fun searchCars(filters: CarSearchFilters): List<Car> {
        val allCars = carRepository.findAll()

        return allCars.filter { car ->
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
    }
}