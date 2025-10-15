package cta.service

import cta.enum.FuelType
import cta.enum.TransmissionType
import cta.model.Buyer
import cta.model.Car
import cta.model.FavoriteCar
import cta.repository.FavoriteCarRepository
import cta.web.dto.FavoriteCarCreateRequest
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.any
import org.mockito.Mockito.doNothing
import org.mockito.Mockito.never
import org.mockito.Mockito.verify
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import java.time.LocalDateTime
import java.util.Optional

@ExtendWith(MockitoExtension::class)
@DisplayName("FavoriteService Tests")
class FavoriteServiceTest {
    @Mock
    private lateinit var favoriteCarRepository: FavoriteCarRepository

    @Mock
    private lateinit var carService: CarService

    @Mock
    private lateinit var buyerService: BuyerService

    @InjectMocks
    private lateinit var favoriteService: FavoriteService

    private lateinit var validCar: Car
    private lateinit var validBuyer: Buyer
    private lateinit var validFavoriteCar: FavoriteCar

    @BeforeEach
    fun setup() {
        validCar =
            Car().apply {
                id = 1L
                brand = "Toyota"
                model = "Corolla"
                year = 2022
                mileage = 15000
                color = "White"
                fuelType = FuelType.GASOLINE
                transmission = TransmissionType.AUTOMATIC
                available = true
                publicationDate = LocalDateTime.now()
            }

        validBuyer =
            Buyer().apply {
                id = 1L
                email = "buyer@example.com"
                password = "password123"
                firstName = "John"
                lastName = "Doe"
                phone = "+54 11 1234-5678"
                address = "Av. Corrientes 1234"
                dni = 12345678
                active = true
            }

        validFavoriteCar =
            FavoriteCar().apply {
                id = 1L
                buyer = validBuyer
                car = validCar
                rating = 8
                comment = "Great car!"
                dateAdded = LocalDateTime.now()
                priceNotifications = true
            }
    }

    // ========== saveFavorite Tests ==========

    @Test
    @DisplayName("Should save favorite car successfully")
    fun shouldSaveFavoriteCarSuccessfully() {
        // Given
        val request =
            FavoriteCarCreateRequest(
                buyerId = 1L,
                carId = 1L,
                rating = 8,
                comment = "Great car!",
                dateAdded = LocalDateTime.now(),
                priceNotifications = true,
            )

        `when`(carService.findById(1L)).thenReturn(validCar)
        `when`(buyerService.findById(1L)).thenReturn(validBuyer)
        `when`(favoriteCarRepository.findFavoriteCarByBuyer(validBuyer)).thenReturn(emptyList())
        `when`(favoriteCarRepository.save(any(FavoriteCar::class.java))).thenReturn(validFavoriteCar)

        // When
        val result = favoriteService.saveFavorite(request)

        // Then
        assertNotNull(result)
        assertEquals(validBuyer, result.buyer)
        assertEquals(validCar, result.car)
        assertEquals(8, result.rating)
        assertEquals("Great car!", result.comment)
        verify(favoriteCarRepository).save(any(FavoriteCar::class.java))
    }

