package cta.model

import cta.enum.UserRole
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNotEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test

@DisplayName("Buyer Entity Tests")
class BuyerTest {
    private lateinit var buyer: Buyer

    @BeforeEach
    fun setup() {
        buyer =
            Buyer().apply {
                email = "john.doe@example.com"
                password = "securePassword123"
                firstName = "John"
                lastName = "Doe"
                phone = "+54 11 1234-5678"
                address = "Av. Corrientes 1234, Buenos Aires"
                dni = 12345678
                active = true
            }
    }

    @Test
    @DisplayName("Should create buyer with default values")
    fun shouldCreateBuyerWithDefaults() {
        val newBuyer = Buyer()

        assertEquals("", newBuyer.address)
        assertEquals(0, newBuyer.dni)
        assertEquals(UserRole.BUYER, newBuyer.role)
    }

    @Test
    @DisplayName("Should have BUYER role")
    fun shouldHaveBuyerRole() {
        assertEquals(UserRole.BUYER, buyer.role)
    }

    @Test
    @DisplayName("Should create buyer using factory method")
    fun shouldCreateBuyerUsingFactoryMethod() {
        val newBuyer =
            Buyer.create(
                email = "jane.smith@example.com",
                password = "password456",
                firstName = "Jane",
                lastName = "Smith",
                phone = "+54 11 8765-4321",
                address = "Calle Florida 500, CABA",
                dni = 87654321,
            )

        assertEquals("jane.smith@example.com", newBuyer.email)
        assertEquals("password456", newBuyer.password)
        assertEquals("Jane", newBuyer.firstName)
        assertEquals("Smith", newBuyer.lastName)
        assertEquals("+54 11 8765-4321", newBuyer.phone)
        assertEquals("Calle Florida 500, CABA", newBuyer.address)
        assertEquals(87654321, newBuyer.dni)
        assertEquals(UserRole.BUYER, newBuyer.role)
        assertTrue(newBuyer.active)
    }

    @Test
    @DisplayName("Should set and get address correctly")
    fun shouldSetAndGetAddress() {
        val newAddress = "Av. Santa Fe 2000, Buenos Aires"

        buyer.address = newAddress

        assertEquals(newAddress, buyer.address)
    }

    @Test
    @DisplayName("Should set and get DNI correctly")
    fun shouldSetAndGetDni() {
        val newDni = 99999999

        buyer.dni = newDni

        assertEquals(newDni, buyer.dni)
    }

    @Test
    @DisplayName("Should update buyer information")
    fun shouldUpdateBuyerInformation() {
        buyer.email = "newemail@example.com"
        buyer.firstName = "UpdatedName"
        buyer.phone = "+54 11 9999-9999"
        buyer.address = "New Address 123"
        buyer.dni = 11111111

        assertEquals("newemail@example.com", buyer.email)
        assertEquals("UpdatedName", buyer.firstName)
        assertEquals("+54 11 9999-9999", buyer.phone)
        assertEquals("New Address 123", buyer.address)
        assertEquals(11111111, buyer.dni)
    }

    @Test
    @DisplayName("Should handle active status")
    fun shouldHandleActiveStatus() {
        buyer.active = true
        assertTrue(buyer.active)

        buyer.active = false
        assertFalse(buyer.active)
    }

    @Test
    @DisplayName("Should maintain role as BUYER even when other properties change")
    fun shouldMaintainRoleAsBuyer() {
        buyer.email = "changed@example.com"
        buyer.address = "Changed Address"
        buyer.dni = 99999999

        assertEquals(UserRole.BUYER, buyer.role)
    }

    @Test
    @DisplayName("Should create multiple buyers with different data")
    fun shouldCreateMultipleBuyers() {
        val buyer1 =
            Buyer.create(
                email = "buyer1@example.com",
                password = "pass1",
                firstName = "Buyer",
                lastName = "One",
                phone = "123456789",
                address = "Address 1",
                dni = 11111111,
            )

        val buyer2 =
            Buyer.create(
                email = "buyer2@example.com",
                password = "pass2",
                firstName = "Buyer",
                lastName = "Two",
                phone = "987654321",
                address = "Address 2",
                dni = 22222222,
            )

        assertNotEquals(buyer1.email, buyer2.email)
        assertNotEquals(buyer1.dni, buyer2.dni)
        assertEquals(UserRole.BUYER, buyer1.role)
        assertEquals(UserRole.BUYER, buyer2.role)
    }

    @Test
    @DisplayName("Should handle empty address")
    fun shouldHandleEmptyAddress() {
        buyer.address = ""

        assertEquals("", buyer.address)
    }

    @Test
    @DisplayName("Should handle zero DNI")
    fun shouldHandleZeroDni() {
        buyer.dni = 0

        assertEquals(0, buyer.dni)
    }

    @Test
    @DisplayName("Factory method should set active to true by default")
    fun factoryMethodShouldSetActiveToTrue() {
        val newBuyer =
            Buyer.create(
                email = "test@example.com",
                password = "test123",
                firstName = "Test",
                lastName = "User",
                phone = "123456",
                address = "Test Address",
                dni = 12345678,
            )

        assertTrue(newBuyer.active)
    }
}
