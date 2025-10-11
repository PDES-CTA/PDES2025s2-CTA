package cta.web

import cta.model.Buyer
import cta.service.BuyerService
import cta.web.dto.BuyerCreateRequest
import cta.web.dto.BuyerUpdateRequest
import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.eq
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.test.context.TestPropertySource
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

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
class BuyerControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @MockBean
    private lateinit var buyerService: BuyerService

    @Test
    fun `should create buyer and return 201 CREATED`() {
        // Given
        val request = BuyerCreateRequest(
            email = "buyer-user@gmail.com",
            password = "password123",
            firstName = "John",
            lastName = "Example",
            phone = "1112341234",
            dni = 59252192,
            address = "24 Main Street, BA"
        )

        val savedBuyer = Buyer().apply {
            id = 1L
            email = "buyer-user@gmail.com"
            password = "password123"
            phone = "1112341234"
            dni = 59252192
            address = "24 Main Street, BA"
            active = true
        }

        whenever(buyerService.createBuyer(any())).thenReturn(savedBuyer)

        // When & Then
        mockMvc.perform(
            post("/api/buyer")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.email").value("buyer-user@gmail.com"))
            .andExpect(jsonPath("$.active").value("true"))
            .andExpect(jsonPath("$.phone").value("1112341234"))
            .andExpect(jsonPath("$.dni").value(59252192))
            .andExpect(jsonPath("$.address").value("24 Main Street, BA"))

        verify(buyerService).createBuyer(any())
    }

    @Test
    fun `should return 400 BAD REQUEST when email is missing`() {
        // Given
        val invalidRequest = """
            {
                "password": "password123",
                "firstName": "John",
                "lastName": "Example",
                "phone": "1112341234",
                "dni": 59252192,
                "address": "24 Main Street, BA"
            }
        """.trimIndent()

        // When & Then
        mockMvc.perform(
            post("/api/buyer")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidRequest)
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `should return 400 BAD REQUEST when email format is invalid`() {
        // Given
        val invalidRequest = """
            {
                "email": "invalid-email",
                "password": "password123",
                "firstName": "John",
                "lastName": "Example",
                "phone": "1112341234",
                "dni": 59252192,
                "address": "24 Main Street, BA"
            }
        """.trimIndent()

        // When & Then
        mockMvc.perform(
            post("/api/buyer")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidRequest)
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `should return 400 BAD REQUEST when password is too short`() {
        // Given
        val invalidRequest = """
            {
                "email": "buyer@gmail.com",
                "password": "pass",
                "firstName": "John",
                "lastName": "Example",
                "phone": "1112341234",
                "dni": 59252192,
                "address": "24 Main Street, BA"
            }
        """.trimIndent()

        // When & Then
        mockMvc.perform(
            post("/api/buyer")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidRequest)
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `should return 400 BAD REQUEST when firstName is too short`() {
        // Given
        val invalidRequest = """
            {
                "email": "buyer@gmail.com",
                "password": "password123",
                "firstName": "J",
                "lastName": "Example",
                "phone": "1112341234",
                "dni": 59252192,
                "address": "24 Main Street, BA"
            }
        """.trimIndent()

        // When & Then
        mockMvc.perform(
            post("/api/buyer")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidRequest)
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `should return 400 BAD REQUEST when DNI is below minimum`() {
        // Given
        val invalidRequest = """
            {
                "email": "buyer@gmail.com",
                "password": "password123",
                "firstName": "John",
                "lastName": "Example",
                "phone": "1112341234",
                "dni": 999999,
                "address": "24 Main Street, BA"
            }
        """.trimIndent()

        // When & Then
        mockMvc.perform(
            post("/api/buyer")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidRequest)
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `should return 400 BAD REQUEST when DNI exceeds maximum`() {
        // Given
        val invalidRequest = """
            {
                "email": "buyer@gmail.com",
                "password": "password123",
                "firstName": "John",
                "lastName": "Example",
                "phone": "1112341234",
                "dni": 100000000,
                "address": "24 Main Street, BA"
            }
        """.trimIndent()

        // When & Then
        mockMvc.perform(
            post("/api/buyer")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidRequest)
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `should return 400 BAD REQUEST when address exceeds max length`() {
        // Given
        val longAddress = "a".repeat(41)
        val invalidRequest = """
            {
                "email": "buyer@gmail.com",
                "password": "password123",
                "firstName": "John",
                "lastName": "Example",
                "phone": "1112341234",
                "dni": 59252192,
                "address": "$longAddress"
            }
        """.trimIndent()

        // When & Then
        mockMvc.perform(
            post("/api/buyer")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidRequest)
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `should update buyer and return 200 OK`() {
        // Given
        val buyerId = 1L
        val request = BuyerUpdateRequest(
            email = "updated@gmail.com",
            phone = "1234567890",
            dni = 12345678,
            address = "Updated Street 123",
            active = true
        )

        val updatedBuyer = Buyer().apply {
            id = buyerId
            email = "updated@gmail.com"
            firstName = "John"
            lastName = "Example"
            phone = "1234567890"
            dni = 12345678
            address = "Updated Street 123"
            active = true
        }

        whenever(buyerService.updateBuyer(eq(buyerId), any())).thenReturn(updatedBuyer)

        // When & Then
        mockMvc.perform(
            put("/api/buyer/{id}", buyerId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(buyerId))
            .andExpect(jsonPath("$.email").value("updated@gmail.com"))
            .andExpect(jsonPath("$.phone").value("1234567890"))
            .andExpect(jsonPath("$.dni").value(12345678))
            .andExpect(jsonPath("$.address").value("Updated Street 123"))
            .andExpect(jsonPath("$.active").value(true))

        verify(buyerService).updateBuyer(eq(buyerId), any())
    }

    @Test
    fun `should update buyer with partial data and return 200 OK`() {
        // Given
        val buyerId = 1L
        val request = BuyerUpdateRequest(
            email = "partial@gmail.com",
            address = "Updated Address",
            active = false
        )

        val updatedBuyer = Buyer().apply {
            id = buyerId
            email = "partial@gmail.com"
            firstName = "John"
            lastName = "Example"
            phone = "1112341234"
            dni = 59252192
            address = "Updated Address"
            active = false
        }

        whenever(buyerService.updateBuyer(eq(buyerId), any())).thenReturn(updatedBuyer)

        // When & Then
        mockMvc.perform(
            put("/api/buyer/{id}", buyerId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(buyerId))
            .andExpect(jsonPath("$.email").value("partial@gmail.com"))
            .andExpect(jsonPath("$.address").value("Updated Address"))
            .andExpect(jsonPath("$.active").value(false))

        verify(buyerService).updateBuyer(eq(buyerId), any())
    }

    @Test
    fun `should return 400 BAD REQUEST when update buyer with invalid email`() {
        // Given
        val buyerId = 1L
        val invalidRequest = """
            {
                "email": "invalid-email"
            }
        """.trimIndent()

        // When & Then
        mockMvc.perform(
            put("/api/buyer/{id}", buyerId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidRequest)
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `should return 400 BAD REQUEST when phone is too short`() {
        // Given
        val buyerId = 1L
        val invalidRequest = """
            {
                "phone": "123456789"
            }
        """.trimIndent()

        // When & Then
        mockMvc.perform(
            put("/api/buyer/{id}", buyerId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidRequest)
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `should return 400 BAD REQUEST when phone is too long`() {
        // Given
        val buyerId = 1L
        val invalidRequest = """
            {
                "phone": "1234567890123456"
            }
        """.trimIndent()

        // When & Then
        mockMvc.perform(
            put("/api/buyer/{id}", buyerId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidRequest)
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `should return 400 BAD REQUEST when update DNI is below minimum`() {
        // Given
        val buyerId = 1L
        val invalidRequest = """
            {
                "dni": 999999
            }
        """.trimIndent()

        // When & Then
        mockMvc.perform(
            put("/api/buyer/{id}", buyerId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidRequest)
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `should return 400 BAD REQUEST when update DNI exceeds maximum`() {
        // Given
        val buyerId = 1L
        val invalidRequest = """
            {
                "dni": 100000000
            }
        """.trimIndent()

        // When & Then
        mockMvc.perform(
            put("/api/buyer/{id}", buyerId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidRequest)
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `should return 400 BAD REQUEST when update address exceeds max length`() {
        // Given
        val buyerId = 1L
        val longAddress = "a".repeat(41)
        val invalidRequest = """
            {
                "address": "$longAddress"
            }
        """.trimIndent()

        // When & Then
        mockMvc.perform(
            put("/api/buyer/{id}", buyerId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidRequest)
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `should delete buyer and return 204 NO CONTENT`() {
        // Given
        val buyerId = 1L

        // When & Then
        mockMvc.perform(
            delete("/api/buyer/{id}", buyerId)
        )
            .andExpect(status().isNoContent)

        verify(buyerService).deleteBuyer(buyerId)
    }

    @Test
    fun `should return 404 NOT FOUND when deleting non-existent buyer`() {
        // Given
        val buyerId = 999L
        whenever(buyerService.deleteBuyer(buyerId))
            .thenThrow(NoSuchElementException("Buyer not found"))

        // When & Then
        mockMvc.perform(
            delete("/api/buyer/{id}", buyerId)
        )
            .andExpect(status().isNotFound)
    }

    @Test
    fun `should return 404 NOT FOUND when updating non-existent buyer`() {
        // Given
        val buyerId = 999L
        val request = BuyerUpdateRequest(
            email = "updated@gmail.com",
            address = "updated address",
            phone = "1234567890"
        )

        whenever(buyerService.updateBuyer(eq(buyerId), any()))
            .thenThrow(NoSuchElementException("Buyer not found"))

        // When & Then
        mockMvc.perform(
            put("/api/buyer/{id}", buyerId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isNotFound)
    }
}