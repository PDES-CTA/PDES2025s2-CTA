package cta.web.controller

import com.fasterxml.jackson.databind.ObjectMapper
import cta.enum.FuelType
import cta.enum.TransmissionType
import cta.model.Buyer
import cta.model.Car
import cta.model.FavoriteCar
import cta.service.FavoriteService
import cta.web.dto.FavoriteCarCreateRequest
import cta.web.dto.FavoriteCarUpdateReviewRequest
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.doNothing
import org.mockito.kotlin.never
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
import java.time.LocalDateTime

@SpringBootTest(
    properties = [
        "spring.security.oauth2.resourceserver.jwt.issuer-uri=https://test-issuer.com",
    ],
)
@ActiveProfiles("test")
@AutoConfigureMockMvc
@WithMockUser
class FavoriteControllerTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var favoriteService: FavoriteService

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    private fun createMockBuyer(): Buyer {
        return Buyer().apply {
            id = 1L
            firstName = "John"
            lastName = "Doe"
            email = "john@example.com"
            phone = "123456789"
        }
    }

    private fun createMockCar(): Car {
        return Car().apply {
            id = 1L
            brand = "Toyota"
            model = "Corolla"
            year = 2020
            fuelType = FuelType.GASOLINE
            transmission = TransmissionType.AUTOMATIC
            color = "White"
        }
    }

    private fun createMockFavoriteCar(): FavoriteCar {
        return FavoriteCar().apply {
            id = 1L
            car = createMockCar()
            buyer = createMockBuyer()
            dateAdded = LocalDateTime.now()
            rating = 5
            comment = "Great car"
            priceNotifications = true
        }
    }

    @Test
    fun `should get favorite by id and return 200 OK`() {
        // Given
        val favoriteCar = createMockFavoriteCar()
        whenever(favoriteService.findById(1L)).thenReturn(favoriteCar)

        // When & Then
        mockMvc.perform(get("/api/favorite/1"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(1L))
            .andExpect(jsonPath("$.car.id").value(1L))
            .andExpect(jsonPath("$.buyer.id").value(1L))
            .andExpect(jsonPath("$.rating").value(5))
            .andExpect(jsonPath("$.comment").value("Great car"))

        verify(favoriteService).findById(1L)
    }

    @Test
    fun `should return 404 NOT FOUND when favorite car not found by id`() {
        // Given
        whenever(favoriteService.findById(999L)).thenThrow(NoSuchElementException("Favorite not found"))

        // When & Then
        mockMvc.perform(get("/api/favorite/999"))
            .andExpect(status().isNotFound)
    }

    @Test
    fun `should get favorites by buyer id and return 200 OK`() {
        // Given
        val favorites = listOf(createMockFavoriteCar())
        whenever(favoriteService.findByBuyerId(1L)).thenReturn(favorites)

        // When & Then
        mockMvc.perform(get("/api/favorite/buyer/1"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].buyer.id").value(1L))

        verify(favoriteService).findByBuyerId(1L)
    }

    @Test
    fun `should get favorites by car id and return 200 OK`() {
        // Given
        val favorites = listOf(createMockFavoriteCar())
        whenever(favoriteService.findByCarId(1L)).thenReturn(favorites)

        // When & Then
        mockMvc.perform(get("/api/favorite/car/1"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].car.id").value(1L))

        verify(favoriteService).findByCarId(1L)
    }

    @Test
    fun `should create favorite car and return 200 OK`() {
        // Given
        val request =
            FavoriteCarCreateRequest(
                buyerId = 1L,
                carId = 1L,
                rating = 5,
                comment = "Great car",
                dateAdded = LocalDateTime.now(),
                priceNotifications = true,
            )
        val createdFavorite = createMockFavoriteCar()
        whenever(favoriteService.saveFavorite(any())).thenReturn(createdFavorite)

        // When & Then
        mockMvc.perform(
            post("/api/favorite")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)),
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(1L))
            .andExpect(jsonPath("$.comment").value("Great car"))
            .andExpect(jsonPath("$.rating").value(5))

        verify(favoriteService).saveFavorite(any())
    }

    @Test
    fun `should return 400 BAD REQUEST when creating favorite with invalid rating`() {
        // Given
        val request =
            FavoriteCarCreateRequest(
                buyerId = 1L,
                carId = 1L,
                rating = 100,
                comment = "Great car",
                dateAdded = LocalDateTime.now(),
                priceNotifications = true,
            )

        // When & Then
        mockMvc.perform(
            post("/api/favorite")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)),
        )
            .andExpect(status().isBadRequest)

        // Verify service was never called due to validation failure
        verify(favoriteService, never()).saveFavorite(any())
    }

    @Test
    fun `should update review and return 200 OK`() {
        // Given
        val request =
            FavoriteCarUpdateReviewRequest(
                rating = 4,
                comment = "Updated review",
            )
        val updatedFavorite =
            createMockFavoriteCar().apply {
                rating = 4
                comment = "Updated review"
            }
        whenever(favoriteService.updateReview(1L, 4, "Updated review")).thenReturn(updatedFavorite)

        // When & Then
        mockMvc.perform(
            put("/api/favorite/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)),
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(1L))
            .andExpect(jsonPath("$.rating").value(4))
            .andExpect(jsonPath("$.comment").value("Updated review"))

        verify(favoriteService).updateReview(1L, 4, "Updated review")
    }

    @Test
    fun `should return 404 NOT FOUND when updating non-existent favorite`() {
        // Given
        val request =
            FavoriteCarUpdateReviewRequest(
                rating = 4,
                comment = "Updated review",
            )
        whenever(favoriteService.updateReview(999L, 4, "Updated review"))
            .thenThrow(NoSuchElementException("Favorite not found"))

        // When & Then
        mockMvc.perform(
            put("/api/favorite/999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)),
        )
            .andExpect(status().isNotFound)
    }

    @Test
    fun `should delete favorite car and return 204 NO CONTENT`() {
        // Given
        doNothing().whenever(favoriteService).deleteFavoriteCar(1L)

        // When & Then
        mockMvc.perform(delete("/api/favorite/1"))
            .andExpect(status().isNoContent)

        verify(favoriteService).deleteFavoriteCar(1L)
    }

    @Test
    fun `should return 404 NOT FOUND when deleting non-existent favorite`() {
        // Given
        whenever(favoriteService.deleteFavoriteCar(999L))
            .thenThrow(NoSuchElementException("Favorite not found"))

        // When & Then
        mockMvc.perform(delete("/api/favorite/999"))
            .andExpect(status().isNotFound)
    }
}
