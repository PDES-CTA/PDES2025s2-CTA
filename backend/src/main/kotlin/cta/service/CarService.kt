package cta.service
import cta.enum.FuelType
import cta.enum.TransmissionType
import cta.model.Car
import cta.repository.CarRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal

@Service
class CarService(
    private val carRepository: CarRepository,
) {
    fun findById(id: Long): Car {
        return carRepository.findByIdOrNull(id)
            ?: throw NoSuchElementException("Car with ID $id not found")
    }

    fun findAll(): List<Car> {
        return carRepository.findAll()
    }

    fun findAvailableCars(): List<Car> {
        return carRepository.findByAvailableTrue()
    }

    fun findByDealership(dealershipId: Long): List<Car> {
        return carRepository.findByDealershipIdAndAvailableTrue(dealershipId)
    }

    fun searchCars(filters: CarSearchFilters): List<Car> {
        var cars = carRepository.findByAvailableTrue()

        filters.keyword?.let { keyword ->
            cars =
                cars.filter { car ->
                    car.brand.contains(keyword, ignoreCase = true) ||
                        car.model.contains(keyword, ignoreCase = true) ||
                        car.description?.contains(keyword, ignoreCase = true) == true
                }
        }

        filters.minPrice?.let { min ->
            cars = cars.filter { it.price >= min }
        }

        filters.maxPrice?.let { max ->
            cars = cars.filter { it.price <= max }
        }

        filters.minYear?.let { min ->
            cars = cars.filter { it.year >= min }
        }

        filters.maxYear?.let { max ->
            cars = cars.filter { it.year <= max }
        }

        filters.brand?.let { brand ->
            cars = cars.filter { it.brand.equals(brand, ignoreCase = true) }
        }

        filters.fuelType?.let { fuelType ->
            cars = cars.filter { it.fuelType == fuelType }
        }

        filters.transmission?.let { transmission ->
            cars = cars.filter { it.transmission == transmission }
        }

        return cars.sortedByDescending { it.publicationDate }
    }

    @Transactional
    fun createCar(car: Car): Car {
        validateCar(car)
        return carRepository.save(car)
    }

    @Transactional
    fun updateCar(
        id: Long,
        updateData: Map<String, Any>,
    ): Car {
        val car = findById(id)

        updateData["brand"]?.let { car.brand = it.toString() }
        updateData["model"]?.let { car.model = it.toString() }
        updateData["year"]?.let { car.year = it.toString().toInt() }
        updateData["price"]?.let { car.price = BigDecimal(it.toString()) }
        updateData["mileage"]?.let { car.mileage = it.toString().toInt() }
        updateData["color"]?.let { car.color = it.toString() }
        updateData["description"]?.let { car.description = it.toString() }
        updateData["fuelType"]?.let {
            car.fuelType = FuelType.valueOf(it.toString().uppercase())
        }
        updateData["transmission"]?.let {
            car.transmission = TransmissionType.valueOf(it.toString().uppercase())
        }
        updateData["available"]?.let { car.available = it.toString().toBoolean() }

        validateCar(car)
        return carRepository.save(car)
    }

    @Transactional
    fun updatePrice(
        id: Long,
        newPrice: BigDecimal,
    ): Car {
        val car = findById(id)
        car.updatePrice(newPrice)
        return carRepository.save(car)
    }

    @Transactional
    fun markAsSold(id: Long): Car {
        val car = findById(id)
        car.markAsSold()
        return carRepository.save(car)
    }

    @Transactional
    fun markAsAvailable(id: Long): Car {
        val car = findById(id)
        car.available = true
        return carRepository.save(car)
    }

    @Transactional
    fun deleteCar(id: Long) {
        val car = findById(id)
        carRepository.delete(car)
    }

    private fun validateCar(car: Car) {
        require(car.brand.isNotBlank()) { "Brand cannot be empty" }
        require(car.model.isNotBlank()) { "Model cannot be empty" }
        require(car.year > 1900) { "Year must be greater than 1900" }
        require(car.year <= java.time.LocalDate.now().year + 1) { "Year cannot be in the future" }
        require(car.price > BigDecimal.ZERO) { "Price must be greater than zero" }
        require(car.mileage >= 0) { "Mileage cannot be negative" }
        require(car.color.isNotBlank()) { "Color cannot be empty" }
        require(car.dealershipId > 0) { "Valid dealership ID is required" }
    }
}
