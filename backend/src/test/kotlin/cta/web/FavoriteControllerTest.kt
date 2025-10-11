package cta.web

import cta.model.Buyer
import cta.model.Car
import cta.model.FavoriteCar
import cta.enum.FuelType
import cta.enum.TransmissionType
import cta.service.FavoriteService
import cta.web.dto.FavoriteCarCreateRequest
import cta.web.dto.FavoriteCarUpdateReviewRequest
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
import java.time.LocalDateTime

@SpringBootTest(properties = [
    "spring.main.allow-bean-definition-overriding=true"
])
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class FavoriteControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @MockBean
    private lateinit var favoriteService: FavoriteService

    private fun createMockBuyer(id: Long = 1L): Buyer {
        return Buyer().apply {
            this.id = id
            this.email = "buyer@example.com"
            this.firstName = "John"
            this.lastName = "Doe"
            this.phone = "1234567890"
            this.dni = 12345678
            this.address = "123 Main St"
        }
    }

    private fun createMockCar(id: Long = 1L): Car {
        return Car().apply {
            this.id = id
            this.brand = "Toyota"
            this.model = "Corolla"
            this.year = 2020
            this.price = BigDecimal("20000")
            this.fuelType = FuelType.GASOLINE
            this.transmission = TransmissionType.AUTOMATIC
            this.mileage = 50000
            this.color = "White"
            this.available = true
        }
    }

    private fun createMockFavoriteCar(
        id: Long = 1L,
        buyer: Buyer = createMockBuyer(),
        car: Car = createMockCar(),
        comment: String? = null,
        rating: Int? = null
    ): FavoriteCar {
        return FavoriteCar().apply {
            this.id = id
            this.buyer = buyer
            this.car = car
            this.comment = comment
            this.rating = rating
            this.createdAt = LocalDateTime.now()
        }
    }

    @Test
    fun `should save favorite car and return 200 OK`() {
        // Given
        val request = FavoriteCarCreateRequest(
            buyerId = 1L,
            carId = 1L,
            dateAdded = LocalDateTime.now(),
            rating = 0,
            comment = ""
        )

        val savedFavorite = createMockFavoriteCar(id = 1L)
        whenever(favoriteService.saveFavorite(any())).thenReturn(savedFavorite)

        // When & Then
        mockMvc.perform(
            post("/api/favorite")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.buyerId").value(1))
            .andExpect(jsonPath("$.carId").value(1))
            .andExpect(jsonPath("$.dateAdded").exists())

        verify(favoriteService).saveFavorite(any())
    }

    @Test
    fun `should save favorite car with review and rating and return 200 OK`() {
        // Given
        val request = FavoriteCarCreateRequest(
            buyerId = 1L,
            carId = 1L,
            comment = "Excellent car!",
            rating = 5,
            dateAdded = LocalDateTime.now()
        )

        val savedFavorite = createMockFavoriteCar(
            id = 1L,
            comment = "Excellent car!",
            rating = 5
        )
        whenever(favoriteService.saveFavorite(any())).thenReturn(savedFavorite)

        // When & Then
        mockMvc.perform(
            post("/api/favorite")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.comment").value("Excellent car!"))
            .andExpect(jsonPath("$.rating").value(5))

        verify(favoriteService).saveFavorite(any())
    }

    @Test
    fun `should return 400 BAD REQUEST when buyerId is missing`() {
        // Given
        val invalidRequest = """
            {
                "carId": 1
            }
        """.trimIndent()

        // When & Then
        mockMvc.perform(
            post("/api/favorite")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidRequest)
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `should return 400 BAD REQUEST when carId is missing`() {
        // Given
        val invalidRequest = """
            {
                "buyerId": 1
            }
        """.trimIndent()

        // When & Then
        mockMvc.perform(
            post("/api/favorite")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidRequest)
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `should return 400 BAD REQUEST when rating is out of range`() {
        // Given
        val invalidRequest = """
            {
                "buyerId": 1,
                "carId": 1,
                "rating": 6
            }
        """.trimIndent()

        // When & Then
        mockMvc.perform(
            post("/api/favorite")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidRequest)
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `should return 404 NOT FOUND when buyer does not exist`() {
        // Given
        val request = FavoriteCarCreateRequest(
            buyerId = 999L,
            carId = 1L,
            dateAdded = LocalDateTime.now(),
            rating = 0,
            comment = ""
        )

        whenever(favoriteService.saveFavorite(any()))
            .thenThrow(NoSuchElementException("Buyer not found"))

        // When & Then
        mockMvc.perform(
            post("/api/favorite")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isNotFound)
    }

    @Test
    fun `should return 404 NOT FOUND when car does not exist`() {
        // Given
        val request = FavoriteCarCreateRequest(
            buyerId = 1L,
            carId = 999L,
            dateAdded = LocalDateTime.now(),
            rating = 0,
            comment = ""
        )

        whenever(favoriteService.saveFavorite(any()))
            .thenThrow(NoSuchElementException("Car not found"))

        // When & Then
        mockMvc.perform(
            post("/api/favorite")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isNotFound)
    }

    @Test
    fun `should delete favorite car and return 204 NO CONTENT`() {
        // Given
        val favoriteId = 1L

        // When & Then
        mockMvc.perform(delete("/api/favorite/{id}", favoriteId))
            .andExpect(status().isNoContent)

        verify(favoriteService).deleteFavoriteCar(favoriteId)
    }

    @Test
    fun `should return 404 NOT FOUND when deleting non-existent favorite`() {
        // Given
        val favoriteId = 999L
        whenever(favoriteService.deleteFavoriteCar(favoriteId))
            .thenThrow(NoSuchElementException("Favorite car not found"))

        // When & Then
        mockMvc.perform(delete("/api/favorite/{id}", favoriteId))
            .andExpect(status().isNotFound)
    }

    @Test
    fun `should update favorite car review and return 200 OK`() {
        // Given
        val favoriteId = 1L
        val request = FavoriteCarUpdateReviewRequest(
            comment = "Updated review - Great car!",
            rating = 4
        )

        val updatedFavorite = createMockFavoriteCar(
            id = favoriteId,
            comment = "Updated review - Great car!",
            rating = 4
        )
        whenever(favoriteService.updateReview(eq(favoriteId), any())).thenReturn(updatedFavorite)

        // When & Then
        mockMvc.perform(
            put("/api/favorite/{id}", favoriteId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(favoriteId))
            .andExpect(jsonPath("$.comment").value("Updated review - Great car!"))
            .andExpect(jsonPath("$.rating").value(4))

        verify(favoriteService).updateReview(eq(favoriteId), any())
    }

    @Test
    fun `should update only review and return 200 OK`() {
        // Given
        val favoriteId = 1L
        val request = FavoriteCarUpdateReviewRequest(
            comment = "Only updating review",
            rating = null
        )

        val updatedFavorite = createMockFavoriteCar(
            id = favoriteId,
            comment = "Only updating review",
            rating = null
        )
        whenever(favoriteService.updateReview(eq(favoriteId), any())).thenReturn(updatedFavorite)

        // When & Then
        mockMvc.perform(
            put("/api/favorite/{id}", favoriteId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(favoriteId))
            .andExpect(jsonPath("$.comment").value("Only updating review"))

        verify(favoriteService).updateReview(eq(favoriteId), any())
    }

    @Test
    fun `should update only rating and return 200 OK`() {
        // Given
        val favoriteId = 1L
        val request = FavoriteCarUpdateReviewRequest(
            comment = null,
            rating = 5
        )

        val updatedFavorite = createMockFavoriteCar(
            id = favoriteId,
            comment = null,
            rating = 5
        )
        whenever(favoriteService.updateReview(eq(favoriteId), any())).thenReturn(updatedFavorite)

        // When & Then
        mockMvc.perform(
            put("/api/favorite/{id}", favoriteId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(favoriteId))
            .andExpect(jsonPath("$.rating").value(5))

        verify(favoriteService).updateReview(eq(favoriteId), any())
    }

    @Test
    fun `should return 404 NOT FOUND when updating non-existent favorite`() {
        // Given
        val favoriteId = 999L
        val request = FavoriteCarUpdateReviewRequest(
            comment = "Updated review",
            rating = 4
        )

        whenever(favoriteService.updateReview(eq(favoriteId), any()))
            .thenThrow(NoSuchElementException("Favorite car not found"))

        // When & Then
        mockMvc.perform(
            put("/api/favorite/{id}", favoriteId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isNotFound)
    }

    @Test
    fun `should return 400 BAD REQUEST when updating with invalid rating`() {
        // Given
        val favoriteId = 1L
        val invalidRequest = """
            {
                "comment": "Good car",
                "rating": 100
            }
        """.trimIndent()

        // When & Then
        mockMvc.perform(
            put("/api/favorite/{id}", favoriteId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidRequest)
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `should return 400 BAD REQUEST when updating with negative rating`() {
        // Given
        val favoriteId = 1L
        val invalidRequest = """
            {
                "review": "Bad car",
                "rating": -1
            }
        """.trimIndent()

        // When & Then
        mockMvc.perform(
            put("/api/favorite/{id}", favoriteId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidRequest)
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `should return 400 BAD REQUEST when review exceeds max length`() {
        // Given
        val favoriteId = 1L
        val longReview = "a".repeat(1001) // Assuming max length is 1000
        val invalidRequest = """
            {
                "comment": "$longReview",
                "rating": 5
            }
        """.trimIndent()

        // When & Then
        mockMvc.perform(
            put("/api/favorite/{id}", favoriteId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidRequest)
        )
            .andExpect(status().isBadRequest)
    }
}