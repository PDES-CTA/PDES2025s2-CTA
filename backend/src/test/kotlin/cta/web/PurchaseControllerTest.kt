package cta.web

import cta.enum.FuelType
import cta.enum.PaymentMethod
import cta.enum.PurchaseStatus
import cta.enum.TransmissionType
import cta.model.Car
import cta.model.Dealership
import cta.model.Purchase
import cta.service.PurchaseService
import cta.web.dto.PurchaseCreateRequest
import cta.web.dto.PurchaseUpdateRequest
import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.doNothing
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.mockito.Mockito.verify
import java.math.BigDecimal
import java.time.LocalDateTime

@SpringBootTest(
    properties = [
        "spring.security.oauth2.resourceserver.jwt.issuer-uri=https://test-issuer.com",
    ],
)
@AutoConfigureMockMvc
@WithMockUser
class PurchaseControllerTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var purchaseService: PurchaseService

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    private fun createMockCar(): Car {
        return Car().apply {
            id = 1L
            this.brand = "Toyota"
            this.model = "Corolla"
            this.year = 2020
            this.fuelType = FuelType.GASOLINE
            this.transmission = TransmissionType.AUTOMATIC
            this.mileage = 50000
            this.color = "White"
            this.available = true
            this.plate = "ABC123"
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

    private fun createMockPurchase(): Purchase {
        return Purchase().apply {
            id = 1L
            buyerId = 1L
            car = createMockCar()
            dealership = createMockDealership()
            purchaseDate = LocalDateTime.now()
            finalPrice = BigDecimal("20000")
            purchaseStatus = PurchaseStatus.PENDING
            paymentMethod = PaymentMethod.CASH
        }
    }

    @Test
    fun `should get all purchases and return 200 OK`() {
        // Given
        val purchases = listOf(createMockPurchase())
        whenever(purchaseService.findAll()).thenReturn(purchases)

        // When & Then
        mockMvc.perform(get("/api/purchases"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].id").value(1L))

        verify(purchaseService).findAll()
    }

    @Test
    fun `should get purchase by id and return 200 OK`() {
        // Given
        val purchase = createMockPurchase()
        whenever(purchaseService.findById(1L)).thenReturn(purchase)

        // When & Then
        mockMvc.perform(get("/api/purchases/1"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(1L))
            .andExpect(jsonPath("$.finalPrice").value(20000))

        verify(purchaseService).findById(1L)
    }

    @Test
    fun `should return 404 NOT FOUND when purchase not found by id`() {
        // Given
        whenever(purchaseService.findById(999L)).thenThrow(NoSuchElementException("Purchase not found"))

        // When & Then
        mockMvc.perform(get("/api/purchases/999"))
            .andExpect(status().isNotFound)
    }

    @Test
    fun `should create purchase and return 200 OK`() {
        // Given
        val request = PurchaseCreateRequest(
            buyerId = 1L,
            carId = 1L,
            dealershipId = 1L,
            finalPrice = BigDecimal("20000"),
            purchaseDate = LocalDateTime.now(),
            purchaseStatus = PurchaseStatus.PENDING,
            paymentMethod = PaymentMethod.CASH,
            observations = "Test"
        )
        val createdPurchase = createMockPurchase()
        whenever(purchaseService.createPurchase(any())).thenReturn(createdPurchase)

        // When & Then
        mockMvc.perform(post("/api/purchases")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.id").value(1L))
            .andExpect(jsonPath("$.finalPrice").value(20000))

        verify(purchaseService).createPurchase(any())
    }

    @Test
    fun `should update purchase and return 200 OK`() {
        // Given
        val request = PurchaseUpdateRequest(
            finalPrice = BigDecimal("21000"),
            purchaseStatus = PurchaseStatus.CONFIRMED
        )
        val updatedPurchase = createMockPurchase().apply {
            finalPrice = BigDecimal("21000")
            purchaseStatus = PurchaseStatus.CONFIRMED
        }
        whenever(purchaseService.updatePurchase(any(), any())).thenReturn(updatedPurchase)

        // When & Then
        mockMvc.perform(put("/api/purchases/1")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(1L))
            .andExpect(jsonPath("$.finalPrice").value(21000))
            .andExpect(jsonPath("$.purchaseStatus").value("CONFIRMED"))

        verify(purchaseService).updatePurchase(any(), any())
    }

    @Test
    fun `should mark as confirmed and return 200 OK`() {
        // Given
        val updatedPurchase = createMockPurchase().apply { purchaseStatus = PurchaseStatus.CONFIRMED }
        whenever(purchaseService.markAsConfirmed(1L)).thenReturn(updatedPurchase)

        // When & Then
        mockMvc.perform(patch("/api/purchases/1/confirmed"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.purchaseStatus").value("CONFIRMED"))

        verify(purchaseService).markAsConfirmed(1L)
    }

    @Test
    fun `should delete purchase and return 204 NO CONTENT`() {
        // Given
        doNothing().whenever(purchaseService).deletePurchase(1L)

        // When & Then
        mockMvc.perform(delete("/api/purchases/1"))
            .andExpect(status().isNoContent)

        verify(purchaseService).deletePurchase(1L)
    }
}
