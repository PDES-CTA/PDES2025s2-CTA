package cta.model

import cta.enum.UserRole
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test

@DisplayName("User (via Buyer) Tests")
class UserTest {
    private lateinit var user: Buyer

    @BeforeEach
    fun setup() {
        user =
            Buyer().apply {
                email = "user@example.com"
                password = "password123"
                firstName = "John"
                lastName = "Doe"
                phone = "+54 11 1234-5678"
                address = "Av. Corrientes 1234"
                dni = 12345678
                active = true
            }
    }

    @Test
    @DisplayName("Should login successfully with correct credentials")
    fun shouldLoginSuccessfully() {
        val result = user.login("user@example.com", "password123")

        assertTrue(result)
    }

    @Test
    @DisplayName("Should fail login with incorrect email")
    fun shouldFailLoginWithIncorrectEmail() {
        val result = user.login("wrong@example.com", "password123")

        assertFalse(result)
    }

    @Test
    @DisplayName("Should fail login with incorrect password")
    fun shouldFailLoginWithIncorrectPassword() {
        val result = user.login("user@example.com", "wrongpassword")

        assertFalse(result)
    }

    @Test
    @DisplayName("Should fail login when user is inactive")
    fun shouldFailLoginWhenUserInactive() {
        user.active = false

        val result = user.login("user@example.com", "password123")

        assertFalse(result)
    }

    @Test
    @DisplayName("Should update profile with provided data")
    fun shouldUpdateProfile() {
        val updates =
            mapOf(
                "firstName" to "Jane",
                "lastName" to "Smith",
                "phone" to "+54 11 9999-9999",
            )

        user.updateProfile(updates)

        assertEquals("Jane", user.firstName)
        assertEquals("Smith", user.lastName)
        assertEquals("+54 11 9999-9999", user.phone)
    }

    @Test
    @DisplayName("Should update only provided fields in profile")
    fun shouldUpdateOnlyProvidedFields() {
        val originalFirstName = user.firstName
        val originalPhone = user.phone

        val updates =
            mapOf(
                "lastName" to "UpdatedLastName",
            )

        user.updateProfile(updates)

        assertEquals(originalFirstName, user.firstName)
        assertEquals("UpdatedLastName", user.lastName)
        assertEquals(originalPhone, user.phone)
    }

    @Test
    @DisplayName("Should handle empty update map")
    fun shouldHandleEmptyUpdateMap() {
        val originalFirstName = user.firstName
        val originalLastName = user.lastName
        val originalPhone = user.phone

        user.updateProfile(emptyMap())

        assertEquals(originalFirstName, user.firstName)
        assertEquals(originalLastName, user.lastName)
        assertEquals(originalPhone, user.phone)
    }

    @Test
    @DisplayName("Should check if user is active")
    fun shouldCheckIfUserIsActive() {
        assertTrue(user.isActive())

        user.active = false

        assertFalse(user.isActive())
    }

    @Test
    @DisplayName("Should deactivate user")
    fun shouldDeactivateUser() {
        assertTrue(user.active)

        user.deactivate()

        assertFalse(user.active)
        assertFalse(user.isActive())
    }

    @Test
    @DisplayName("Should activate user")
    fun shouldActivateUser() {
        user.active = false
        assertFalse(user.active)

        user.activate()

        assertTrue(user.active)
        assertTrue(user.isActive())
    }

    @Test
    @DisplayName("Should toggle active status multiple times")
    fun shouldToggleActiveStatusMultipleTimes() {
        user.deactivate()
        assertFalse(user.active)

        user.activate()
        assertTrue(user.active)

        user.deactivate()
        assertFalse(user.active)
    }

    @Test
    @DisplayName("Should not login after deactivation")
    fun shouldNotLoginAfterDeactivation() {
        assertTrue(user.login("user@example.com", "password123"))

        user.deactivate()

        assertFalse(user.login("user@example.com", "password123"))
    }

    @Test
    @DisplayName("Should login after reactivation")
    fun shouldLoginAfterReactivation() {
        user.deactivate()
        assertFalse(user.login("user@example.com", "password123"))

        user.activate()

        assertTrue(user.login("user@example.com", "password123"))
    }

    @Test
    @DisplayName("Should set registration date automatically")
    fun shouldSetRegistrationDateAutomatically() {
        assertNotNull(user.registrationDate)
    }

    @Test
    @DisplayName("Should have correct role for buyer")
    fun shouldHaveCorrectRoleForBuyer() {
        assertEquals(UserRole.BUYER, user.role)
    }

    @Test
    @DisplayName("Should handle login with empty credentials")
    fun shouldHandleLoginWithEmptyCredentials() {
        assertFalse(user.login("", ""))
        assertFalse(user.login("", "password123"))
        assertFalse(user.login("user@example.com", ""))
    }

    @Test
    @DisplayName("Should be case sensitive for login")
    fun shouldBeCaseSensitiveForLogin() {
        assertFalse(user.login("USER@EXAMPLE.COM", "password123"))
        assertFalse(user.login("user@example.com", "PASSWORD123"))
    }

    @Test
    @DisplayName("Should update profile with same values")
    fun shouldUpdateProfileWithSameValues() {
        val updates =
            mapOf(
                "firstName" to "John",
                "lastName" to "Doe",
                "phone" to "+54 11 1234-5678",
            )

        user.updateProfile(updates)

        assertEquals("John", user.firstName)
        assertEquals("Doe", user.lastName)
        assertEquals("+54 11 1234-5678", user.phone)
    }
}
