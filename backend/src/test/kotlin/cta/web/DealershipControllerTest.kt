package cta.web

import com.fasterxml.jackson.databind.ObjectMapper
import cta.model.Dealership
import cta.service.DealershipService
import cta.web.dto.DealershipCreateRequest
import cta.web.dto.DealershipUpdateRequest
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
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@SpringBootTest(
    properties = [
        "spring.main.allow-bean-definition-overriding=true",
    ],
)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class DealershipControllerTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @MockBean
    private lateinit var dealershipService: DealershipService

    private fun createMockDealership(
        id: Long = 1L,
        businessName: String = "Auto Motors SA",
        cuit: String = "20-12345678-9",
        email: String = "contact@automotors.com",
        city: String = "Buenos Aires",
        province: String = "Buenos Aires",
        active: Boolean = true,
        password: String = "password",
        firstName: String = "John",
        lastName: String = "Smith",
    ): Dealership {
        return Dealership().apply {
            this.id = id
            this.businessName = businessName
            this.cuit = cuit
            this.email = email
            this.phone = "011-1234-5678"
            this.address = "Av. Example 123"
            this.city = city
            this.province = province
            this.active = active
            this.password = password
            this.firstName = firstName
            this.lastName = lastName
        }
    }

    @Test
    fun `should get all active dealerships and return 200 OK`() {
        // Given
        val dealerships =
            listOf(
                createMockDealership(id = 1L, businessName = "Auto Motors SA"),
                createMockDealership(id = 2L, businessName = "Car Sales SRL"),
            )
        whenever(dealershipService.findActive()).thenReturn(dealerships)

        // When & Then
        mockMvc.perform(get("/api/dealerships"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].id").value(1))
            .andExpect(jsonPath("$[0].businessName").value("Auto Motors SA"))
            .andExpect(jsonPath("$[1].id").value(2))
            .andExpect(jsonPath("$[1].businessName").value("Car Sales SRL"))

        verify(dealershipService).findActive()
    }

    @Test
    fun `should return empty list when no active dealerships exist`() {
        // Given
        whenever(dealershipService.findActive()).thenReturn(emptyList())

        // When & Then
        mockMvc.perform(get("/api/dealerships"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$.length()").value(0))

        verify(dealershipService).findActive()
    }

    @Test
    fun `should get dealership by id and return 200 OK`() {
        // Given
        val dealership = createMockDealership(id = 1L, businessName = "Auto Motors SA")
        whenever(dealershipService.findById(1L)).thenReturn(dealership)

        // When & Then
        mockMvc.perform(get("/api/dealerships/{id}", 1L))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.businessName").value("Auto Motors SA"))
            .andExpect(jsonPath("$.cuit").value("20-12345678-9"))
            .andExpect(jsonPath("$.email").value("contact@automotors.com"))
            .andExpect(jsonPath("$.city").value("Buenos Aires"))
            .andExpect(jsonPath("$.province").value("Buenos Aires"))

        verify(dealershipService).findById(1L)
    }

    @Test
    fun `should return 404 NOT FOUND when dealership does not exist`() {
        // Given
        whenever(dealershipService.findById(999L))
            .thenThrow(NoSuchElementException("Dealership not found"))

        // When & Then
        mockMvc.perform(get("/api/dealerships/{id}", 999L))
            .andExpect(status().isNotFound)
    }

    @Test
    fun `should search dealerships by business name and return 200 OK`() {
        // Given
        val dealerships = listOf(createMockDealership(businessName = "Auto Motors SA"))
        whenever(dealershipService.searchDealerships(any())).thenReturn(dealerships)

        // When & Then
        mockMvc.perform(
            get("/api/dealerships/search")
                .param("businessName", "Auto Motors"),
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].businessName").value("Auto Motors SA"))

        verify(dealershipService).searchDealerships(any())
    }

    @Test
    fun `should search dealerships by city and return 200 OK`() {
        // Given
        val dealerships = listOf(createMockDealership(city = "Buenos Aires"))
        whenever(dealershipService.searchDealerships(any())).thenReturn(dealerships)

        // When & Then
        mockMvc.perform(
            get("/api/dealerships/search")
                .param("city", "Buenos Aires"),
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].city").value("Buenos Aires"))

        verify(dealershipService).searchDealerships(any())
    }

    @Test
    fun `should search dealerships by province and return 200 OK`() {
        // Given
        val dealerships = listOf(createMockDealership(province = "Buenos Aires"))
        whenever(dealershipService.searchDealerships(any())).thenReturn(dealerships)

        // When & Then
        mockMvc.perform(
            get("/api/dealerships/search")
                .param("province", "Buenos Aires"),
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].province").value("Buenos Aires"))

        verify(dealershipService).searchDealerships(any())
    }

    @Test
    fun `should search dealerships by cuit and return 200 OK`() {
        // Given
        val dealerships = listOf(createMockDealership(cuit = "20-12345678-9"))
        whenever(dealershipService.searchDealerships(any())).thenReturn(dealerships)

        // When & Then
        mockMvc.perform(
            get("/api/dealerships/search")
                .param("cuit", "20-12345678-9"),
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].cuit").value("20-12345678-9"))

        verify(dealershipService).searchDealerships(any())
    }

    @Test
    fun `should search dealerships with multiple filters and return 200 OK`() {
        // Given
        val dealerships = listOf(createMockDealership())
        whenever(dealershipService.searchDealerships(any())).thenReturn(dealerships)

        // When & Then
        mockMvc.perform(
            get("/api/dealerships/search")
                .param("businessName", "Auto Motors")
                .param("city", "Buenos Aires")
                .param("province", "Buenos Aires"),
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$.length()").value(1))

        verify(dealershipService).searchDealerships(any())
    }

    @Test
    fun `should return empty list when search finds no dealerships`() {
        // Given
        whenever(dealershipService.searchDealerships(any())).thenReturn(emptyList())

        // When & Then
        mockMvc.perform(
            get("/api/dealerships/search")
                .param("businessName", "NonExistent"),
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$.length()").value(0))

        verify(dealershipService).searchDealerships(any())
    }

    @Test
    fun `should get dealership by cuit and return 200 OK`() {
        // Given
        val cuit = "20-12345678-9"
        val dealership = createMockDealership(cuit = cuit)
        whenever(dealershipService.findByCuit(cuit)).thenReturn(dealership)

        // When & Then
        mockMvc.perform(get("/api/dealerships/cuit/{cuit}", cuit))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.cuit").value(cuit))
            .andExpect(jsonPath("$.businessName").value("Auto Motors SA"))

        verify(dealershipService).findByCuit(cuit)
    }

    @Test
    fun `should return 404 NOT FOUND when dealership with cuit does not exist`() {
        // Given
        val cuit = "20-99999999-9"
        whenever(dealershipService.findByCuit(cuit)).thenReturn(null)

        // When & Then
        mockMvc.perform(get("/api/dealerships/cuit/{cuit}", cuit))
            .andExpect(status().isNotFound)
    }

    @Test
    fun `should get dealership by email and return 200 OK`() {
        // Given
        val email = "contact@automotors.com"
        val dealership = createMockDealership(email = email)
        whenever(dealershipService.findByEmail(email)).thenReturn(dealership)

        // When & Then
        mockMvc.perform(get("/api/dealerships/email/{email}", email))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.email").value(email))
            .andExpect(jsonPath("$.businessName").value("Auto Motors SA"))

        verify(dealershipService).findByEmail(email)
    }

    @Test
    fun `should return 404 NOT FOUND when dealership with email does not exist`() {
        // Given
        val email = "nonexistent@example.com"
        whenever(dealershipService.findByEmail(email)).thenReturn(null)

        // When & Then
        mockMvc.perform(get("/api/dealerships/email/{email}", email))
            .andExpect(status().isNotFound)
    }

    @Test
    fun `should create dealership and return 201 CREATED`() {
        // Given
        val request =
            DealershipCreateRequest(
                businessName = "Auto Motors SA",
                cuit = "20123456789",
                email = "contact@automotors.com",
                phone = "011-1234-5678",
                address = "Av. Example 123",
                city = "Buenos Aires",
                province = "Buenos Aires",
                password = "password",
                firstName = "John",
                lastName = "Smith",
            )

        val savedDealership = createMockDealership(id = 1L)
        whenever(dealershipService.createDealership(any())).thenReturn(savedDealership)

        // When & Then
        mockMvc.perform(
            post("/api/dealerships")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)),
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.businessName").value("Auto Motors SA"))
            .andExpect(jsonPath("$.cuit").value("20-12345678-9"))
            .andExpect(jsonPath("$.email").value("contact@automotors.com"))

        verify(dealershipService).createDealership(any())
    }

    @Test
    fun `should return 400 BAD REQUEST when creating dealership with invalid data`() {
        // Given
        val invalidRequest =
            """
            {
                "businessName": "",
                "cuit": "invalid",
                "email": "invalid-email"
            }
            """.trimIndent()

        // When & Then
        mockMvc.perform(
            post("/api/dealerships")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidRequest),
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `should update dealership and return 200 OK`() {
        // Given
        val dealershipId = 1L
        val request =
            DealershipUpdateRequest(
                businessName = "Updated Motors SA",
                email = "updated@automotors.com",
                phone = "011-9999-9999",
                address = "New Address 456",
                city = "Cordoba",
                province = "Cordoba",
            )

        val updatedDealership =
            createMockDealership(
                id = dealershipId,
                businessName = "Updated Motors SA",
                email = "updated@automotors.com",
                city = "Cordoba",
                province = "Cordoba",
            )
        whenever(dealershipService.updateDealership(eq(dealershipId), any())).thenReturn(updatedDealership)

        // When & Then
        mockMvc.perform(
            put("/api/dealerships/{id}", dealershipId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)),
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(dealershipId))
            .andExpect(jsonPath("$.businessName").value("Updated Motors SA"))
            .andExpect(jsonPath("$.email").value("updated@automotors.com"))
            .andExpect(jsonPath("$.city").value("Cordoba"))
            .andExpect(jsonPath("$.province").value("Cordoba"))

        verify(dealershipService).updateDealership(eq(dealershipId), any())
    }

    @Test
    fun `should return 404 NOT FOUND when updating non-existent dealership`() {
        // Given
        val dealershipId = 999L
        val request =
            DealershipUpdateRequest(
                businessName = "Updated Motors SA",
            )

        whenever(dealershipService.updateDealership(eq(dealershipId), any()))
            .thenThrow(NoSuchElementException("Dealership not found"))

        // When & Then
        mockMvc.perform(
            put("/api/dealerships/{id}", dealershipId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)),
        )
            .andExpect(status().isNotFound)
    }

    @Test
    fun `should return 400 BAD REQUEST when updating dealership with invalid data`() {
        // Given
        val dealershipId = 1L
        val invalidRequest =
            """
            {
                "email": "invalid-email"
            }
            """.trimIndent()

        // When & Then
        mockMvc.perform(
            put("/api/dealerships/{id}", dealershipId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidRequest),
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `should deactivate dealership and return 200 OK`() {
        // Given
        val dealershipId = 1L
        val deactivatedDealership = createMockDealership(id = dealershipId, active = false)
        whenever(dealershipService.deactivate(dealershipId)).thenReturn(deactivatedDealership)

        // When & Then
        mockMvc.perform(patch("/api/dealerships/{id}/deactivate", dealershipId))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(dealershipId))
            .andExpect(jsonPath("$.active").value(false))

        verify(dealershipService).deactivate(dealershipId)
    }

    @Test
    fun `should return 404 NOT FOUND when deactivating non-existent dealership`() {
        // Given
        val dealershipId = 999L
        whenever(dealershipService.deactivate(dealershipId))
            .thenThrow(NoSuchElementException("Dealership not found"))

        // When & Then
        mockMvc.perform(patch("/api/dealerships/{id}/deactivate", dealershipId))
            .andExpect(status().isNotFound)
    }

    @Test
    fun `should activate dealership and return 200 OK`() {
        // Given
        val dealershipId = 1L
        val activatedDealership = createMockDealership(id = dealershipId, active = true)
        whenever(dealershipService.activate(dealershipId)).thenReturn(activatedDealership)

        // When & Then
        mockMvc.perform(patch("/api/dealerships/{id}/activate", dealershipId))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(dealershipId))
            .andExpect(jsonPath("$.active").value(true))

        verify(dealershipService).activate(dealershipId)
    }

    @Test
    fun `should return 404 NOT FOUND when activating non-existent dealership`() {
        // Given
        val dealershipId = 999L
        whenever(dealershipService.activate(dealershipId))
            .thenThrow(NoSuchElementException("Dealership not found"))

        // When & Then
        mockMvc.perform(patch("/api/dealerships/{id}/activate", dealershipId))
            .andExpect(status().isNotFound)
    }

    @Test
    fun `should delete dealership and return 204 NO CONTENT`() {
        // Given
        val dealershipId = 1L

        // When & Then
        mockMvc.perform(delete("/api/dealerships/{id}", dealershipId))
            .andExpect(status().isNoContent)

        verify(dealershipService).deleteDealership(dealershipId)
    }

    @Test
    fun `should return 404 NOT FOUND when deleting non-existent dealership`() {
        // Given
        val dealershipId = 999L
        whenever(dealershipService.deleteDealership(dealershipId))
            .thenThrow(NoSuchElementException("Dealership not found"))

        // When & Then
        mockMvc.perform(delete("/api/dealerships/{id}", dealershipId))
            .andExpect(status().isNotFound)
    }
}
