package cta.service

import cta.model.Buyer
import cta.model.Dealership
import cta.repository.UserRepository
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.security.core.userdetails.UsernameNotFoundException
import java.time.LocalDateTime

@ExtendWith(MockitoExtension::class)
@DisplayName("UserDetailsService Tests")
class UserDetailsServiceImplTest {
    @Mock
    private lateinit var userRepository: UserRepository

    @InjectMocks
    private lateinit var userDetailsService: UserDetailsServiceImpl

    private lateinit var validDealership: Dealership
    private lateinit var validBuyer: Buyer

    @BeforeEach
    fun setup() {
        validDealership =
            Dealership().apply {
                id = 2L
                businessName = "AutoMax S.A."
                cuit = "20123456789"
                email = "dealership@example.com"
                password = "encodedPassword456"
                phone = "1234567890"
                address = "Av. Corrientes 1234"
                city = "Buenos Aires"
                province = "Buenos Aires"
                firstName = "Juan"
                lastName = "Pérez"
                active = true
                registrationDate = LocalDateTime.now()
            }

        validBuyer =
            Buyer().apply {
                id = 3L
                email = "buyer@example.com"
                password = "encodedPassword789"
                firstName = "John"
                lastName = "Doe"
                phone = "+54 11 1234-5678"
                address = "Av. Corrientes 1234"
                dni = 12345678
                active = true
            }
    }

    @Test
    @DisplayName("Should assign ROLE_DEALERSHIP to dealership")
    fun shouldAssignCorrectRoleToDealership() {
        `when`(userRepository.findByEmail("dealership@example.com")).thenReturn(validDealership)

        val userDetails = userDetailsService.loadUserByUsername("dealership@example.com")

        assertEquals("ROLE_DEALERSHIP", userDetails.authorities.first().authority)
    }

    @Test
    @DisplayName("Should assign ROLE_BUYER to buyer")
    fun shouldAssignCorrectRoleToBuyer() {
        `when`(userRepository.findByEmail("buyer@example.com")).thenReturn(validBuyer)

        val userDetails = userDetailsService.loadUserByUsername("buyer@example.com")

        assertEquals("ROLE_BUYER", userDetails.authorities.first().authority)
    }

    @Test
    @DisplayName("Should throw UsernameNotFoundException when user not found")
    fun shouldThrowExceptionWhenUserNotFound() {
        `when`(userRepository.findByEmail("nonexistent@example.com")).thenReturn(null)

        assertThrows(UsernameNotFoundException::class.java) {
            userDetailsService.loadUserByUsername("nonexistent@example.com")
        }
    }

    @Test
    @DisplayName("Should respect active flag for enabled status")
    fun shouldRespectActiveFlag() {
        validBuyer.active = false
        `when`(userRepository.findByEmail("buyer@example.com")).thenReturn(validBuyer)

        val userDetails = userDetailsService.loadUserByUsername("buyer@example.com")

        assertFalse(userDetails.isEnabled)
    }
}