    @Test
    @DisplayName("Should throw exception when car is already in favorites")
    fun shouldThrowExceptionWhenCarAlreadyInFavorites() {
        // Given
        val request =
            FavoriteCarCreateRequest(
                buyerId = 1L,
                carId = 1L,
                rating = 8,
                comment = "Great car!",
                dateAdded = LocalDateTime.now(),
                priceNotifications = true,
            )

        val existingFavorites = listOf(validFavoriteCar)

        `when`(carService.findById(1L)).thenReturn(validCar)
        `when`(buyerService.findById(1L)).thenReturn(validBuyer)
        `when`(favoriteCarRepository.findFavoriteCarByBuyer(validBuyer)).thenReturn(existingFavorites)

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                favoriteService.saveFavorite(request)
            }
        assertEquals("Car with id 1 is already in favorites", exception.message)
        verify(favoriteCarRepository, never()).save(any(FavoriteCar::class.java))
    }

    @Test
    @DisplayName("Should throw exception when rating is less than 0")
    fun shouldThrowExceptionWhenRatingIsLessThanZero() {
        // Given
        val request =
            FavoriteCarCreateRequest(
                buyerId = 1L,
                carId = 1L,
                rating = -1,
                comment = "Test",
                dateAdded = LocalDateTime.now(),
                priceNotifications = true,
            )

        `when`(carService.findById(1L)).thenReturn(validCar)
        `when`(buyerService.findById(1L)).thenReturn(validBuyer)
        `when`(favoriteCarRepository.findFavoriteCarByBuyer(validBuyer)).thenReturn(emptyList())

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                favoriteService.saveFavorite(request)
            }
        assertEquals("Rating must be greater or equal 0", exception.message)
        verify(favoriteCarRepository, never()).save(any(FavoriteCar::class.java))
    }

    @Test
    @DisplayName("Should throw exception when rating is greater than 10")
    fun shouldThrowExceptionWhenRatingIsGreaterThan10() {
        // Given
        val request =
            FavoriteCarCreateRequest(
                buyerId = 1L,
                carId = 1L,
                rating = 11,
                comment = "Test",
                dateAdded = LocalDateTime.now(),
                priceNotifications = true,
            )

        `when`(carService.findById(1L)).thenReturn(validCar)
        `when`(buyerService.findById(1L)).thenReturn(validBuyer)
        `when`(favoriteCarRepository.findFavoriteCarByBuyer(validBuyer)).thenReturn(emptyList())

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                favoriteService.saveFavorite(request)
            }
        assertEquals("Rating must be less or equal 10", exception.message)
        verify(favoriteCarRepository, never()).save(any(FavoriteCar::class.java))
    }

    @Test
    @DisplayName("Should accept rating of 0")
    fun shouldAcceptRatingOfZero() {
        // Given
        val request =
            FavoriteCarCreateRequest(
                buyerId = 1L,
                carId = 1L,
                rating = 0,
                comment = "Not impressed",
                dateAdded = LocalDateTime.now(),
                priceNotifications = true,
            )

        val favoriteWithZeroRating =
            FavoriteCar().apply {
                id = 4L
                buyer = validBuyer
                car = validCar
                rating = 0
                comment = "Not impressed"
                dateAdded = LocalDateTime.now()
                priceNotifications = true
            }

        `when`(carService.findById(1L)).thenReturn(validCar)
        `when`(buyerService.findById(1L)).thenReturn(validBuyer)
        `when`(favoriteCarRepository.findFavoriteCarByBuyer(validBuyer)).thenReturn(emptyList())
        `when`(favoriteCarRepository.save(any(FavoriteCar::class.java))).thenReturn(favoriteWithZeroRating)

        // When
        val result = favoriteService.saveFavorite(request)

        // Then
        assertNotNull(result)
        assertEquals(0, result.rating)
        verify(favoriteCarRepository).save(any(FavoriteCar::class.java))
    }

    @Test
    @DisplayName("Should accept rating of 10")
    fun shouldAcceptRatingOf10() {
        // Given
        val request =
            FavoriteCarCreateRequest(
                buyerId = 1L,
                carId = 1L,
                rating = 10,
                comment = "Perfect!",
                dateAdded = LocalDateTime.now(),
                priceNotifications = true,
            )

        val favoriteWithMaxRating =
            FavoriteCar().apply {
                id = 5L
                buyer = validBuyer
                car = validCar
                rating = 10
                comment = "Perfect!"
                dateAdded = LocalDateTime.now()
                priceNotifications = true
            }

        `when`(carService.findById(1L)).thenReturn(validCar)
        `when`(buyerService.findById(1L)).thenReturn(validBuyer)
        `when`(favoriteCarRepository.findFavoriteCarByBuyer(validBuyer)).thenReturn(emptyList())
        `when`(favoriteCarRepository.save(any(FavoriteCar::class.java))).thenReturn(favoriteWithMaxRating)

        // When
        val result = favoriteService.saveFavorite(request)

        // Then
        assertNotNull(result)
        assertEquals(10, result.rating)
        verify(favoriteCarRepository).save(any(FavoriteCar::class.java))
    }

    @Test
    @DisplayName("Should throw exception when comment exceeds 1000 characters")
    fun shouldThrowExceptionWhenCommentExceeds1000Characters() {
        // Given
        val longComment = "a".repeat(1001)
        val request =
            FavoriteCarCreateRequest(
                buyerId = 1L,
                carId = 1L,
                rating = 8,
                comment = longComment,
                dateAdded = LocalDateTime.now(),
                priceNotifications = true,
            )

        `when`(carService.findById(1L)).thenReturn(validCar)
        `when`(buyerService.findById(1L)).thenReturn(validBuyer)
        `when`(favoriteCarRepository.findFavoriteCarByBuyer(validBuyer)).thenReturn(emptyList())

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                favoriteService.saveFavorite(request)
            }
        assertEquals("Observations cannot exceed 1000 characters", exception.message)
        verify(favoriteCarRepository, never()).save(any(FavoriteCar::class.java))
    }

    @Test
    @DisplayName("Should accept comment with exactly 1000 characters")
    fun shouldAcceptCommentWith1000Characters() {
        // Given
        val maxComment = "a".repeat(1000)
        val request =
            FavoriteCarCreateRequest(
                buyerId = 1L,
                carId = 1L,
                rating = 8,
                comment = maxComment,
                dateAdded = LocalDateTime.now(),
                priceNotifications = true,
            )

        val favoriteWithMaxComment =
            FavoriteCar().apply {
                id = 6L
                buyer = validBuyer
                car = validCar
                rating = 8
                comment = maxComment
                dateAdded = LocalDateTime.now()
                priceNotifications = true
            }

        `when`(carService.findById(1L)).thenReturn(validCar)
        `when`(buyerService.findById(1L)).thenReturn(validBuyer)
        `when`(favoriteCarRepository.findFavoriteCarByBuyer(validBuyer)).thenReturn(emptyList())
        `when`(favoriteCarRepository.save(any(FavoriteCar::class.java))).thenReturn(favoriteWithMaxComment)

        // When
        val result = favoriteService.saveFavorite(request)

        // Then
        assertNotNull(result)
        assertEquals(1000, result.comment?.length)
        verify(favoriteCarRepository).save(any(FavoriteCar::class.java))
    }

    @Test
    @DisplayName("Should throw exception when date is before year 2000")
    fun shouldThrowExceptionWhenDateIsBeforeYear2000() {
        // Given
        val request =
            FavoriteCarCreateRequest(
                buyerId = 1L,
                carId = 1L,
                rating = 8,
                comment = "Test",
                dateAdded = LocalDateTime.of(1999, 12, 31, 23, 59),
                priceNotifications = true,
            )

        `when`(carService.findById(1L)).thenReturn(validCar)
        `when`(buyerService.findById(1L)).thenReturn(validBuyer)
        `when`(favoriteCarRepository.findFavoriteCarByBuyer(validBuyer)).thenReturn(emptyList())

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                favoriteService.saveFavorite(request)
            }
        assertEquals("Car must be added as favorite after January 1, 2000", exception.message)
        verify(favoriteCarRepository, never()).save(any(FavoriteCar::class.java))
    }

    @Test
    @DisplayName("Should accept date exactly on January 1, 2000 00:00:01")
    fun shouldAcceptDateOnJanuary1_2000() {
        // Given
        val request =
            FavoriteCarCreateRequest(
                buyerId = 1L,
                carId = 1L,
                rating = 8,
                comment = "Test",
                dateAdded = LocalDateTime.of(2000, 1, 1, 0, 0, 1),
                priceNotifications = true,
            )

        val favoriteWithMinDate =
            FavoriteCar().apply {
                id = 7L
                buyer = validBuyer
                car = validCar
                rating = 8
                comment = "Test"
                dateAdded = LocalDateTime.of(2000, 1, 1, 0, 0, 1)
                priceNotifications = true
            }

        `when`(carService.findById(1L)).thenReturn(validCar)
        `when`(buyerService.findById(1L)).thenReturn(validBuyer)
        `when`(favoriteCarRepository.findFavoriteCarByBuyer(validBuyer)).thenReturn(emptyList())
        `when`(favoriteCarRepository.save(any(FavoriteCar::class.java))).thenReturn(favoriteWithMinDate)

        // When
        val result = favoriteService.saveFavorite(request)

        // Then
        assertNotNull(result)
        verify(favoriteCarRepository).save(any(FavoriteCar::class.java))
    }

    // ========== deleteFavoriteCar Tests ==========

    @Test
    @DisplayName("Should delete favorite car successfully")
    fun shouldDeleteFavoriteCarSuccessfully() {
        // Given
        `when`(favoriteCarRepository.findById(1L)).thenReturn(Optional.of(validFavoriteCar))
        doNothing().`when`(favoriteCarRepository).delete(any(FavoriteCar::class.java))

        // When
        favoriteService.deleteFavoriteCar(1L)

        // Then
        verify(favoriteCarRepository).findById(1L)
        verify(favoriteCarRepository).delete(validFavoriteCar)
    }

    @Test
    @DisplayName("Should throw exception when deleting non-existent favorite car")
    fun shouldThrowExceptionWhenDeletingNonExistentFavoriteCar() {
        // Given
        `when`(favoriteCarRepository.findById(999L)).thenReturn(Optional.empty())

        // When & Then
        val exception =
            assertThrows(Exception::class.java) {
                favoriteService.deleteFavoriteCar(999L)
            }
        assertEquals("Favorite car with ID 999 not found", exception.message)
        verify(favoriteCarRepository, never()).delete(any(FavoriteCar::class.java))
    }

    // ========== updateReview Tests ==========

    @Test
    @DisplayName("Should update review with both rating and comment")
    fun shouldUpdateReviewWithBothRatingAndComment() {
        // Given
        `when`(favoriteCarRepository.findById(1L)).thenReturn(Optional.of(validFavoriteCar))
        `when`(favoriteCarRepository.save(any(FavoriteCar::class.java))).thenReturn(validFavoriteCar)

        val updates =
            mapOf(
                "rating" to 9,
                "comment" to "Updated comment - even better!",
            )

        // When
        val result = favoriteService.updateReview(1L, updates)

        // Then
        assertEquals(9, result.rating)
        assertEquals("Updated comment - even better!", result.comment)
        verify(favoriteCarRepository).save(any(FavoriteCar::class.java))
    }

    @Test
    @DisplayName("Should update only rating")
    fun shouldUpdateOnlyRating() {
        // Given
        `when`(favoriteCarRepository.findById(1L)).thenReturn(Optional.of(validFavoriteCar))
        `when`(favoriteCarRepository.save(any(FavoriteCar::class.java))).thenReturn(validFavoriteCar)

        val originalComment = validFavoriteCar.comment

        val updates = mapOf("rating" to 10)

        // When
        val result = favoriteService.updateReview(1L, updates)

        // Then
        assertEquals(10, result.rating)
        assertEquals(originalComment, result.comment)
        verify(favoriteCarRepository).save(any(FavoriteCar::class.java))
    }

    @Test
    @DisplayName("Should update only comment")
    fun shouldUpdateOnlyComment() {
        // Given
        `when`(favoriteCarRepository.findById(1L)).thenReturn(Optional.of(validFavoriteCar))
        `when`(favoriteCarRepository.save(any(FavoriteCar::class.java))).thenReturn(validFavoriteCar)

        val originalRating = validFavoriteCar.rating

        val updates = mapOf("comment" to "New comment only")

        // When
        val result = favoriteService.updateReview(1L, updates)

        // Then
        assertEquals(originalRating, result.rating)
        assertEquals("New comment only", result.comment)
        verify(favoriteCarRepository).save(any(FavoriteCar::class.java))
    }

    @Test
    @DisplayName("Should throw exception when updating non-existent favorite car")
    fun shouldThrowExceptionWhenUpdatingNonExistentFavoriteCar() {
        // Given
        `when`(favoriteCarRepository.findById(999L)).thenReturn(Optional.empty())

        val updates = mapOf("rating" to 9)

        // When & Then
        val exception =
            assertThrows(Exception::class.java) {
                favoriteService.updateReview(999L, updates)
            }
        assertEquals("Favorite car with ID 999 not found", exception.message)
        verify(favoriteCarRepository, never()).save(any(FavoriteCar::class.java))
    }

    @Test
    @DisplayName("Should throw exception when updating with invalid rating less than 0")
    fun shouldThrowExceptionWhenUpdatingWithInvalidRatingLessThanZero() {
        // Given
        `when`(favoriteCarRepository.findById(1L)).thenReturn(Optional.of(validFavoriteCar))

        val updates = mapOf("rating" to -1)

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                favoriteService.updateReview(1L, updates)
            }
        assertEquals("Rating must be greater or equal 0", exception.message)
        verify(favoriteCarRepository, never()).save(any(FavoriteCar::class.java))
    }

    @Test
    @DisplayName("Should throw exception when updating with invalid rating greater than 10")
    fun shouldThrowExceptionWhenUpdatingWithInvalidRatingGreaterThan10() {
        // Given
        `when`(favoriteCarRepository.findById(1L)).thenReturn(Optional.of(validFavoriteCar))

        val updates = mapOf("rating" to 11)

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                favoriteService.updateReview(1L, updates)
            }
        assertEquals("Rating must be less or equal 10", exception.message)
        verify(favoriteCarRepository, never()).save(any(FavoriteCar::class.java))
    }

    @Test
    @DisplayName("Should throw exception when updating with comment exceeding 1000 characters")
    fun shouldThrowExceptionWhenUpdatingWithLongComment() {
        // Given
        `when`(favoriteCarRepository.findById(1L)).thenReturn(Optional.of(validFavoriteCar))

        val longComment = "a".repeat(1001)
        val updates = mapOf("comment" to longComment)

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                favoriteService.updateReview(1L, updates)
            }
        assertEquals("Observations cannot exceed 1000 characters", exception.message)
        verify(favoriteCarRepository, never()).save(any(FavoriteCar::class.java))
    }

    @Test
    @DisplayName("Should handle empty update map")
    fun shouldHandleEmptyUpdateMap() {
        // Given
        `when`(favoriteCarRepository.findById(1L)).thenReturn(Optional.of(validFavoriteCar))
        `when`(favoriteCarRepository.save(any(FavoriteCar::class.java))).thenReturn(validFavoriteCar)

        val originalRating = validFavoriteCar.rating
        val originalComment = validFavoriteCar.comment

        // When
        val result = favoriteService.updateReview(1L, emptyMap())

        // Then
        assertEquals(originalRating, result.rating)
        assertEquals(originalComment, result.comment)
        verify(favoriteCarRepository).save(any(FavoriteCar::class.java))
    }

    @Test
    @DisplayName("Should convert string rating to integer")
    fun shouldConvertStringRatingToInteger() {
        // Given
        `when`(favoriteCarRepository.findById(1L)).thenReturn(Optional.of(validFavoriteCar))
        `when`(favoriteCarRepository.save(any(FavoriteCar::class.java))).thenReturn(validFavoriteCar)

        val updates = mapOf("rating" to "7")

        // When
        val result = favoriteService.updateReview(1L, updates)

        // Then
        assertEquals(7, result.rating)
        verify(favoriteCarRepository).save(any(FavoriteCar::class.java))
    }

    // ========== Edge Cases ==========

    @Test
    @DisplayName("Should allow multiple favorites from same buyer for different cars")
    fun shouldAllowMultipleFavoritesFromSameBuyerForDifferentCars() {
        // Given
        val car2 =
            Car().apply {
                id = 2L
                brand = "Honda"
                model = "Civic"
                year = 2023
                mileage = 10000
                color = "Blue"
                fuelType = FuelType.GASOLINE
                transmission = TransmissionType.AUTOMATIC
                available = true
                publicationDate = LocalDateTime.now()
            }

        val existingFavorite =
            FavoriteCar().apply {
                id = 2L
                buyer = validBuyer
                car = validCar
                rating = 7
                comment = "First favorite"
                dateAdded = LocalDateTime.now()
                priceNotifications = true
            }

        val request =
            FavoriteCarCreateRequest(
                buyerId = 1L,
                carId = 2L,
                rating = 9,
                comment = "Second favorite",
                dateAdded = LocalDateTime.now(),
                priceNotifications = false,
            )

        val newFavorite =
            FavoriteCar().apply {
                id = 3L
                buyer = validBuyer
                car = car2
                rating = 9
                comment = "Second favorite"
                dateAdded = LocalDateTime.now()
                priceNotifications = false
            }

        `when`(carService.findById(2L)).thenReturn(car2)
        `when`(buyerService.findById(1L)).thenReturn(validBuyer)
        `when`(favoriteCarRepository.findFavoriteCarByBuyer(validBuyer)).thenReturn(listOf(existingFavorite))
        `when`(favoriteCarRepository.save(any(FavoriteCar::class.java))).thenReturn(newFavorite)

        // When
        val result = favoriteService.saveFavorite(request)

        // Then
        assertNotNull(result)
        assertEquals(2L, result.car.id)
        verify(favoriteCarRepository).save(any(FavoriteCar::class.java))
    }

    @Test
    @DisplayName("Should handle priceNotifications false")
    fun shouldHandlePriceNotificationsFalse() {
        // Given
        val request =
            FavoriteCarCreateRequest(
                buyerId = 1L,
                carId = 1L,
                rating = 5,
                comment = "Monitoring price",
                dateAdded = LocalDateTime.now(),
                priceNotifications = false,
            )

        val favoriteWithoutNotifications =
            FavoriteCar().apply {
                id = 8L
                buyer = validBuyer
                car = validCar
                rating = 5
                comment = "Monitoring price"
                dateAdded = LocalDateTime.now()
                priceNotifications = false
            }

        `when`(carService.findById(1L)).thenReturn(validCar)
        `when`(buyerService.findById(1L)).thenReturn(validBuyer)
        `when`(favoriteCarRepository.findFavoriteCarByBuyer(validBuyer)).thenReturn(emptyList())
        `when`(favoriteCarRepository.save(any(FavoriteCar::class.java))).thenReturn(favoriteWithoutNotifications)

        // When
        val result = favoriteService.saveFavorite(request)

        // Then
        assertNotNull(result)
        assertFalse(result.priceNotifications)
        verify(favoriteCarRepository).save(any(FavoriteCar::class.java))
    }
}
