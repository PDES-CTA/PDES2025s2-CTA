package cta.web

import com.fasterxml.jackson.databind.ObjectMapper
import cta.config.JwtTokenProvider
import cta.model.Buyer
import cta.repository.UserRepository
import cta.service.BuyerService
import cta.web.controller.AuthController
import cta.web.dto.BuyerCreateRequest
import cta.web.dto.LoginRequest
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.mockito.Mockito.never
import org.mockito.Mockito.verify
import org.mockito.Mockito.`when`
import org.mockito.kotlin.any
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.User
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@WebMvcTest(AuthController::class)
@AutoConfigureMockMvc(addFilters = false) // Disable security for testing
class AuthControllerTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var authenticationManager: AuthenticationManager

    @MockBean
    private lateinit var jwtTokenProvider: JwtTokenProvider

    @MockBean
    private lateinit var userDetailsService: UserDetailsService

    @MockBean
    private lateinit var buyerService: BuyerService

    @MockBean
    private lateinit var userRepository: UserRepository

    @MockBean
    private lateinit var passwordEncoder: PasswordEncoder

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    // ========== Login Tests ==========

    @Test
    @DisplayName("Should login successfully with valid credentials")
    fun shouldLoginSuccessfully() {
        // Given
        val loginRequest =
            LoginRequest(
                email = "buyer@example.com",
                password = "password123",
            )

        val authentication =
            UsernamePasswordAuthenticationToken(
                "buyer@example.com",
                "password123",
            )

        val userDetails =
            User(
                "buyer@example.com",
                "encodedPassword",
                true,
                true,
                true,
                true,
                listOf(SimpleGrantedAuthority("ROLE_BUYER")),
            )

        val buyer =
            Buyer().apply {
                id = 1L
                email = "buyer@example.com"
                firstName = "John"
                lastName = "Doe"
                phone = "1234567890"
                address = "Address"
                dni = 12345678
                active = true
            }

        `when`(authenticationManager.authenticate(any())).thenReturn(authentication)
        `when`(userDetailsService.loadUserByUsername("buyer@example.com")).thenReturn(userDetails)
        `when`(jwtTokenProvider.generateToken(userDetails)).thenReturn("fake-jwt-token")
        `when`(userRepository.findByEmail("buyer@example.com")).thenReturn(buyer)

        // When & Then
        mockMvc.perform(
            post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)),
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.token").value("fake-jwt-token"))
            .andExpect(jsonPath("$.type").value("Bearer"))
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.email").value("buyer@example.com"))
            .andExpect(jsonPath("$.nombre").value("John"))
            .andExpect(jsonPath("$.apellido").value("Doe"))
            .andExpect(jsonPath("$.role").value("BUYER"))

        verify(authenticationManager).authenticate(any())
        verify(jwtTokenProvider).generateToken(userDetails)
    }

    @Test
    @DisplayName("Should return 400 when email is blank")
    fun shouldReturn400WhenEmailIsBlank() {
        // Given
        val loginRequest =
            """
            {
                "email": "",
                "password": "password123"
            }
            """.trimIndent()

        // When & Then
        mockMvc.perform(
            post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginRequest),
        )
            .andExpect(status().isBadRequest)
    }

    // ========== Register Tests ==========

    @Test
    @DisplayName("Should register new buyer successfully")
    fun shouldRegisterNewBuyerSuccessfully() {
        // Given
        val registerRequest =
            BuyerCreateRequest(
                email = "newbuyer@example.com",
                password = "password123",
                firstName = "Jane",
                lastName = "Smith",
                phone = "9876543210",
                address = "New Address",
                dni = 87654321,
            )

        val savedBuyer =
            Buyer().apply {
                id = 2L
                email = "newbuyer@example.com"
                firstName = "Jane"
                lastName = "Smith"
                phone = "9876543210"
                address = "New Address"
                dni = 87654321
                active = true
            }

        `when`(userRepository.existsByEmail("newbuyer@example.com")).thenReturn(false)
        `when`(passwordEncoder.encode("password123")).thenReturn("encodedPassword")
        `when`(buyerService.createBuyer(any())).thenReturn(savedBuyer)

        // When & Then
        mockMvc.perform(
            post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)),
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.id").value(2))
            .andExpect(jsonPath("$.email").value("newbuyer@example.com"))
            .andExpect(jsonPath("$.firstName").value("Jane"))
            .andExpect(jsonPath("$.lastName").value("Smith"))
            .andExpect(jsonPath("$.role").value("BUYER"))

        verify(userRepository).existsByEmail("newbuyer@example.com")
        verify(buyerService).createBuyer(any())
    }

    @Test
    @DisplayName("Should return 409 when email already exists")
    fun shouldReturn409WhenEmailExists() {
        // Given
        val registerRequest =
            BuyerCreateRequest(
                email = "existing@example.com",
                password = "password123",
                firstName = "Jane",
                lastName = "Smith",
                phone = "9876543210",
                address = "Address",
                dni = 87654321,
            )

        `when`(userRepository.existsByEmail("existing@example.com")).thenReturn(true)

        // When & Then
        mockMvc.perform(
            post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)),
        )
            .andExpect(status().isConflict)

        verify(buyerService, never()).createBuyer(any())
    }

    @Test
    @DisplayName("Should return 400 when registration data is invalid")
    fun shouldReturn400WhenRegistrationDataInvalid() {
        // Given - Missing required fields
        val invalidRequest =
            """
            {
                "email": "test@example.com",
                "password": ""
            }
            """.trimIndent()

        // When & Then
        mockMvc.perform(
            post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidRequest),
        )
            .andExpect(status().isBadRequest)
    }

    // ========== Get Current User Tests ==========

    @Test
    @DisplayName("Should get current user successfully")
    @WithMockUser(username = "buyer@example.com", roles = ["BUYER"])
    fun shouldGetCurrentUserSuccessfully() {
        // Given
        val buyer =
            Buyer().apply {
                id = 1L
                email = "buyer@example.com"
                firstName = "John"
                lastName = "Doe"
                phone = "1234567890"
                address = "Address"
                dni = 12345678
                active = true
            }

        `when`(userRepository.findByEmail("buyer@example.com")).thenReturn(buyer)

        // When & Then
        mockMvc.perform(get("/api/auth/me"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.email").value("buyer@example.com"))
            .andExpect(jsonPath("$.firstName").value("John"))
            .andExpect(jsonPath("$.lastName").value("Doe"))
            .andExpect(jsonPath("$.role").value("BUYER"))
    }
}
