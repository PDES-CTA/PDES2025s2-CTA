package cta.web

import cta.model.Car
import cta.enum.FuelType
import cta.enum.TransmissionType
import cta.service.CarService
import cta.web.dto.CarCreateRequest
import cta.web.dto.CarUpdateRequest
import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Test
import org.mockito.kotlin.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import java.math.BigDecimal

@SpringBootTest(properties = [
    "spring.main.allow-bean-definition-overriding=true"
])
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class CarControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @MockBean
    private lateinit var carService: CarService

    private fun createMockCar(
        id: Long = 1L,
        brand: String = "Toyota",
        model: String = "Corolla",
        year: Int = 2020,
        price: BigDecimal = BigDecimal("20000"),
        available: Boolean = true
    ): Car {
        return Car().apply {
            this.id = id
            this.brand = brand
            this.model = model
            this.year = year
            this.price = price
            this.fuelType = FuelType.GASOLINE
            this.transmission = TransmissionType.AUTOMATIC
            this.mileage = 50000
            this.color = "White"
            this.available = available
        }
    }

    @Test
    fun `should get all available cars and return 200 OK`() {
        // Given
        val cars = listOf(
            createMockCar(id = 1L, brand = "Toyota", model = "Corolla"),
            createMockCar(id = 2L, brand = "Honda", model = "Civic")
        )
        whenever(carService.findAvailableCars()).thenReturn(cars)

        // When & Then
        mockMvc.perform(get("/api/cars"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].id").value(1))
            .andExpect(jsonPath("$[0].brand").value("Toyota"))
            .andExpect(jsonPath("$[0].model").value("Corolla"))
            .andExpect(jsonPath("$[1].id").value(2))
            .andExpect(jsonPath("$[1].brand").value("Honda"))

        verify(carService).findAvailableCars()
    }

    @Test
    fun `should get empty list when no cars available`() {
        // Given
        whenever(carService.findAvailableCars()).thenReturn(emptyList())

        // When & Then
        mockMvc.perform(get("/api/cars"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$.length()").value(0))

        verify(carService).findAvailableCars()
    }

    @Test
    fun `should get car by id and return 200 OK`() {
        // Given
        val car = createMockCar(id = 1L, brand = "Toyota", model = "Corolla")
        whenever(carService.findById(1L)).thenReturn(car)

        // When & Then
        mockMvc.perform(get("/api/cars/{id}", 1L))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.brand").value("Toyota"))
            .andExpect(jsonPath("$.model").value("Corolla"))
            .andExpect(jsonPath("$.year").value(2020))
            .andExpect(jsonPath("$.price").value(20000))

        verify(carService).findById(1L)
    }

    @Test
    fun `should return 404 NOT FOUND when car does not exist`() {
        // Given
        whenever(carService.findById(999L))
            .thenThrow(NoSuchElementException("Car not found"))

        // When & Then
        mockMvc.perform(get("/api/cars/{id}", 999L))
            .andExpect(status().isNotFound)
    }

    @Test
    fun `should search cars with keyword and return 200 OK`() {
        // Given
        val cars = listOf(createMockCar(brand = "Toyota", model = "Corolla"))
        whenever(carService.searchCars(any())).thenReturn(cars)

        // When & Then
        mockMvc.perform(
            get("/api/cars/search")
                .param("keyword", "Toyota")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].brand").value("Toyota"))

        verify(carService).searchCars(any())
    }

    @Test
    fun `should search cars with price range and return 200 OK`() {
        // Given
        val cars = listOf(createMockCar(price = BigDecimal("20000")))
        whenever(carService.searchCars(any())).thenReturn(cars)

        // When & Then
        mockMvc.perform(
            get("/api/cars/search")
                .param("minPrice", "15000")
                .param("maxPrice", "25000")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$.length()").value(1))

        verify(carService).searchCars(any())
    }

    @Test
    fun `should search cars with year range and return 200 OK`() {
        // Given
        val cars = listOf(createMockCar(year = 2020))
        whenever(carService.searchCars(any())).thenReturn(cars)

        // When & Then
        mockMvc.perform(
            get("/api/cars/search")
                .param("minYear", "2018")
                .param("maxYear", "2022")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$.length()").value(1))

        verify(carService).searchCars(any())
    }

    @Test
    fun `should search cars with fuel type and return 200 OK`() {
        // Given
        val cars = listOf(createMockCar())
        whenever(carService.searchCars(any())).thenReturn(cars)

        // When & Then
        mockMvc.perform(
            get("/api/cars/search")
                .param("fuelType", "GASOLINE")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$.length()").value(1))

        verify(carService).searchCars(any())
    }

    @Test
    fun `should return 400 BAD REQUEST for invalid fuel type`() {
        // When & Then
        mockMvc.perform(
            get("/api/cars/search")
                .param("fuelType", "INVALID_FUEL")
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `should search cars with transmission type and return 200 OK`() {
        // Given
        val cars = listOf(createMockCar())
        whenever(carService.searchCars(any())).thenReturn(cars)

        // When & Then
        mockMvc.perform(
            get("/api/cars/search")
                .param("transmission", "AUTOMATIC")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$.length()").value(1))

        verify(carService).searchCars(any())
    }

    @Test
    fun `should return 400 BAD REQUEST for invalid transmission type`() {
        // When & Then
        mockMvc.perform(
            get("/api/cars/search")
                .param("transmission", "INVALID_TRANSMISSION")
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `should search cars with multiple filters and return 200 OK`() {
        // Given
        val cars = listOf(createMockCar(brand = "Toyota"))
        whenever(carService.searchCars(any())).thenReturn(cars)

        // When & Then
        mockMvc.perform(
            get("/api/cars/search")
                .param("brand", "Toyota")
                .param("minPrice", "15000")
                .param("maxPrice", "25000")
                .param("fuelType", "GASOLINE")
                .param("transmission", "AUTOMATIC")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$.length()").value(1))

        verify(carService).searchCars(any())
    }

    @Test
    fun `should get cars by dealership and return 200 OK`() {
        // Given
        val dealershipId = 1L
        val cars = listOf(
            createMockCar(id = 1L, brand = "Toyota"),
            createMockCar(id = 2L, brand = "Honda")
        )
        whenever(carService.findByDealership(dealershipId)).thenReturn(cars)

        // When & Then
        mockMvc.perform(get("/api/cars/dealership/{dealershipId}", dealershipId))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].brand").value("Toyota"))
            .andExpect(jsonPath("$[1].brand").value("Honda"))

        verify(carService).findByDealership(dealershipId)
    }

    @Test
    fun `should return empty list when dealership has no cars`() {
        // Given
        val dealershipId = 1L
        whenever(carService.findByDealership(dealershipId)).thenReturn(emptyList())

        // When & Then
        mockMvc.perform(get("/api/cars/dealership/{dealershipId}", dealershipId))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$.length()").value(0))

        verify(carService).findByDealership(dealershipId)
    }

    @Test
    fun `should create car and return 201 CREATED`() {
        // Given
        val request = CarCreateRequest(
            brand = "Toyota",
            model = "Corolla",
            year = 2020,
            price = BigDecimal("20000"),
            fuelType = FuelType.GASOLINE,
            transmission = TransmissionType.AUTOMATIC,
            mileage = 50000,
            color = "White",
            dealershipId = 1L
        )

        val savedCar = createMockCar(id = 1L)
        whenever(carService.createCar(any())).thenReturn(savedCar)

        // When & Then
        mockMvc.perform(
            post("/api/cars")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.brand").value("Toyota"))
            .andExpect(jsonPath("$.model").value("Corolla"))
            .andExpect(jsonPath("$.year").value(2020))
            .andExpect(jsonPath("$.price").value(20000))

        verify(carService).createCar(any())
    }

    @Test
    fun `should return 400 BAD REQUEST when creating car with invalid data`() {
        // Given
        val invalidRequest = """
            {
                "brand": "",
                "model": "Corolla",
                "year": 1800,
                "price": -1000
            }
        """.trimIndent()

        // When & Then
        mockMvc.perform(
            post("/api/cars")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidRequest)
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `should update car and return 200 OK`() {
        // Given
        val carId = 1L
        val request = CarUpdateRequest(
            brand = "Toyota",
            model = "Camry",
            year = 2021,
            price = BigDecimal("25000"),
            fuelType = FuelType.HYBRID,
            transmission = TransmissionType.AUTOMATIC,
            mileage = 30000,
            color = "Black"
        )

        val updatedCar = createMockCar(id = carId, brand = "Toyota", model = "Camry")
        whenever(carService.updateCar(eq(carId), any())).thenReturn(updatedCar)

        // When & Then
        mockMvc.perform(
            put("/api/cars/{id}", carId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(carId))
            .andExpect(jsonPath("$.brand").value("Toyota"))
            .andExpect(jsonPath("$.model").value("Camry"))

        verify(carService).updateCar(eq(carId), any())
    }

    @Test
    fun `should return 404 NOT FOUND when updating non-existent car`() {
        // Given
        val carId = 999L
        val request = CarUpdateRequest(
            brand = "Toyota",
            model = "Camry"
        )

        whenever(carService.updateCar(eq(carId), any()))
            .thenThrow(NoSuchElementException("Car not found"))

        // When & Then
        mockMvc.perform(
            put("/api/cars/{id}", carId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isNotFound)
    }

    @Test
    fun `should update car price and return 200 OK`() {
        // Given
        val carId = 1L
        val newPrice = BigDecimal("22000")
        val updatedCar = createMockCar(id = carId, price = newPrice)

        whenever(carService.updatePrice(carId, newPrice)).thenReturn(updatedCar)

        // When & Then
        mockMvc.perform(
            patch("/api/cars/{id}/price", carId)
                .param("price", newPrice.toString())
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(carId))
            .andExpect(jsonPath("$.price").value(22000))

        verify(carService).updatePrice(carId, newPrice)
    }

    @Test
    fun `should mark car as sold and return 200 OK`() {
        // Given
        val carId = 1L
        val soldCar = createMockCar(id = carId, available = false)

        whenever(carService.markAsSold(carId)).thenReturn(soldCar)

        // When & Then
        mockMvc.perform(patch("/api/cars/{id}/sold", carId))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(carId))
            .andExpect(jsonPath("$.available").value(false))

        verify(carService).markAsSold(carId)
    }

    @Test
    fun `should mark car as available and return 200 OK`() {
        // Given
        val carId = 1L
        val availableCar = createMockCar(id = carId, available = true)

        whenever(carService.markAsAvailable(carId)).thenReturn(availableCar)

        // When & Then
        mockMvc.perform(patch("/api/cars/{id}/available", carId))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(carId))
            .andExpect(jsonPath("$.available").value(true))

        verify(carService).markAsAvailable(carId)
    }

    @Test
    fun `should delete car and return 204 NO CONTENT`() {
        // Given
        val carId = 1L

        // When & Then
        mockMvc.perform(delete("/api/cars/{id}", carId))
            .andExpect(status().isNoContent)

        verify(carService).deleteCar(carId)
    }

    @Test
    fun `should return 404 NOT FOUND when deleting non-existent car`() {
        // Given
        val carId = 999L
        whenever(carService.deleteCar(carId))
            .thenThrow(NoSuchElementException("Car not found"))

        // When & Then
        mockMvc.perform(delete("/api/cars/{id}", carId))
            .andExpect(status().isNotFound)
    }
}