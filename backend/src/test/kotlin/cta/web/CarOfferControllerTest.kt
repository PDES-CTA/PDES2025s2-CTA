package cta.web.controller

import com.fasterxml.jackson.databind.ObjectMapper
import cta.model.Car
import cta.model.CarOffer
import cta.model.Dealership
import cta.service.CarOfferService
import cta.web.dto.CarOfferCreateRequest
import cta.web.dto.CarOfferUpdateRequest
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
import java.math.BigDecimal

@SpringBootTest(
    properties = [
        "spring.security.oauth2.resourceserver.jwt.issuer-uri=https://test-issuer.com",
    ],
)
@ActiveProfiles("test")
@AutoConfigureMockMvc
@WithMockUser
class CarOfferControllerTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var carOfferService: CarOfferService

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    private fun createMockCar(): Car {
        return Car().apply {
            id = 1L
            brand = "Toyota"
            model = "Corolla"
            year = 2020
        }
    }

    private fun createMockDealership(): Dealership {
        return Dealership().apply {
            id = 1L
            businessName = "Test Dealership"
            cuit = "30-12345678-9"
            email = "contact@dealership.com"
            active = true
        }
    }

    private fun createMockCarOffer(id: Long = 1L): CarOffer {
        return CarOffer().apply {
            this.id = id
            car = createMockCar()
            dealership = createMockDealership()
            price = BigDecimal("25000.00")
            dealershipNotes = "Excellent condition"
            available = true
        }
    }

    // ========== Get All Available Car Offers Tests ==========

    @Test
    fun `should get all available car offers and return 200 OK`() {
        // Given
        val carOffers =
            listOf(
                createMockCarOffer(1L),
                createMockCarOffer(2L),
            )
        whenever(carOfferService.findAvailableCarOffers()).thenReturn(carOffers)

        // When & Then
        mockMvc.perform(get("/api/offer/available"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].id").value(1L))
            .andExpect(jsonPath("$[1].id").value(2L))

        verify(carOfferService).findAvailableCarOffers()
    }

    @Test
    fun `should return empty list when no available car offers exist`() {
        // Given
        whenever(carOfferService.findAvailableCarOffers()).thenReturn(emptyList())

        // When & Then
        mockMvc.perform(get("/api/offer/available"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(0))

        verify(carOfferService).findAvailableCarOffers()
    }

    // ========== Get Car Offers by Dealership Tests ==========

    @Test
    fun `should get all car offers by dealership and return 200 OK`() {
        // Given
        val carOffers = listOf(createMockCarOffer())
        whenever(carOfferService.findByDealershipId(1L)).thenReturn(carOffers)

        // When & Then
        mockMvc.perform(get("/api/offer/dealership/1"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].dealership.id").value(1L))

        verify(carOfferService).findByDealershipId(1L)
    }

    @Test
    fun `should return empty list when dealership has no offers`() {
        // Given
        whenever(carOfferService.findByDealershipId(1L)).thenReturn(emptyList())

        // When & Then
        mockMvc.perform(get("/api/offer/dealership/1"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(0))

        verify(carOfferService).findByDealershipId(1L)
    }

    // ========== Get Car Offer by ID Tests ==========

    @Test
    fun `should get car offer by id and return 200 OK`() {
        // Given
        val carOffer = createMockCarOffer()
        whenever(carOfferService.findById(1L)).thenReturn(carOffer)

        // When & Then
        mockMvc.perform(get("/api/offer/1"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(1L))
            .andExpect(jsonPath("$.price").value(25000.00))

        verify(carOfferService).findById(1L)
    }

    @Test
    fun `should return 404 NOT FOUND when car offer not found by id`() {
        // Given
        whenever(carOfferService.findById(999L)).thenThrow(NoSuchElementException("Car offer not found"))

        // When & Then
        mockMvc.perform(get("/api/offer/999"))
            .andExpect(status().isNotFound)
    }

    // ========== Create Car Offer Tests ==========

    @Test
    fun `should create car offer and return 201 CREATED`() {
        // Given
        val request =
            CarOfferCreateRequest(
                carId = 1L,
                dealershipId = 1L,
                price = BigDecimal("25000.00"),
                dealershipNotes = "Excellent condition",
            )
        val createdCarOffer = createMockCarOffer()
        whenever(carOfferService.createCarOffer(any())).thenReturn(createdCarOffer)

        // When & Then
        mockMvc.perform(
            post("/api/offer")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)),
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.id").value(1L))
            .andExpect(jsonPath("$.price").value(25000.00))

        verify(carOfferService).createCarOffer(any())
    }

    @Test
    fun `should return 400 BAD REQUEST when creating car offer with zero price`() {
        // Given
        val request =
            CarOfferCreateRequest(
                carId = 1L,
                dealershipId = 1L,
                price = BigDecimal.ZERO,
                dealershipNotes = "Test",
            )

        // When & Then
        mockMvc.perform(
            post("/api/offer")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)),
        )
            .andExpect(status().isBadRequest)

        verify(carOfferService, never()).createCarOffer(any())
    }

    @Test
    fun `should return 400 BAD REQUEST when creating car offer with negative price`() {
        // Given
        val request =
            CarOfferCreateRequest(
                carId = 1L,
                dealershipId = 1L,
                price = BigDecimal("-100.00"),
                dealershipNotes = "Test",
            )

        // When & Then
        mockMvc.perform(
            post("/api/offer")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)),
        )
            .andExpect(status().isBadRequest)

        verify(carOfferService, never()).createCarOffer(any())
    }

    @Test
    fun `should return 400 BAD REQUEST when creating car offer with zero car ID`() {
        // Given
        val request =
            CarOfferCreateRequest(
                carId = 0L,
                dealershipId = 1L,
                price = BigDecimal("25000.00"),
                dealershipNotes = "Test",
            )

        // When & Then
        mockMvc.perform(
            post("/api/offer")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)),
        )
            .andExpect(status().isBadRequest)

        verify(carOfferService, never()).createCarOffer(any())
    }

    @Test
    fun `should return 400 BAD REQUEST when creating car offer with negative dealership ID`() {
        // Given
        val request =
            CarOfferCreateRequest(
                carId = 1L,
                dealershipId = -1L,
                price = BigDecimal("25000.00"),
                dealershipNotes = "Test",
            )

        // When & Then
        mockMvc.perform(
            post("/api/offer")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)),
        )
            .andExpect(status().isBadRequest)

        verify(carOfferService, never()).createCarOffer(any())
    }

    // ========== Update Car Offer Tests ==========

    @Test
    fun `should update car offer and return 200 OK`() {
        // Given
        val request =
            CarOfferUpdateRequest(
                price = BigDecimal("30000.00"),
                dealershipNotes = "Updated notes",
            )
        val updatedCarOffer =
            createMockCarOffer().apply {
                price = BigDecimal("30000.00")
                dealershipNotes = "Updated notes"
            }
        whenever(carOfferService.updateCarOffer(any(), any())).thenReturn(updatedCarOffer)

        // When & Then
        mockMvc.perform(
            put("/api/offer/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)),
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(1L))
            .andExpect(jsonPath("$.price").value(30000.00))

        verify(carOfferService).updateCarOffer(any(), any())
    }

    @Test
    fun `should return 400 BAD REQUEST when updating car offer with zero price`() {
        // Given
        val request =
            CarOfferUpdateRequest(
                price = BigDecimal.ZERO,
                dealershipNotes = "Updated",
            )

        // When & Then
        mockMvc.perform(
            put("/api/offer/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)),
        )
            .andExpect(status().isBadRequest)

        verify(carOfferService, never()).updateCarOffer(any(), any())
    }

    @Test
    fun `should return 400 BAD REQUEST when updating car offer with negative price`() {
        // Given
        val request =
            CarOfferUpdateRequest(
                price = BigDecimal("-100.00"),
                dealershipNotes = "Updated",
            )

        // When & Then
        mockMvc.perform(
            put("/api/offer/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)),
        )
            .andExpect(status().isBadRequest)

        verify(carOfferService, never()).updateCarOffer(any(), any())
    }

    @Test
    fun `should return 404 NOT FOUND when updating non-existent car offer`() {
        // Given
        val request =
            CarOfferUpdateRequest(
                price = BigDecimal("30000.00"),
                dealershipNotes = "Updated",
            )
        whenever(carOfferService.updateCarOffer(any(), any()))
            .thenThrow(NoSuchElementException("Car offer not found"))

        // When & Then
        mockMvc.perform(
            put("/api/offer/999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)),
        )
            .andExpect(status().isNotFound)
    }

    // ========== Delete Car Offer Tests ==========

    @Test
    fun `should delete car offer and return 204 NO CONTENT`() {
        // Given
        doNothing().whenever(carOfferService).deleteCarOffer(1L)

        // When & Then
        mockMvc.perform(delete("/api/offer/1"))
            .andExpect(status().isNoContent)

        verify(carOfferService).deleteCarOffer(1L)
    }

    @Test
    fun `should return 404 NOT FOUND when deleting non-existent car offer`() {
        // Given
        whenever(carOfferService.deleteCarOffer(999L))
            .thenThrow(NoSuchElementException("Car offer not found"))

        // When & Then
        mockMvc.perform(delete("/api/offer/999"))
            .andExpect(status().isNotFound)
    }
}
