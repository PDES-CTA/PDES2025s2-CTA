package cta.web

import cta.model.Car
import cta.model.Dealership
import cta.model.Purchase
import cta.enum.FuelType
import cta.enum.PurchaseStatus
import cta.enum.TransmissionType
import cta.service.PurchaseService
import cta.web.dto.PurchaseCreateRequest
import cta.web.dto.PurchaseUpdateRequest
import com.fasterxml.jackson.databind.ObjectMapper
import cta.enum.PaymentMethod
import org.junit.jupiter.api.Test
import org.mockito.kotlin.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.test.context.TestPropertySource
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import java.math.BigDecimal
import java.time.LocalDateTime

@SpringBootTest(properties = [
    "spring.main.allow-bean-definition-overriding=true"
])
@AutoConfigureMockMvc(addFilters = false)
@TestPropertySource(properties = [
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration,org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration"
])
class PurchaseControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @MockBean
    private lateinit var purchaseService: PurchaseService

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

    private fun createMockDealership(id: Long = 1L): Dealership {
        return Dealership().apply {
            this.id = id
            this.businessName = "Auto Motors SA"
            this.cuit = "20-12345678-9"
            this.email = "contact@automotors.com"
            this.phone = "011-1234-5678"
            this.address = "Av. Example 123"
            this.city = "Buenos Aires"
            this.province = "Buenos Aires"
            this.active = true
        }
    }

    private fun createMockPurchase(
        id: Long = 1L,
        buyerId: Long = 1L,
        car: Car = createMockCar(),
        paymentMethod: PaymentMethod = PaymentMethod.CASH,
        dealership: Dealership = createMockDealership(),
        observations: String = "No observations",
        purchaseStatus: PurchaseStatus = PurchaseStatus.PENDING,
        finalPrice: BigDecimal = BigDecimal("20000")
    ): Purchase {
        return Purchase().apply {
            this.id = id
            this.buyerId = buyerId
            this.car = car
            this.dealership = dealership
            this.paymentMethod = paymentMethod
            this.purchaseStatus = purchaseStatus
            this.observations = observations
            this.purchaseDate = LocalDateTime.now()
            this.finalPrice = finalPrice
        }
    }

    @Test
    fun `should get all purchases and return 200 OK`() {
        // Given
        val purchases = listOf(
            createMockPurchase(id = 1L),
            createMockPurchase(id = 2L)
        )
        whenever(purchaseService.findAll()).thenReturn(purchases)

        // When & Then
        mockMvc.perform(get("/api/purchases"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].id").value(1))
            .andExpect(jsonPath("$[1].id").value(2))

        verify(purchaseService).findAll()
    }

    @Test
    fun `should return empty list when no purchases exist`() {
        // Given
        whenever(purchaseService.findAll()).thenReturn(emptyList())

        // When & Then
        mockMvc.perform(get("/api/purchases"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$.length()").value(0))

        verify(purchaseService).findAll()
    }

    @Test
    fun `should get purchase by id and return 200 OK`() {
        // Given
        val purchase = createMockPurchase(id = 1L)
        whenever(purchaseService.findById(1L)).thenReturn(purchase)

        // When & Then
        mockMvc.perform(get("/api/purchases/{id}", 1L))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.purchaseStatus").value("PENDING"))
            .andExpect(jsonPath("$.finalPrice").value(20000))

        verify(purchaseService).findById(1L)
    }

    @Test
    fun `should return 404 NOT FOUND when purchase does not exist`() {
        // Given
        whenever(purchaseService.findById(999L))
            .thenThrow(NoSuchElementException("Purchase not found"))

        // When & Then
        mockMvc.perform(get("/api/purchases/{id}", 999L))
            .andExpect(status().isNotFound)
    }

    @Test
    fun `should get purchases by buyer id and return 200 OK`() {
        // Given
        val buyerId = 1L
        val purchases = listOf(
            createMockPurchase(id = 1L),
            createMockPurchase(id = 2L)
        )
        whenever(purchaseService.findByBuyerId(buyerId)).thenReturn(purchases)

        // When & Then
        mockMvc.perform(get("/api/purchases/buyer/{id}", buyerId))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].id").value(1))
            .andExpect(jsonPath("$[1].id").value(2))

        verify(purchaseService).findByBuyerId(buyerId)
    }

    @Test
    fun `should return empty list when buyer has no purchases`() {
        // Given
        val buyerId = 1L
        whenever(purchaseService.findByBuyerId(buyerId)).thenReturn(emptyList())

        // When & Then
        mockMvc.perform(get("/api/purchases/buyer/{id}", buyerId))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$.length()").value(0))

        verify(purchaseService).findByBuyerId(buyerId)
    }

    @Test
    fun `should get purchase by car id and return 200 OK`() {
        // Given
        val carId = 1L
        val purchase = createMockPurchase(id = 1L)
        whenever(purchaseService.findByCarId(carId)).thenReturn(purchase)

        // When & Then
        mockMvc.perform(get("/api/purchases/car/{id}", carId))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.carId").value(1))

        verify(purchaseService).findByCarId(carId)
    }

    @Test
    fun `should return 404 NOT FOUND when no purchase exists for car`() {
        // Given
        val carId = 999L
        whenever(purchaseService.findByCarId(carId))
            .thenThrow(NoSuchElementException("Purchase not found for car"))

        // When & Then
        mockMvc.perform(get("/api/purchases/car/{id}", carId))
            .andExpect(status().isNotFound)
    }

    @Test
    fun `should get purchases by dealership id and return 200 OK`() {
        // Given
        val dealershipId = 1L
        val purchases = listOf(
            createMockPurchase(id = 1L),
            createMockPurchase(id = 2L)
        )
        whenever(purchaseService.findByDealershipId(dealershipId)).thenReturn(purchases)

        // When & Then
        mockMvc.perform(get("/api/purchases/dealership/{id}", dealershipId))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].id").value(1))
            .andExpect(jsonPath("$[1].id").value(2))

        verify(purchaseService).findByDealershipId(dealershipId)
    }

    @Test
    fun `should return empty list when dealership has no purchases`() {
        // Given
        val dealershipId = 1L
        whenever(purchaseService.findByDealershipId(dealershipId)).thenReturn(emptyList())

        // When & Then
        mockMvc.perform(get("/api/purchases/dealership/{id}", dealershipId))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$.length()").value(0))

        verify(purchaseService).findByDealershipId(dealershipId)
    }

    @Test
    fun `should create purchase and return 201 CREATED`() {
        // Given
        val request = PurchaseCreateRequest(
            buyerId = 1L,
            carId = 1L,
            dealershipId = 1L,
            finalPrice = BigDecimal("20000"),
            purchaseDate = LocalDateTime.now(),
            purchaseStatus = PurchaseStatus.PENDING,
            paymentMethod = PaymentMethod.CREDIT_CARD,
            observations = "No observations"
        )

        val savedPurchase = createMockPurchase(id = 1L)
        whenever(purchaseService.createPurchase(any())).thenReturn(savedPurchase)

        // When & Then
        mockMvc.perform(
            post("/api/purchases")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.buyerId").value(1))
            .andExpect(jsonPath("$.carId").value(1))
            .andExpect(jsonPath("$.dealershipId").value(1))
            .andExpect(jsonPath("$.finalPrice").value(20000))
            .andExpect(jsonPath("$.purchaseStatus").value("PENDING"))

        verify(purchaseService).createPurchase(any())
    }

    @Test
    fun `should return 400 BAD REQUEST when creating purchase with missing buyerId`() {
        // Given
        val invalidRequest = """
            {
                "carId": 1,
                "dealershipId": 1,
                "totalAmount": 20000
            }
        """.trimIndent()

        // When & Then
        mockMvc.perform(
            post("/api/purchases")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidRequest)
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `should return 400 BAD REQUEST when creating purchase with missing carId`() {
        // Given
        val invalidRequest = """
            {
                "buyerId": 1,
                "dealershipId": 1,
                "totalAmount": 20000
            }
        """.trimIndent()

        // When & Then
        mockMvc.perform(
            post("/api/purchases")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidRequest)
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `should return 400 BAD REQUEST when creating purchase with invalid totalAmount`() {
        // Given
        val invalidRequest = """
            {
                "buyerId": 1,
                "carId": 1,
                "dealershipId": 1,
                "totalAmount": -1000
            }
        """.trimIndent()

        // When & Then
        mockMvc.perform(
            post("/api/purchases")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidRequest)
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `should return 404 NOT FOUND when creating purchase with non-existent buyer`() {
        // Given
        val request = PurchaseCreateRequest(
            buyerId = 999L,
            carId = 1L,
            dealershipId = 1L,
            finalPrice = BigDecimal("20000"),
            purchaseDate = LocalDateTime.now(),
            purchaseStatus = PurchaseStatus.PENDING,
            paymentMethod = PaymentMethod.CREDIT_CARD,
            observations = "No observations"
        )

        whenever(purchaseService.createPurchase(any()))
            .thenThrow(NoSuchElementException("Buyer not found"))

        // When & Then
        mockMvc.perform(
            post("/api/purchases")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isNotFound)
    }

    @Test
    fun `should update purchase and return 200 OK`() {
        // Given
        val purchaseId = 1L
        val request = PurchaseUpdateRequest(
            finalPrice = BigDecimal("22000"),
            purchaseDate = LocalDateTime.now().minusDays(1)
        )

        val updatedPurchase = createMockPurchase(
            id = purchaseId,
            finalPrice = BigDecimal("22000")
        )
        whenever(purchaseService.updatePurchase(eq(purchaseId), any())).thenReturn(updatedPurchase)

        // When & Then
        mockMvc.perform(
            put("/api/purchases/{id}", purchaseId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(purchaseId))
            .andExpect(jsonPath("$.finalPrice").value(22000))

        verify(purchaseService).updatePurchase(eq(purchaseId), any())
    }

    @Test
    fun `should return 404 NOT FOUND when updating non-existent purchase`() {
        // Given
        val purchaseId = 999L
        val request = PurchaseUpdateRequest(
            finalPrice = BigDecimal("22000")
        )

        whenever(purchaseService.updatePurchase(eq(purchaseId), any()))
            .thenThrow(NoSuchElementException("Purchase not found"))

        // When & Then
        mockMvc.perform(
            put("/api/purchases/{id}", purchaseId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isNotFound)
    }

    @Test
    fun `should delete purchase and return 204 NO CONTENT`() {
        // Given
        val purchaseId = 1L

        // When & Then
        mockMvc.perform(delete("/api/purchases/{id}", purchaseId))
            .andExpect(status().isNoContent)

        verify(purchaseService).deletePurchase(purchaseId)
    }

    @Test
    fun `should return 404 NOT FOUND when deleting non-existent purchase`() {
        // Given
        val purchaseId = 999L
        whenever(purchaseService.deletePurchase(purchaseId))
            .thenThrow(NoSuchElementException("Purchase not found"))

        // When & Then
        mockMvc.perform(delete("/api/purchases/{id}", purchaseId))
            .andExpect(status().isNotFound)
    }

    @Test
    fun `should mark purchase as canceled and return 200 OK`() {
        // Given
        val purchaseId = 1L
        val canceledPurchase = createMockPurchase(
            id = purchaseId,
            purchaseStatus = PurchaseStatus.CANCELLED,
        )
        whenever(purchaseService.markAsCanceled(purchaseId)).thenReturn(canceledPurchase)

        // When & Then
        mockMvc.perform(patch("/api/purchases/{id}/canceled", purchaseId))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(purchaseId))
            .andExpect(jsonPath("$.purchaseStatus").value("CANCELLED"))

        verify(purchaseService).markAsCanceled(purchaseId)
    }

    @Test
    fun `should mark purchase as delivered and return 200 OK`() {
        // Given
        val purchaseId = 1L
        val deliveredPurchase = createMockPurchase(
            id = purchaseId,
            purchaseStatus = PurchaseStatus.DELIVERED,
        )
        whenever(purchaseService.markAsDelivered(purchaseId)).thenReturn(deliveredPurchase)

        // When & Then
        mockMvc.perform(patch("/api/purchases/{id}/delivered", purchaseId))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(purchaseId))
            .andExpect(jsonPath("$.purchaseStatus").value("DELIVERED"))

        verify(purchaseService).markAsDelivered(purchaseId)
    }

    @Test
    fun `should mark purchase as confirmed and return 200 OK`() {
        // Given
        val purchaseId = 1L
        val confirmedPurchase = createMockPurchase(
            id = purchaseId,
            purchaseStatus = PurchaseStatus.CONFIRMED,
        )
        whenever(purchaseService.markAsConfirmed(purchaseId)).thenReturn(confirmedPurchase)

        // When & Then
        mockMvc.perform(patch("/api/purchases/{id}/confirmed", purchaseId))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(purchaseId))
            .andExpect(jsonPath("$.purchaseStatus").value("CONFIRMED"))

        verify(purchaseService).markAsConfirmed(purchaseId)
    }

    @Test
    fun `should mark purchase as pending and return 200 OK`() {
        // Given
        val purchaseId = 1L
        val pendingPurchase = createMockPurchase(
            id = purchaseId,
            purchaseStatus = PurchaseStatus.PENDING,
        )
        whenever(purchaseService.markAsPending(purchaseId)).thenReturn(pendingPurchase)

        // When & Then
        mockMvc.perform(patch("/api/purchases/{id}/pending", purchaseId))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(purchaseId))
            .andExpect(jsonPath("$.purchaseStatus").value("PENDING"))

        verify(purchaseService).markAsPending(purchaseId)
    }

    @Test
    fun `should return 404 NOT FOUND when marking non-existent purchase as canceled`() {
        // Given
        val purchaseId = 999L
        whenever(purchaseService.markAsCanceled(purchaseId))
            .thenThrow(NoSuchElementException("Purchase not found"))

        // When & Then
        mockMvc.perform(patch("/api/purchases/{id}/canceled", purchaseId))
            .andExpect(status().isNotFound)
    }

    @Test
    fun `should return 404 NOT FOUND when marking non-existent purchase as pending`() {
        // Given
        val purchaseId = 999L
        whenever(purchaseService.markAsPending(purchaseId))
            .thenThrow(NoSuchElementException("Purchase not found"))

        // When & Then
        mockMvc.perform(patch("/api/purchases/{id}/pending", purchaseId))
            .andExpect(status().isNotFound)
    }

    @Test
    fun `should return 404 NOT FOUND when marking non-existent purchase as confirmed`() {
        // Given
        val purchaseId = 999L
        whenever(purchaseService.markAsConfirmed(purchaseId))
            .thenThrow(NoSuchElementException("Purchase not found"))

        // When & Then
        mockMvc.perform(patch("/api/purchases/{id}/confirmed", purchaseId))
            .andExpect(status().isNotFound)
    }

    @Test
    fun `should return 404 NOT FOUND when marking non-existent purchase as delivered`() {
        // Given
        val purchaseId = 999L
        whenever(purchaseService.markAsDelivered(purchaseId))
            .thenThrow(NoSuchElementException("Purchase not found"))

        // When & Then
        mockMvc.perform(patch("/api/purchases/{id}/delivered", purchaseId))
            .andExpect(status().isNotFound)
    }
}