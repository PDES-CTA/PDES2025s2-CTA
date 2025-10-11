package cta.model

import cta.enum.UserRole
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test

@DisplayName("Dealership Entity Tests")
class DealershipTest {
    private lateinit var dealership: Dealership

    @BeforeEach
    fun setup() {
        dealership =
            Dealership().apply {
                email = "contact@dealership.com"
                password = "securePassword123"
                firstName = "John"
                lastName = "Dealer"
                phone = "+54 11 1234-5678"
                businessName = "Premium Auto Sales"
                cuit = "20-12345678-9"
                address = "Av. Libertador 1000"
                city = "Buenos Aires"
                province = "CABA"
                description = "Leading car dealership in Argentina"
                active = true
            }
    }

    @Test
    @DisplayName("Should create dealership with default values")
    fun shouldCreateDealershipWithDefaults() {
        val newDealership = Dealership()

        assertEquals("", newDealership.businessName)
        assertEquals("", newDealership.cuit)
        assertNull(newDealership.address)
        assertNull(newDealership.city)
        assertNull(newDealership.province)
        assertNull(newDealership.description)
        assertEquals(UserRole.DEALERSHIP, newDealership.role)
    }

    @Test
    @DisplayName("Should have DEALERSHIP role")
    fun shouldHaveDealershipRole() {
        assertEquals(UserRole.DEALERSHIP, dealership.role)
    }

    @Test
    @DisplayName("Should get full address with all parts")
    fun shouldGetFullAddressWithAllParts() {
        val fullAddress = dealership.getFullAddress()

        assertEquals("Av. Libertador 1000, Buenos Aires, CABA", fullAddress)
    }

    @Test
    @DisplayName("Should get full address with only some parts")
    fun shouldGetFullAddressWithSomeParts() {
        dealership.address = "Calle Florida 500"
        dealership.city = "Buenos Aires"
        dealership.province = null

        val fullAddress = dealership.getFullAddress()

        assertEquals("Calle Florida 500, Buenos Aires", fullAddress)
    }

    @Test
    @DisplayName("Should return default message when no address parts available")
    fun shouldReturnDefaultMessageWhenNoAddress() {
        dealership.address = null
        dealership.city = null
        dealership.province = null

        val fullAddress = dealership.getFullAddress()

        assertEquals("Address not specified", fullAddress)
    }

    @Test
    @DisplayName("Should get display name using business name")
    fun shouldGetDisplayNameUsingBusinessName() {
        val displayName = dealership.getDisplayName()

        assertEquals("Premium Auto Sales", displayName)
    }

    @Test
    @DisplayName("Should get display name using first and last name when business name is blank")
    fun shouldGetDisplayNameUsingNamesWhenBusinessNameBlank() {
        dealership.businessName = ""

        val displayName = dealership.getDisplayName()

        assertEquals("John Dealer", displayName)
    }

    @Test
    @DisplayName("Should get display name using first and last name when business name is whitespace")
    fun shouldGetDisplayNameUsingNamesWhenBusinessNameWhitespace() {
        dealership.businessName = "   "

        val displayName = dealership.getDisplayName()

        assertEquals("John Dealer", displayName)
    }

    @Test
    @DisplayName("Should set and get business name")
    fun shouldSetAndGetBusinessName() {
        dealership.businessName = "New Dealership Name"

        assertEquals("New Dealership Name", dealership.businessName)
    }

    @Test
    @DisplayName("Should set and get CUIT")
    fun shouldSetAndGetCuit() {
        dealership.cuit = "20-99999999-9"

        assertEquals("20-99999999-9", dealership.cuit)
    }

    @Test
    @DisplayName("Should handle nullable description")
    fun shouldHandleNullableDescription() {
        dealership.description = null

        assertNull(dealership.description)

        dealership.description = "New description"

        assertEquals("New description", dealership.description)
    }

    @Test
    @DisplayName("Should maintain role as DEALERSHIP when properties change")
    fun shouldMaintainRoleAsDealership() {
        dealership.businessName = "Changed Name"
        dealership.cuit = "30-00000000-0"
        dealership.address = "Changed Address"

        assertEquals(UserRole.DEALERSHIP, dealership.role)
    }

    @Test
    @DisplayName("Should get full address with only city")
    fun shouldGetFullAddressWithOnlyCity() {
        dealership.address = null
        dealership.city = "Mendoza"
        dealership.province = null

        val fullAddress = dealership.getFullAddress()

        assertEquals("Mendoza", fullAddress)
    }
}
