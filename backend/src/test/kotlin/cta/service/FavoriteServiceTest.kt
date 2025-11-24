package cta.service

import cta.model.Buyer
import cta.model.Car
import cta.model.FavoriteCar
import cta.repository.FavoriteCarRepository
import cta.web.dto.FavoriteCarCreateRequest
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
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
                year = 2020
            }

        validBuyer =
            Buyer().apply {
                id = 1L
                firstName = "John"
                lastName = "Doe"
                email = "john@example.com"
                phone = "123456789"
            }

        validFavoriteCar =
            FavoriteCar().apply {
                id = 1L
                car = validCar
                buyer = validBuyer
                rating = 5
                comment = "Great car"
                dateAdded = LocalDateTime.now()
                priceNotifications = true
            }
    }

    // ========== findById Tests ==========

    @Test
    @DisplayName("Should find favorite car by id successfully")
    fun shouldFindFavoriteCarById() {
        // Given
        whenever(favoriteCarRepository.findById(1L)).thenReturn(Optional.of(validFavoriteCar))

        // When
        val result = favoriteService.findById(1L)

        // Then
        assertNotNull(result)
        assertEquals(1L, result.id)
        assertEquals(5, result.rating)
        verify(favoriteCarRepository).findById(1L)
    }

    @Test
    @DisplayName("Should throw exception when favorite car not found by id")
    fun shouldThrowExceptionWhenFavoriteCarNotFound() {
        // Given
        whenever(favoriteCarRepository.findById(999L)).thenReturn(Optional.empty())

        // When & Then
        val exception =
            assertThrows(NoSuchElementException::class.java) {
                favoriteService.findById(999L)
            }
        assertTrue(exception.message!!.contains("Favorite car with id 999 not found"))
        verify(favoriteCarRepository).findById(999L)
    }

    // ========== findByBuyerId Tests ==========

    @Test
    @DisplayName("Should find favorite cars by buyer id")
    fun shouldFindFavoriteCarsByBuyerId() {
        // Given
        val favorites = listOf(validFavoriteCar, validFavoriteCar)
        whenever(favoriteCarRepository.findByBuyerId(1L)).thenReturn(favorites)

        // When
        val result = favoriteService.findByBuyerId(1L)

        // Then
        assertEquals(2, result.size)
        verify(favoriteCarRepository).findByBuyerId(1L)
    }

    @Test
    @DisplayName("Should return empty list when buyer has no favorites")
    fun shouldReturnEmptyListWhenBuyerHasNoFavorites() {
        // Given
        whenever(favoriteCarRepository.findByBuyerId(1L)).thenReturn(emptyList())

        // When
        val result = favoriteService.findByBuyerId(1L)

        // Then
        assertTrue(result.isEmpty())
        verify(favoriteCarRepository).findByBuyerId(1L)
    }

    // ========== findByCarId Tests ==========

    @Test
    @DisplayName("Should find favorite cars by car id")
    fun shouldFindFavoriteCarsByCarId() {
        // Given
        val favorites = listOf(validFavoriteCar)
        whenever(favoriteCarRepository.findByCarId(1L)).thenReturn(favorites)

        // When
        val result = favoriteService.findByCarId(1L)

        // Then
        assertEquals(1, result.size)
        verify(favoriteCarRepository).findByCarId(1L)
    }

    @Test
    @DisplayName("Should return empty list when car has no favorites")
    fun shouldReturnEmptyListWhenCarHasNoFavorites() {
        // Given
        whenever(favoriteCarRepository.findByCarId(1L)).thenReturn(emptyList())

        // When
        val result = favoriteService.findByCarId(1L)

        // Then
        assertTrue(result.isEmpty())
        verify(favoriteCarRepository).findByCarId(1L)
    }

    // ========== saveFavorite Tests ==========

    @Test
    @DisplayName("Should save favorite car successfully")
    fun shouldSaveFavoriteCar() {
        // Given
        val request =
            FavoriteCarCreateRequest(
                buyerId = 1L,
                carId = 1L,
                rating = 5,
                comment = "Great car",
                dateAdded = LocalDateTime.now(),
                priceNotifications = true,
            )

        whenever(carService.findById(1L)).thenReturn(validCar)
        whenever(buyerService.findById(1L)).thenReturn(validBuyer)
        whenever(favoriteCarRepository.findByBuyerIdAndCarId(1L, 1L)).thenReturn(null)
        whenever(favoriteCarRepository.save(any<FavoriteCar>())).thenReturn(validFavoriteCar)

        // When
        val result = favoriteService.saveFavorite(request)

        // Then
        assertNotNull(result)
        assertEquals(1L, result.id)
        verify(carService).findById(1L)
        verify(buyerService).findById(1L)
        verify(favoriteCarRepository).save(any<FavoriteCar>())
    }

    @Test
    @DisplayName("Should save favorite car without comment")
    fun shouldSaveFavoriteCarWithBlankComment() {
        // Given
        val request =
            FavoriteCarCreateRequest(
                buyerId = 1L,
                carId = 1L,
                rating = 5,
                comment = "",
                dateAdded = LocalDateTime.now(),
                priceNotifications = true,
            )

        whenever(carService.findById(1L)).thenReturn(validCar)
        whenever(buyerService.findById(1L)).thenReturn(validBuyer)
        whenever(favoriteCarRepository.findByBuyerIdAndCarId(1L, 1L)).thenReturn(null)
        whenever(favoriteCarRepository.save(any<FavoriteCar>())).thenReturn(validFavoriteCar)

        // When
        val result = favoriteService.saveFavorite(request)

        // Then
        assertNotNull(result)
        verify(favoriteCarRepository).save(any<FavoriteCar>())
    }

    @Test
    @DisplayName("Should convert blank comment to null when saving")
    fun shouldConvertBlankCommentToNullWhenSaving() {
        // Given
        val request =
            FavoriteCarCreateRequest(
                buyerId = 1L,
                carId = 1L,
                rating = 5,
                comment = "   ",
                dateAdded = LocalDateTime.now(),
                priceNotifications = true,
            )

        whenever(carService.findById(1L)).thenReturn(validCar)
        whenever(buyerService.findById(1L)).thenReturn(validBuyer)
        whenever(favoriteCarRepository.findByBuyerIdAndCarId(1L, 1L)).thenReturn(null)
        whenever(favoriteCarRepository.save(any<FavoriteCar>())).thenReturn(validFavoriteCar)

        // When
        val result = favoriteService.saveFavorite(request)

        // Then
        assertNotNull(result)
        verify(favoriteCarRepository).save(any<FavoriteCar>())
    }

    @Test
    @DisplayName("Should throw exception when buyer already has car as favorite")
    fun shouldThrowExceptionWhenBuyerAlreadyHasCarAsFavorite() {
        // Given
        val request =
            FavoriteCarCreateRequest(
                buyerId = 1L,
                carId = 1L,
                rating = 5,
                comment = "Great car",
                dateAdded = LocalDateTime.now(),
                priceNotifications = true,
            )

        whenever(carService.findById(1L)).thenReturn(validCar)
        whenever(buyerService.findById(1L)).thenReturn(validBuyer)
        whenever(favoriteCarRepository.findByBuyerIdAndCarId(1L, 1L)).thenReturn(validFavoriteCar)

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                favoriteService.saveFavorite(request)
            }
        assertTrue(exception.message!!.contains("already has car"))
        verify(favoriteCarRepository, never()).save(any<FavoriteCar>())
    }

    @Test
    @DisplayName("Should throw exception when rating is below minimum")
    fun shouldThrowExceptionWhenRatingBelowMinimum() {
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

        whenever(carService.findById(1L)).thenReturn(validCar)
        whenever(buyerService.findById(1L)).thenReturn(validBuyer)
        whenever(favoriteCarRepository.findByBuyerIdAndCarId(1L, 1L)).thenReturn(null)

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                favoriteService.saveFavorite(request)
            }
        assertTrue(exception.message!!.contains("Rating must be between 0 and 10"))
        verify(favoriteCarRepository, never()).save(any<FavoriteCar>())
    }

    @Test
    @DisplayName("Should throw exception when rating is above maximum")
    fun shouldThrowExceptionWhenRatingAboveMaximum() {
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

        whenever(carService.findById(1L)).thenReturn(validCar)
        whenever(buyerService.findById(1L)).thenReturn(validBuyer)
        whenever(favoriteCarRepository.findByBuyerIdAndCarId(1L, 1L)).thenReturn(null)

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                favoriteService.saveFavorite(request)
            }
        assertTrue(exception.message!!.contains("Rating must be between 0 and 10"))
        verify(favoriteCarRepository, never()).save(any<FavoriteCar>())
    }

    @Test
    @DisplayName("Should throw exception when comment exceeds 1000 characters")
    fun shouldThrowExceptionWhenCommentTooLong() {
        // Given
        val request =
            FavoriteCarCreateRequest(
                buyerId = 1L,
                carId = 1L,
                rating = 5,
                comment = "a".repeat(1001),
                dateAdded = LocalDateTime.now(),
                priceNotifications = true,
            )

        whenever(carService.findById(1L)).thenReturn(validCar)
        whenever(buyerService.findById(1L)).thenReturn(validBuyer)
        whenever(favoriteCarRepository.findByBuyerIdAndCarId(1L, 1L)).thenReturn(null)

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                favoriteService.saveFavorite(request)
            }
        assertTrue(exception.message!!.contains("Comment cannot exceed 1000 characters"))
        verify(favoriteCarRepository, never()).save(any<FavoriteCar>())
    }

    // ========== deleteFavoriteCar Tests ==========

    @Test
    @DisplayName("Should delete favorite car successfully")
    fun shouldDeleteFavoriteCar() {
        // Given
        whenever(favoriteCarRepository.findById(1L)).thenReturn(Optional.of(validFavoriteCar))

        // When
        favoriteService.deleteFavoriteCar(1L)

        // Then
        verify(favoriteCarRepository).delete(validFavoriteCar)
    }

    @Test
    @DisplayName("Should throw exception when deleting non-existent favorite car")
    fun shouldThrowExceptionWhenDeletingNonExistentFavoriteCar() {
        // Given
        whenever(favoriteCarRepository.findById(999L)).thenReturn(Optional.empty())

        // When & Then
        assertThrows(NoSuchElementException::class.java) {
            favoriteService.deleteFavoriteCar(999L)
        }
        verify(favoriteCarRepository, never()).delete(any<FavoriteCar>())
    }

    // ========== updateReview (with parameters) Tests ==========

    @Test
    @DisplayName("Should update review with rating and comment")
    fun shouldUpdateReviewWithRatingAndComment() {
        // Given
        whenever(favoriteCarRepository.findById(1L)).thenReturn(Optional.of(validFavoriteCar))
        whenever(favoriteCarRepository.save(any<FavoriteCar>())).thenReturn(validFavoriteCar)

        // When
        val result = favoriteService.updateReview(1L, 8, "Updated comment")

        // Then
        assertNotNull(result)
        verify(favoriteCarRepository).save(any<FavoriteCar>())
    }

    @Test
    @DisplayName("Should update review with only rating")
    fun shouldUpdateReviewWithOnlyRating() {
        // Given
        whenever(favoriteCarRepository.findById(1L)).thenReturn(Optional.of(validFavoriteCar))
        whenever(favoriteCarRepository.save(any<FavoriteCar>())).thenReturn(validFavoriteCar)

        // When
        val result = favoriteService.updateReview(1L, 8, null)

        // Then
        assertNotNull(result)
        verify(favoriteCarRepository).save(any<FavoriteCar>())
    }

    @Test
    @DisplayName("Should update review with only comment")
    fun shouldUpdateReviewWithOnlyComment() {
        // Given
        whenever(favoriteCarRepository.findById(1L)).thenReturn(Optional.of(validFavoriteCar))
        whenever(favoriteCarRepository.save(any<FavoriteCar>())).thenReturn(validFavoriteCar)

        // When
        val result = favoriteService.updateReview(1L, null, "Updated comment")

        // Then
        assertNotNull(result)
        verify(favoriteCarRepository).save(any<FavoriteCar>())
    }

    @Test
    @DisplayName("Should convert blank comment to null when updating")
    fun shouldConvertBlankCommentToNullWhenUpdating() {
        // Given
        whenever(favoriteCarRepository.findById(1L)).thenReturn(Optional.of(validFavoriteCar))
        whenever(favoriteCarRepository.save(any<FavoriteCar>())).thenReturn(validFavoriteCar)

        // When
        val result = favoriteService.updateReview(1L, 5, "   ")

        // Then
        assertNotNull(result)
        verify(favoriteCarRepository).save(any<FavoriteCar>())
    }

    @Test
    @DisplayName("Should throw exception when updating review with invalid rating")
    fun shouldThrowExceptionWhenUpdatingWithInvalidRating() {
        // Given
        whenever(favoriteCarRepository.findById(1L)).thenReturn(Optional.of(validFavoriteCar))

        // When & Then
        assertThrows(IllegalArgumentException::class.java) {
            favoriteService.updateReview(1L, 11, "Test")
        }
        verify(favoriteCarRepository, never()).save(any<FavoriteCar>())
    }

    @Test
    @DisplayName("Should throw exception when updating review with comment too long")
    fun shouldThrowExceptionWhenUpdatingWithCommentTooLong() {
        // Given
        whenever(favoriteCarRepository.findById(1L)).thenReturn(Optional.of(validFavoriteCar))

        // When & Then
        assertThrows(IllegalArgumentException::class.java) {
            favoriteService.updateReview(1L, 5, "a".repeat(1001))
        }
        verify(favoriteCarRepository, never()).save(any<FavoriteCar>())
    }

    // ========== updateReview (with map) Tests ==========

    @Test
    @DisplayName("Should update review using map with rating and comment")
    fun shouldUpdateReviewUsingMapWithRatingAndComment() {
        // Given
        val updateData = mapOf("rating" to 8, "comment" to "Updated comment")
        whenever(favoriteCarRepository.findById(1L)).thenReturn(Optional.of(validFavoriteCar))
        whenever(favoriteCarRepository.save(any<FavoriteCar>())).thenReturn(validFavoriteCar)

        // When
        val result = favoriteService.updateReview(1L, updateData)

        // Then
        assertNotNull(result)
        verify(favoriteCarRepository).save(any<FavoriteCar>())
    }

    @Test
    @DisplayName("Should update review using map with only rating")
    fun shouldUpdateReviewUsingMapWithOnlyRating() {
        // Given
        val updateData = mapOf("rating" to 8)
        whenever(favoriteCarRepository.findById(1L)).thenReturn(Optional.of(validFavoriteCar))
        whenever(favoriteCarRepository.save(any<FavoriteCar>())).thenReturn(validFavoriteCar)

        // When
        val result = favoriteService.updateReview(1L, updateData)

        // Then
        assertNotNull(result)
        verify(favoriteCarRepository).save(any<FavoriteCar>())
    }

    @Test
    @DisplayName("Should update review using map with only comment")
    fun shouldUpdateReviewUsingMapWithOnlyComment() {
        // Given
        val updateData = mapOf("comment" to "Updated comment")
        whenever(favoriteCarRepository.findById(1L)).thenReturn(Optional.of(validFavoriteCar))
        whenever(favoriteCarRepository.save(any<FavoriteCar>())).thenReturn(validFavoriteCar)

        // When
        val result = favoriteService.updateReview(1L, updateData)

        // Then
        assertNotNull(result)
        verify(favoriteCarRepository).save(any<FavoriteCar>())
    }

    @Test
    @DisplayName("Should convert blank comment to null when updating with map")
    fun shouldConvertBlankCommentToNullWhenUpdatingWithMap() {
        // Given
        val updateData = mapOf("comment" to "   ")
        whenever(favoriteCarRepository.findById(1L)).thenReturn(Optional.of(validFavoriteCar))
        whenever(favoriteCarRepository.save(any<FavoriteCar>())).thenReturn(validFavoriteCar)

        // When
        val result = favoriteService.updateReview(1L, updateData)

        // Then
        assertNotNull(result)
        verify(favoriteCarRepository).save(any<FavoriteCar>())
    }

    @Test
    @DisplayName("Should update review with empty map")
    fun shouldUpdateReviewWithEmptyMap() {
        // Given
        val updateData = emptyMap<String, Any>()
        whenever(favoriteCarRepository.findById(1L)).thenReturn(Optional.of(validFavoriteCar))
        whenever(favoriteCarRepository.save(any<FavoriteCar>())).thenReturn(validFavoriteCar)

        // When
        val result = favoriteService.updateReview(1L, updateData)

        // Then
        assertNotNull(result)
        verify(favoriteCarRepository).save(any<FavoriteCar>())
    }

    @Test
    @DisplayName("Should throw exception when updating review with map containing invalid rating")
    fun shouldThrowExceptionWhenUpdatingWithMapContainingInvalidRating() {
        // Given
        val updateData = mapOf("rating" to -1)
        whenever(favoriteCarRepository.findById(1L)).thenReturn(Optional.of(validFavoriteCar))

        // When & Then
        assertThrows(IllegalArgumentException::class.java) {
            favoriteService.updateReview(1L, updateData)
        }
        verify(favoriteCarRepository, never()).save(any<FavoriteCar>())
    }

    @Test
    @DisplayName("Should throw exception when updating non-existent favorite with map")
    fun shouldThrowExceptionWhenUpdatingNonExistentFavoriteWithMap() {
        // Given
        val updateData = mapOf("rating" to 5)
        whenever(favoriteCarRepository.findById(999L)).thenReturn(Optional.empty())

        // When & Then
        assertThrows(NoSuchElementException::class.java) {
            favoriteService.updateReview(999L, updateData)
        }
        verify(favoriteCarRepository, never()).save(any<FavoriteCar>())
    }
}
