package cta.model

import cta.enum.FuelType
import cta.enum.TransmissionType
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import java.math.BigDecimal
import java.time.LocalDateTime

@DisplayName("FavoriteCar Entity Tests")
class FavoriteCarTest {
    private lateinit var favoriteCar: FavoriteCar
    private lateinit var buyerT: Buyer
    private lateinit var carT: Car

    @BeforeEach
    fun setup() {
        // Create a buyer
        buyerT =
            Buyer().apply {
                email = "buyer@example.com"
                password = "password123"
                firstName = "John"
                lastName = "Doe"
                phone = "+54 11 1234-5678"
                address = "Av. Corrientes 1234"
                dni = 12345678
                active = true
            }

        // Create a car
        carT =
            Car().apply {
                brand = "Toyota"
                model = "Corolla"
                year = 2023
                price = BigDecimal("25000.00")
                mileage = 15000
                color = "Blue"
                fuelType = FuelType.GASOLINE
                transmission = TransmissionType.AUTOMATIC
                description = "Well maintained car"
                dealershipId = 1L
                available = true
            }

        // Create favorite car
        favoriteCar =
            FavoriteCar().apply {
                this.buyer = buyerT
                this.car = carT
                this.dateAdded = LocalDateTime.now()
                this.priceNotifications = false
            }
    }

    @Test
    @DisplayName("Should create favorite car with default values")
    fun shouldCreateFavoriteCarWithDefaults() {
        val newFavoriteCar = FavoriteCar()

        assertNull(newFavoriteCar.rating)
        assertNull(newFavoriteCar.comment)
        assertFalse(newFavoriteCar.priceNotifications)
        assertNotNull(newFavoriteCar.dateAdded)
    }

    @Test
    @DisplayName("Should associate buyer and car")
    fun shouldAssociateBuyerAndCar() {
        assertEquals(buyerT, favoriteCar.buyer)
        assertEquals(carT, favoriteCar.car)
    }

    @Test
    @DisplayName("Should set date added automatically")
    fun shouldSetDateAddedAutomatically() {
        val now = LocalDateTime.now()

        assertNotNull(favoriteCar.dateAdded)
        assertTrue(favoriteCar.dateAdded.isBefore(now.plusSeconds(1)))
        assertTrue(favoriteCar.dateAdded.isAfter(now.minusSeconds(1)))
    }

    @Test
    @DisplayName("Should enable notifications")
    fun shouldEnableNotifications() {
        assertFalse(favoriteCar.priceNotifications)

        favoriteCar.enableNotifications()

        assertTrue(favoriteCar.priceNotifications)
    }

    @Test
    @DisplayName("Should disable notifications")
    fun shouldDisableNotifications() {
        favoriteCar.priceNotifications = true

        favoriteCar.disableNotifications()

        assertFalse(favoriteCar.priceNotifications)
    }

    @Test
    @DisplayName("Should toggle notifications multiple times")
    fun shouldToggleNotificationsMultipleTimes() {
        favoriteCar.enableNotifications()
        assertTrue(favoriteCar.priceNotifications)

        favoriteCar.disableNotifications()
        assertFalse(favoriteCar.priceNotifications)

        favoriteCar.enableNotifications()
        assertTrue(favoriteCar.priceNotifications)
    }

    @Test
    @DisplayName("Should set and get rating")
    fun shouldSetAndGetRating() {
        assertNull(favoriteCar.rating)

        favoriteCar.rating = 5

        assertEquals(5, favoriteCar.rating)
    }

    @Test
    @DisplayName("Should handle different rating values")
    fun shouldHandleDifferentRatingValues() {
        favoriteCar.rating = 1
        assertEquals(1, favoriteCar.rating)

        favoriteCar.rating = 3
        assertEquals(3, favoriteCar.rating)

        favoriteCar.rating = 5
        assertEquals(5, favoriteCar.rating)
    }

    @Test
    @DisplayName("Should set rating to null")
    fun shouldSetRatingToNull() {
        favoriteCar.rating = 5
        assertEquals(5, favoriteCar.rating)

        favoriteCar.rating = null
        assertNull(favoriteCar.rating)
    }

    @Test
    @DisplayName("Should set and get comment")
    fun shouldSetAndGetComment() {
        assertNull(favoriteCar.comment)

        favoriteCar.comment = "This is my dream car!"

        assertEquals("This is my dream car!", favoriteCar.comment)
    }

    @Test
    @DisplayName("Should handle long comments")
    fun shouldHandleLongComments() {
        val longComment = "A".repeat(500)

        favoriteCar.comment = longComment

        assertEquals(longComment, favoriteCar.comment)
    }

    @Test
    @DisplayName("Should set comment to null")
    fun shouldSetCommentToNull() {
        favoriteCar.comment = "Initial comment"
        assertEquals("Initial comment", favoriteCar.comment)

        favoriteCar.comment = null
        assertNull(favoriteCar.comment)
    }

    @Test
    @DisplayName("Should update date added")
    fun shouldUpdateDateAdded() {
        val newDate = LocalDateTime.of(2024, 1, 15, 10, 30)

        favoriteCar.dateAdded = newDate

        assertEquals(newDate, favoriteCar.dateAdded)
    }

    @Test
    @DisplayName("Should allow changing associated buyer")
    fun shouldAllowChangingAssociatedBuyer() {
        val newBuyer =
            Buyer().apply {
                email = "newbuyer@example.com"
                firstName = "Jane"
                lastName = "Smith"
                dni = 87654321
            }

        favoriteCar.buyer = newBuyer

        assertEquals(newBuyer, favoriteCar.buyer)
        assertEquals("Jane", favoriteCar.buyer.firstName)
    }

    @Test
    @DisplayName("Should allow changing associated car")
    fun shouldAllowChangingAssociatedCar() {
        val newCar =
            Car().apply {
                brand = "Honda"
                model = "Civic"
                year = 2024
                price = BigDecimal("30000.00")
            }

        favoriteCar.car = newCar

        assertEquals(newCar, favoriteCar.car)
        assertEquals("Honda", favoriteCar.car.brand)
    }

    @Test
    @DisplayName("Should have notifications disabled by default")
    fun shouldHaveNotificationsDisabledByDefault() {
        val newFavoriteCar = FavoriteCar()

        assertFalse(newFavoriteCar.priceNotifications)
    }

    @Test
    @DisplayName("Should create favorite with all optional fields set")
    fun shouldCreateFavoriteWithAllOptionalFieldsSet() {
        val completeFavorite =
            FavoriteCar().apply {
                this.buyer = buyerT
                this.car = carT
                this.rating = 4
                this.comment = "Great car, good price"
                this.priceNotifications = true
            }

        assertEquals(buyerT, completeFavorite.buyer)
        assertEquals(carT, completeFavorite.car)
        assertEquals(4, completeFavorite.rating)
        assertEquals("Great car, good price", completeFavorite.comment)
        assertTrue(completeFavorite.priceNotifications)
    }

    @Test
    @DisplayName("Should enable notifications even if already enabled")
    fun shouldEnableNotificationsEvenIfAlreadyEnabled() {
        favoriteCar.enableNotifications()
        assertTrue(favoriteCar.priceNotifications)

        favoriteCar.enableNotifications()
        assertTrue(favoriteCar.priceNotifications)
    }

    @Test
    @DisplayName("Should disable notifications even if already disabled")
    fun shouldDisableNotificationsEvenIfAlreadyDisabled() {
        assertFalse(favoriteCar.priceNotifications)

        favoriteCar.disableNotifications()
        assertFalse(favoriteCar.priceNotifications)
    }
}
