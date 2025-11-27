package cta.model

import cta.enum.FuelType
import cta.enum.TransmissionType
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import java.math.BigDecimal
import java.time.LocalDateTime

@DisplayName("CarOffer Entity Tests")
class CarOfferTest {
    private lateinit var carOffer: CarOffer
    private lateinit var car: Car
    private lateinit var dealership: Dealership

    @BeforeEach
    fun setUp() {
        car =
            Car().apply {
                id = 1L
                brand = "Toyota"
                model = "Corolla"
                year = 2020
                fuelType = FuelType.GASOLINE
                transmission = TransmissionType.AUTOMATIC
                color = "White"
            }

        dealership =
            Dealership().apply {
                id = 1L
                businessName = "Test Dealership"
                cuit = "30-12345678-9"
                email = "contact@dealership.com"
                active = true
            }

        carOffer =
            CarOffer().apply {
                this.car = this@CarOfferTest.car
                this.dealership = this@CarOfferTest.dealership
                this.price = BigDecimal("25000.00")
                this.offerDate = LocalDateTime.now()
                this.dealershipNotes = "Excellent condition"
                this.available = true
            }
    }

    @Test
    @DisplayName("Should create new car offer with correct values")
    fun shouldCreateNewCarOffer() {
        assertNotNull(carOffer.car)
        assertNotNull(carOffer.dealership)
        assertEquals(car, carOffer.car)
        assertEquals(dealership, carOffer.dealership)
        assertEquals(BigDecimal("25000.00"), carOffer.price)
        assertNotNull(carOffer.offerDate)
        assertEquals("Excellent condition", carOffer.dealershipNotes)
        assertTrue(carOffer.available)
    }

    @Test
    @DisplayName("Should create new car offer with default values")
    fun shouldCreateNewCarOfferWithDefaultValues() {
        val newCarOffer = CarOffer()

        assertNull(newCarOffer.id)
        assertThrows(UninitializedPropertyAccessException::class.java) {
            newCarOffer.car
        }
        assertThrows(UninitializedPropertyAccessException::class.java) {
            newCarOffer.dealership
        }
        assertEquals(BigDecimal.ZERO, newCarOffer.price)
        assertNotNull(newCarOffer.offerDate)
        assertNull(newCarOffer.dealershipNotes)
        assertTrue(newCarOffer.available)
    }

    @Test
    @DisplayName("Should update price using updatePrice method")
    fun shouldUpdatePriceUsingUpdatePriceMethod() {
        val newPrice = BigDecimal("30000.00")
        carOffer.updatePrice(newPrice)
        assertEquals(newPrice, carOffer.price)
    }

    @Test
    @DisplayName("Should update price directly")
    fun shouldUpdatePriceDirectly() {
        val newPrice = BigDecimal("28000.00")
        carOffer.price = newPrice
        assertEquals(newPrice, carOffer.price)
    }

    @Test
    @DisplayName("Should mark car offer as not available")
    fun shouldMarkCarOfferAsSold() {
        carOffer.markAsUnavailable()
        assertFalse(carOffer.available)
    }

    @Test
    @DisplayName("Should mark car offer as available")
    fun shouldMarkCarOfferAsAvailable() {
        carOffer.available = false
        carOffer.markAsAvailable()
        assertTrue(carOffer.available)
    }

    @Test
    @DisplayName("Should update availability directly")
    fun shouldUpdateAvailabilityDirectly() {
        carOffer.available = false
        assertFalse(carOffer.available)
        carOffer.available = true
        assertTrue(carOffer.available)
    }

    @Test
    @DisplayName("Should update car reference")
    fun shouldUpdateCarReference() {
        val newCar =
            Car().apply {
                id = 2L
                brand = "Honda"
                model = "Civic"
            }
        carOffer.car = newCar
        assertEquals(newCar, carOffer.car)
        assertEquals(2L, carOffer.car.id)
    }

    @Test
    @DisplayName("Should update dealership reference")
    fun shouldUpdateDealershipReference() {
        val newDealership =
            Dealership().apply {
                id = 2L
                businessName = "New Dealership"
            }
        carOffer.dealership = newDealership
        assertEquals(newDealership, carOffer.dealership)
        assertEquals(2L, carOffer.dealership.id)
    }

