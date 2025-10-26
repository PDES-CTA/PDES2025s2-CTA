package cta.web.controller

import com.fasterxml.jackson.databind.ObjectMapper
import cta.enum.FuelType
import cta.enum.TransmissionType
import cta.model.Car
import cta.service.CarService
import cta.web.dto.CarCreateRequest
import cta.web.dto.CarUpdateRequest
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@SpringBootTest(
    properties = [
        "spring.security.oauth2.resourceserver.jwt.issuer-uri=https://test-issuer.com",
    ],
)
@ActiveProfiles("test")
@AutoConfigureMockMvc
@WithMockUser
class CarControllerTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var carService: CarService

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    private fun createMockCar(
        id: Long = 1L,
        brand: String = "Toyota",
        model: String = "Corolla",
        year: Int = 2020,
    ): Car {
        return Car().apply {
            this.id = id
            this.brand = brand
            this.model = model
            this.year = year
            this.fuelType = FuelType.GASOLINE
            this.transmission = TransmissionType.AUTOMATIC
            this.color = "White"
            this.description = "Test car"
            this.images = mutableListOf("http://example.com/img.png")
        }
    }

    @Test
    fun `should get all cars and return 200 OK`() {
        // Given
        val cars =
            listOf(
                createMockCar(id = 1L, brand = "Toyota"),
                createMockCar(id = 2L, brand = "Honda"),
            )
        whenever(carService.findAll()).thenReturn(cars)

        // When & Then
        mockMvc.perform(get("/api/cars"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].brand").value("Toyota"))
            .andExpect(jsonPath("$[1].brand").value("Honda"))

        verify(carService).findAll()
    }

    @Test
    fun `should get car by id and return 200 OK`() {
        // Given
        val car = createMockCar(id = 1L)
        whenever(carService.findById(1L)).thenReturn(car)

        // When & Then
        mockMvc.perform(get("/api/cars/1"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.brand").value("Toyota"))
            .andExpect(jsonPath("$.model").value("Corolla"))
            .andExpect(jsonPath("$.year").value(2020))

        verify(carService).findById(1L)
    }

    @Test
    fun `should return 404 NOT FOUND when car not found by id`() {
        // Given
        whenever(carService.findById(999L)).thenThrow(NoSuchElementException("Car not found"))

        // When & Then
        mockMvc.perform(get("/api/cars/999"))
            .andExpect(status().isNotFound)
    }

    @Test
    fun `should search cars with filters and return 200 OK`() {
        // Given
        val cars = listOf(createMockCar(brand = "Toyota"))
        whenever(carService.searchCars(any())).thenReturn(cars)

        // When & Then
        mockMvc.perform(
            get("/api/cars/search")
                .param("keyword", "Toyota"),
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
                .param("minYear", "2019")
                .param("maxYear", "2021"),
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$.length()").value(1))

        verify(carService).searchCars(any())
    }

    @Test
    fun `should search cars with brand and return 200 OK`() {
        // Given
        val cars = listOf(createMockCar(brand = "Toyota"))
        whenever(carService.searchCars(any())).thenReturn(cars)

        // When & Then
        mockMvc.perform(
            get("/api/cars/search")
                .param("brand", "Toyota"),
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
                .param("fuelType", "GASOLINE"),
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$.length()").value(1))

        verify(carService).searchCars(any())
    }

    @Test
    fun `should search cars with transmission and return 200 OK`() {
        // Given
        val cars = listOf(createMockCar())
        whenever(carService.searchCars(any())).thenReturn(cars)

        // When & Then
        mockMvc.perform(
            get("/api/cars/search")
                .param("transmission", "AUTOMATIC"),
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$.length()").value(1))

        verify(carService).searchCars(any())
    }

    @Test
    fun `should return 400 BAD REQUEST when searching with invalid fuel type`() {
        // When & Then
        mockMvc.perform(
            get("/api/cars/search")
                .param("fuelType", "INVALID"),
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `should return 400 BAD REQUEST when searching with invalid transmission type`() {
        // When & Then
        mockMvc.perform(
            get("/api/cars/search")
                .param("transmission", "INVALID"),
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `should create car and return 201 CREATED`() {
        // Given
        val request =
            CarCreateRequest(
                brand = "Toyota",
                model = "Corolla",
                year = 2020,
                fuelType = FuelType.GASOLINE,
                transmission = TransmissionType.AUTOMATIC,
                color = "White",
                description = "Test",
                images = listOf("http://img.com/1.png"),
            )

        val savedCar = createMockCar(id = 1L)
        whenever(carService.createCar(any())).thenReturn(savedCar)

        // When & Then
        mockMvc.perform(
            post("/api/cars")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)),
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.brand").value("Toyota"))
            .andExpect(jsonPath("$.model").value("Corolla"))
            .andExpect(jsonPath("$.year").value(2020))

        verify(carService).createCar(any())
    }

    @Test
    fun `should return 400 BAD REQUEST when creating car with invalid data`() {
        // Given
        val request =
            CarCreateRequest(
                brand = "",
                model = "Corolla",
                year = 2020,
                fuelType = FuelType.GASOLINE,
                transmission = TransmissionType.AUTOMATIC,
                color = "White",
            )

        // When & Then
        mockMvc.perform(
            post("/api/cars")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)),
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `should update car and return 200 OK`() {
        // Given
        val carId = 1L
        val request =
            CarUpdateRequest(
                brand = "Toyota",
                model = "Camry",
                year = 2021,
                fuelType = FuelType.HYBRID,
                transmission = TransmissionType.AUTOMATIC,
                color = "Black",
                description = "Updated desc",
            )

        val updatedCar =
            createMockCar(
                id = carId,
                model = "Camry",
                year = 2021,
            )
        whenever(carService.updateCar(any(), any())).thenReturn(updatedCar)

        // When & Then
        mockMvc.perform(
            put("/api/cars/{id}", carId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)),
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(carId))
            .andExpect(jsonPath("$.model").value("Camry"))
            .andExpect(jsonPath("$.year").value(2021))

        verify(carService).updateCar(any(), any())
    }

    @Test
    fun `should return 404 NOT FOUND when updating non-existent car`() {
        // Given
        val carId = 999L
        val request = CarUpdateRequest(model = "Non-existent")
        whenever(carService.updateCar(any(), any())).thenThrow(NoSuchElementException("Car not found"))

        // When & Then
        mockMvc.perform(
            put("/api/cars/{id}", carId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)),
        )
            .andExpect(status().isNotFound)
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
}
