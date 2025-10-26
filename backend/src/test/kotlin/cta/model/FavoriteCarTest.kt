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
import java.time.LocalDateTime

@DisplayName("FavoriteCar Entity Tests")
class FavoriteCarTest {
    private lateinit var favoriteCar: FavoriteCar
    private lateinit var car: Car
    private lateinit var buyer: Buyer

    @BeforeEach
    fun setUp() {
        buyer =
            Buyer().apply {
                id = 1L
                firstName = "John"
                lastName = "Doe"
                email = "john.doe@example.com"
                password = "password123"
                phone = "1234567890"
                dni = 12345678
                address = "123 Main St"
                registrationDate = LocalDateTime.now()
                active = true
            }

        car =
            Car().apply {
                id = 1L
                brand = "Toyota"
                model = "Corolla"
                year = 2023
                color = "Blue"
                fuelType = FuelType.GASOLINE
                transmission = TransmissionType.AUTOMATIC
            }

        favoriteCar =
            FavoriteCar().apply {
                this.car = this@FavoriteCarTest.car
                this.buyer = this@FavoriteCarTest.buyer
                this.dateAdded = LocalDateTime.now()
                this.rating = 5
                this.comment = "Great car!"
                this.priceNotifications = true
            }
    }

    @Test
    @DisplayName("Should create new favorite car with correct values")
    fun shouldCreateNewFavoriteCar() {
        assertNotNull(favoriteCar.car)
        assertNotNull(favoriteCar.buyer)
        assertEquals(car, favoriteCar.car)
        assertEquals(buyer, favoriteCar.buyer)
        assertNotNull(favoriteCar.dateAdded)
        assertEquals(5, favoriteCar.rating)
        assertEquals("Great car!", favoriteCar.comment)
        assertTrue(favoriteCar.priceNotifications)
    }

    @Test
    @DisplayName("Should create new favorite car with default (nullable) values")
    fun shouldCreateNewFavoriteCarWithDefaultValues() {
        val newFavoriteCar = FavoriteCar()

        assertNull(newFavoriteCar.id)

        assertThrows(UninitializedPropertyAccessException::class.java) {
            newFavoriteCar.car
        }
        assertThrows(UninitializedPropertyAccessException::class.java) {
            newFavoriteCar.buyer
        }

        assertNotNull(newFavoriteCar.dateAdded)
        assertNull(newFavoriteCar.rating)
        assertNull(newFavoriteCar.comment)
        assertFalse(newFavoriteCar.priceNotifications)
    }

    @Test
    @DisplayName("Should update rating correctly")
    fun shouldUpdateRating() {
        favoriteCar.updateRating(4)
        assertEquals(4, favoriteCar.rating)
    }

    @Test
    @DisplayName("Should clear rating correctly")
    fun shouldClearRating() {
        favoriteCar.updateRating(null)
        assertNull(favoriteCar.rating)
    }

    @Test
    @DisplayName("Should update comment correctly")
    fun shouldUpdateComment() {
        favoriteCar.updateComment("New comment")
        assertEquals("New comment", favoriteCar.comment)
    }

    @Test
    @DisplayName("Should clear comment correctly")
    fun shouldClearComment() {
        favoriteCar.updateComment(null)
        assertNull(favoriteCar.comment)
    }

    @Test
    @DisplayName("Should toggle price notifications correctly")
    fun shouldTogglePriceNotifications() {
        favoriteCar.togglePriceNotifications()
        assertFalse(favoriteCar.priceNotifications)

        favoriteCar.togglePriceNotifications()
        assertTrue(favoriteCar.priceNotifications)
    }

    @Test
    @DisplayName("Should enable price notifications correctly")
    fun shouldEnablePriceNotifications() {
        favoriteCar.priceNotifications = false
        favoriteCar.enablePriceNotifications()
        assertTrue(favoriteCar.priceNotifications)
    }

    @Test
    @DisplayName("Should disable price notifications correctly")
    fun shouldDisablePriceNotifications() {
        favoriteCar.priceNotifications = true
        favoriteCar.disablePriceNotifications()
        assertFalse(favoriteCar.priceNotifications)
    }

    @Test
    @DisplayName("Should check if reviewed (rating)")
    fun shouldCheckIfReviewedRating() {
        assertTrue(favoriteCar.isReviewed())

        favoriteCar.rating = null
        assertTrue(favoriteCar.isReviewed()) // Still reviewed due to comment

        favoriteCar.comment = null
        assertFalse(favoriteCar.isReviewed())
    }

    @Test
    @DisplayName("Should check if reviewed (comment)")
    fun shouldCheckIfReviewedComment() {
        assertTrue(favoriteCar.isReviewed())

        favoriteCar.comment = null
        assertTrue(favoriteCar.isReviewed()) // Still reviewed due to rating

        favoriteCar.rating = null
        assertFalse(favoriteCar.isReviewed())
    }

    @Test
    @DisplayName("Should update car reference")
    fun shouldUpdateCarReference() {
        val newCar =
            Car().apply {
                id = 2L
                brand = "Honda"
                model = "Civic"
                year = 2024
            }

        favoriteCar.car = newCar
        assertEquals(newCar, favoriteCar.car)
        assertEquals(2L, favoriteCar.car.id)
    }

    @Test
    @DisplayName("Should update buyer reference")
    fun shouldUpdateBuyerReference() {
        val newBuyer =
            Buyer().apply {
                id = 2L
                firstName = "Jane"
                lastName = "Smith"
            }

        favoriteCar.buyer = newBuyer
        assertEquals(newBuyer, favoriteCar.buyer)
        assertEquals(2L, favoriteCar.buyer.id)
    }
}
