package cta.web.controller

import com.fasterxml.jackson.databind.ObjectMapper
import cta.enum.FuelType
import cta.enum.PaymentMethod
import cta.enum.PurchaseStatus
import cta.enum.TransmissionType
import cta.model.Buyer
import cta.model.Car
import cta.model.CarOffer
import cta.model.Dealership
import cta.model.Purchase
import cta.service.PurchaseService
import cta.web.dto.PurchaseCreateRequest
import cta.web.dto.PurchaseUpdateRequest
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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.math.BigDecimal
import java.time.LocalDateTime

@SpringBootTest(
    properties = [
        "spring.security.oauth2.resourceserver.jwt.issuer-uri=https://test-issuer.com",
    ],
)
@ActiveProfiles("test")
@AutoConfigureMockMvc
@WithMockUser
class PurchaseControllerTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var purchaseService: PurchaseService

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

    private fun createMockDealership(): Dealership {
        return Dealership().apply {
            id = 1L
            businessName = "Test Dealership"
            cuit = "30-12345678-9"
            email = "contact@dealership.com"
            active = true
        }
    }

    private fun createMockCarOffer(): CarOffer {
        return CarOffer().apply {
            id = 1L
            car = createMockCar()
            dealership = createMockDealership()
            price = BigDecimal("20000.00")
            available = true
        }
    }

    private fun createMockPurchase(): Purchase {
        return Purchase().apply {
            id = 1L
            buyer = createMockBuyer()
            carOffer = createMockCarOffer()
            purchaseDate = LocalDateTime.now()
            finalPrice = BigDecimal("20000.00")
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
            .andExpect(jsonPath("$.finalPrice").value(20000.00))

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
    fun `should get purchases by buyer id and return 200 OK`() {
        // Given
        val purchases = listOf(createMockPurchase())
        whenever(purchaseService.findByBuyerId(1L)).thenReturn(purchases)

        // When & Then
        mockMvc.perform(get("/api/purchases/buyer/1"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].id").value(1L))

        verify(purchaseService).findByBuyerId(1L)
    }

    @Test
    fun `should get purchases by car id and return 200 OK`() {
        // Given
        val purchases = listOf(createMockPurchase())
        whenever(purchaseService.findByCarId(1L)).thenReturn(purchases)

        // When & Then
        mockMvc.perform(get("/api/purchases/car/1"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].id").value(1L))

        verify(purchaseService).findByCarId(1L)
    }

    @Test
    fun `should get purchases by dealership id and return 200 OK`() {
        // Given
        val purchases = listOf(createMockPurchase())
        whenever(purchaseService.findByDealershipId(1L)).thenReturn(purchases)

        // When & Then
        mockMvc.perform(get("/api/purchases/dealership/1"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].id").value(1L))

        verify(purchaseService).findByDealershipId(1L)
    }

    @Test
    fun `should create purchase and return 201 CREATED`() {
        // Given
        val request =
            PurchaseCreateRequest(
                buyerId = 1L,
                carOfferId = 1L,
                finalPrice = BigDecimal("20000.00"),
                purchaseDate = LocalDateTime.now(),
                purchaseStatus = PurchaseStatus.PENDING,
                paymentMethod = PaymentMethod.CASH,
                observations = "Test",
            )
        val createdPurchase = createMockPurchase()
        whenever(purchaseService.createPurchase(any())).thenReturn(createdPurchase)

        // When & Then
        mockMvc.perform(
            post("/api/purchases")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)),
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.id").value(1L))
            .andExpect(jsonPath("$.finalPrice").value(20000.00))

        verify(purchaseService).createPurchase(any())
    }

    @Test
    fun `should return 400 BAD REQUEST when creating purchase with negative final price`() {
        // Given
        val request =
            PurchaseCreateRequest(
                buyerId = 1L,
                carOfferId = 1L,
                finalPrice = BigDecimal("-100.00"),
                purchaseDate = LocalDateTime.now(),
                purchaseStatus = PurchaseStatus.PENDING,
                paymentMethod = PaymentMethod.CASH,
                observations = "Test",
            )

        // When & Then
        mockMvc.perform(
            post("/api/purchases")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)),
        )
            .andExpect(status().isBadRequest)

        // Verify service was never called due to validation failure
        verify(purchaseService, never()).createPurchase(any())
    }

    @Test
    fun `should update purchase and return 200 OK`() {
        // Given
        val request =
            PurchaseUpdateRequest(
                finalPrice = BigDecimal("21000.00"),
                purchaseStatus = PurchaseStatus.CONFIRMED,
            )
        val updatedPurchase =
            createMockPurchase().apply {
                finalPrice = BigDecimal("21000.00")
                purchaseStatus = PurchaseStatus.CONFIRMED
            }
        whenever(purchaseService.updatePurchase(any(), any())).thenReturn(updatedPurchase)

        // When & Then
        mockMvc.perform(
            put("/api/purchases/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)),
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(1L))
            .andExpect(jsonPath("$.finalPrice").value(21000.00))
            .andExpect(jsonPath("$.purchaseStatus").value("CONFIRMED"))

        verify(purchaseService).updatePurchase(any(), any())
    }

    @Test
    fun `should return 404 NOT FOUND when updating non-existent purchase`() {
        // Given
        val request = PurchaseUpdateRequest(finalPrice = BigDecimal("21000.00"))
        whenever(purchaseService.updatePurchase(any(), any()))
            .thenThrow(NoSuchElementException("Purchase not found"))

        // When & Then
        mockMvc.perform(
            put("/api/purchases/999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)),
        )
            .andExpect(status().isNotFound)
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
    fun `should mark as pending and return 200 OK`() {
        // Given
        val updatedPurchase = createMockPurchase().apply { purchaseStatus = PurchaseStatus.PENDING }
        whenever(purchaseService.markAsPending(1L)).thenReturn(updatedPurchase)

        // When & Then
        mockMvc.perform(patch("/api/purchases/1/pending"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.purchaseStatus").value("PENDING"))

        verify(purchaseService).markAsPending(1L)
    }

    @Test
    fun `should mark as canceled and return 200 OK`() {
        // Given
        val updatedPurchase = createMockPurchase().apply { purchaseStatus = PurchaseStatus.CANCELLED }
        whenever(purchaseService.markAsCanceled(1L)).thenReturn(updatedPurchase)

        // When & Then
        mockMvc.perform(patch("/api/purchases/1/canceled"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.purchaseStatus").value("CANCELLED"))

        verify(purchaseService).markAsCanceled(1L)
    }

    @Test
    fun `should mark as delivered and return 200 OK`() {
        // Given
        val updatedPurchase = createMockPurchase().apply { purchaseStatus = PurchaseStatus.DELIVERED }
        whenever(purchaseService.markAsDelivered(1L)).thenReturn(updatedPurchase)

        // When & Then
        mockMvc.perform(patch("/api/purchases/1/delivered"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.purchaseStatus").value("DELIVERED"))

        verify(purchaseService).markAsDelivered(1L)
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

    @Test
    fun `should return 404 NOT FOUND when deleting non-existent purchase`() {
        // Given
        whenever(purchaseService.deletePurchase(999L))
            .thenThrow(NoSuchElementException("Purchase not found"))

        // When & Then
        mockMvc.perform(delete("/api/purchases/999"))
            .andExpect(status().isNotFound)
    }
}