    @Test
    @DisplayName("Should update offer date")
    fun shouldUpdateOfferDate() {
        val newDate = LocalDateTime.now().plusDays(1)
        carOffer.offerDate = newDate
        assertEquals(newDate, carOffer.offerDate)
    }

    @Test
    @DisplayName("Should update dealership notes")
    fun shouldUpdateDealershipNotes() {
        val newNotes = "Updated notes"
        carOffer.dealershipNotes = newNotes
        assertEquals(newNotes, carOffer.dealershipNotes)
    }

    @Test
    @DisplayName("Should clear dealership notes")
    fun shouldClearDealershipNotes() {
        carOffer.dealershipNotes = null
        assertNull(carOffer.dealershipNotes)
    }

    @Test
    @DisplayName("Should handle price with zero value")
    fun shouldHandlePriceWithZeroValue() {
        carOffer.price = BigDecimal.ZERO
        assertEquals(BigDecimal.ZERO, carOffer.price)
    }

    @Test
    @DisplayName("Should handle price with decimal values")
    fun shouldHandlePriceWithDecimalValues() {
        val priceWithDecimals = BigDecimal("25999.99")
        carOffer.price = priceWithDecimals
        assertEquals(priceWithDecimals, carOffer.price)
    }

    @Test
    @DisplayName("Should handle large price values")
    fun shouldHandleLargePriceValues() {
        val largePrice = BigDecimal("999999999.99")
        carOffer.price = largePrice
        assertEquals(largePrice, carOffer.price)
    }

    @Test
    @DisplayName("Should maintain price precision")
    fun shouldMaintainPricePrecision() {
        val precisePrice = BigDecimal("25000.50")
        carOffer.price = precisePrice
        assertEquals(precisePrice, carOffer.price)
        assertEquals(2, carOffer.price.scale())
    }

    @Test
    @DisplayName("Should toggle availability multiple times")
    fun shouldToggleAvailabilityMultipleTimes() {
        assertTrue(carOffer.available)

        carOffer.markAsUnavailable()
        assertFalse(carOffer.available)

        carOffer.markAsAvailable()
        assertTrue(carOffer.available)

        carOffer.markAsUnavailable()
        assertFalse(carOffer.available)
    }

    @Test
    @DisplayName("Should handle offer date in the past")
    fun shouldHandleOfferDateInThePast() {
        val pastDate = LocalDateTime.now().minusDays(7)
        carOffer.offerDate = pastDate
        assertEquals(pastDate, carOffer.offerDate)
        assertTrue(carOffer.offerDate.isBefore(LocalDateTime.now()))
    }

    @Test
    @DisplayName("Should handle long dealership notes")
    fun shouldHandleLongDealershipNotes() {
        val longNotes = "a".repeat(500)
        carOffer.dealershipNotes = longNotes
        assertEquals(500, carOffer.dealershipNotes!!.length)
        assertEquals(longNotes, carOffer.dealershipNotes)
    }

    @Test
    @DisplayName("Should maintain relationships after updates")
    fun shouldMaintainRelationshipsAfterUpdates() {
        val originalCar = carOffer.car
        val originalDealership = carOffer.dealership

        carOffer.price = BigDecimal("35000.00")
        carOffer.available = false
        carOffer.dealershipNotes = "Updated"

        assertEquals(originalCar, carOffer.car)
        assertEquals(originalDealership, carOffer.dealership)
    }

    @Test
    @DisplayName("Should create car offer without notes")
    fun shouldCreateCarOfferWithoutNotes() {
        val newCarOffer =
            CarOffer().apply {
                this.car = this@CarOfferTest.car
                this.dealership = this@CarOfferTest.dealership
                this.price = BigDecimal("20000.00")
                this.available = true
            }

        assertNull(newCarOffer.dealershipNotes)
        assertNotNull(newCarOffer.car)
        assertNotNull(newCarOffer.dealership)
    }

    @Test
    @DisplayName("Should handle multiple price updates")
    fun shouldHandleMultiplePriceUpdates() {
        carOffer.updatePrice(BigDecimal("26000.00"))
        assertEquals(BigDecimal("26000.00"), carOffer.price)

        carOffer.updatePrice(BigDecimal("27000.00"))
        assertEquals(BigDecimal("27000.00"), carOffer.price)

        carOffer.updatePrice(BigDecimal("28000.00"))
        assertEquals(BigDecimal("28000.00"), carOffer.price)
    }
}
