package cta.service

import cta.enum.FuelType
import cta.enum.TransmissionType
import cta.model.Buyer
import cta.model.Car
import cta.model.FavoriteCar
import cta.repository.FavoriteCarRepository
import cta.web.dto.FavoriteCarCreateRequest
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.ArgumentMatchers.any
import org.mockito.InjectMocks
import org.mockito.Mock
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
                plate = "ABC123"
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
                firstName = "John"
                lastName = "Doe"
                email = "john.doe@example.com"
                password = "password"
                phone = "123456789"
                dni = 12345678
                address = "123 Main St"
                registrationDate = LocalDateTime.now()
                active = true
            }

        validFavoriteCar =
            FavoriteCar().apply {
                id = 1L
                car = validCar
                buyer = validBuyer
                dateAdded = LocalDateTime.now()
                rating = 5
                comment = "Excellent car"
                priceNotifications = true
            }
    }

    // ========== findById Tests ==========
    @Test
    @DisplayName("Should find favorite car by id")
    fun shouldFindFavoriteCarById() {
        `when`(favoriteCarRepository.findById(1L)).thenReturn(Optional.of(validFavoriteCar))
        val result = favoriteService.findById(1L)
        assertNotNull(result)
        assertEquals(1L, result.id)
        verify(favoriteCarRepository).findById(1L)
    }

    @Test
    @DisplayName("Should throw exception when favorite car not found by id")
    fun shouldThrowExceptionWhenFavoriteCarNotFoundById() {
        `when`(favoriteCarRepository.findById(999L)).thenReturn(Optional.empty())
        val exception =
            assertThrows(NoSuchElementException::class.java) {
                favoriteService.findById(999L)
            }
        assertEquals("Favorite car with id 999 not found", exception.message)
    }

    // ========== saveFavorite Tests ==========
    @Test
    @DisplayName("Should create favorite car successfully")
    fun shouldCreateFavoriteCar() {
        val createRequest =
            FavoriteCarCreateRequest(
                buyerId = 1L,
                carId = 1L,
                dateAdded = LocalDateTime.now(),
                rating = 5,
                comment = "Loved it!",
                priceNotifications = true,
            )

        `when`(buyerService.findById(1L)).thenReturn(validBuyer)
        `when`(carService.findById(1L)).thenReturn(validCar)
        `when`(favoriteCarRepository.findByBuyerIdAndCarId(1L, 1L)).thenReturn(null)
        `when`(favoriteCarRepository.save(any(FavoriteCar::class.java))).thenReturn(validFavoriteCar)

        val result = favoriteService.saveFavorite(createRequest)
        assertNotNull(result)
        assertEquals(5, result.rating)
        assertEquals("Excellent car", result.comment)
        verify(favoriteCarRepository).save(any(FavoriteCar::class.java))
    }

    @Test
    @DisplayName("Should throw exception when buyer not found on create")
    fun shouldThrowExceptionWhenBuyerNotFoundOnCreate() {
        val createRequest =
            FavoriteCarCreateRequest(
                buyerId = 999L,
                carId = 1L,
                dateAdded = LocalDateTime.now(),
                rating = 5,
                comment = "Test",
                priceNotifications = false,
            )
        `when`(buyerService.findById(999L)).thenThrow(NoSuchElementException("Buyer with id 999 not found"))

        val exception =
            assertThrows(NoSuchElementException::class.java) {
                favoriteService.saveFavorite(createRequest)
            }
        assertEquals("Buyer with id 999 not found", exception.message)
    }

    @Test
    @DisplayName("Should throw exception when car not found on create")
    fun shouldThrowExceptionWhenCarNotFoundOnCreate() {
        val createRequest =
            FavoriteCarCreateRequest(
                buyerId = 1L,
                carId = 999L,
                dateAdded = LocalDateTime.now(),
                rating = 5,
                comment = "Test",
                priceNotifications = false,
            )
        
        `when`(carService.findById(999L)).thenThrow(NoSuchElementException("Car with id 999 not found"))

        val exception =
            assertThrows(NoSuchElementException::class.java) {
                favoriteService.saveFavorite(createRequest)
            }
        assertEquals("Car with id 999 not found", exception.message)
    }

    @Test
    @DisplayName("Should throw exception when favorite car already exists")
    fun shouldThrowExceptionWhenFavoriteAlreadyExists() {
        val createRequest =
            FavoriteCarCreateRequest(
                buyerId = 1L,
                carId = 1L,
                dateAdded = LocalDateTime.now(),
                rating = 5,
                comment = "Test",
                priceNotifications = false,
            )
        `when`(buyerService.findById(1L)).thenReturn(validBuyer)
        `when`(carService.findById(1L)).thenReturn(validCar)
        `when`(favoriteCarRepository.findByBuyerIdAndCarId(1L, 1L)).thenReturn(validFavoriteCar)

        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                favoriteService.saveFavorite(createRequest)
            }
        assertEquals("Buyer 1 already has car 1 as favorite", exception.message)
    }

    // ========== Validation Tests ==========
    @Test
    @DisplayName("Should throw exception for invalid rating (too high)")
    fun shouldThrowExceptionForInvalidRatingHigh() {
        val createRequest =
            FavoriteCarCreateRequest(
                buyerId = 1L,
                carId = 1L,
                dateAdded = LocalDateTime.now(),
                rating = 11,
                comment = "Test",
                priceNotifications = false,
            )
        `when`(buyerService.findById(1L)).thenReturn(validBuyer)
        `when`(carService.findById(1L)).thenReturn(validCar)
        `when`(favoriteCarRepository.findByBuyerIdAndCarId(1L, 1L)).thenReturn(null)

        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                favoriteService.saveFavorite(createRequest)
            }
        assertEquals("Rating must be between 0 and 10", exception.message)
    }

    @Test
    @DisplayName("Should throw exception for invalid rating (too low)")
    fun shouldThrowExceptionForInvalidRatingLow() {
        val createRequest =
            FavoriteCarCreateRequest(
                buyerId = 1L,
                carId = 1L,
                dateAdded = LocalDateTime.now(),
                rating = -1,
                comment = "Test",
                priceNotifications = false,
            )
        `when`(buyerService.findById(1L)).thenReturn(validBuyer)
        `when`(carService.findById(1L)).thenReturn(validCar)
        `when`(favoriteCarRepository.findByBuyerIdAndCarId(1L, 1L)).thenReturn(null)

        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                favoriteService.saveFavorite(createRequest)
            }
        assertEquals("Rating must be between 0 and 10", exception.message)
    }

    @Test
    @DisplayName("Should throw exception for long comment")
    fun shouldThrowExceptionForLongComment() {
        val longComment = "a".repeat(1001)
        val createRequest =
            FavoriteCarCreateRequest(
                buyerId = 1L,
                carId = 1L,
                dateAdded = LocalDateTime.now(),
                rating = 5,
                comment = longComment,
                priceNotifications = false,
            )
        `when`(buyerService.findById(1L)).thenReturn(validBuyer)
        `when`(carService.findById(1L)).thenReturn(validCar)
        `when`(favoriteCarRepository.findByBuyerIdAndCarId(1L, 1L)).thenReturn(null)

        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                favoriteService.saveFavorite(createRequest)
            }
        assertEquals("Comment cannot exceed 1000 characters", exception.message)
    }

    @Test
    @DisplayName("Should accept empty comment")
    fun shouldAcceptEmptyComment() {
        val createRequest =
            FavoriteCarCreateRequest(
                buyerId = 1L,
                carId = 1L,
                dateAdded = LocalDateTime.now(),
                rating = 5,
                comment = "",
                priceNotifications = true,
            )
        validFavoriteCar.comment = null
        `when`(buyerService.findById(1L)).thenReturn(validBuyer)
        `when`(carService.findById(1L)).thenReturn(validCar)
        `when`(favoriteCarRepository.findByBuyerIdAndCarId(1L, 1L)).thenReturn(null)
        `when`(favoriteCarRepository.save(any(FavoriteCar::class.java))).thenReturn(validFavoriteCar)

        val result = favoriteService.saveFavorite(createRequest)
    }

    // ========== updateReview Tests ==========
    @Test
    @DisplayName("Should update review successfully")
    fun shouldUpdateReview() {
        `when`(favoriteCarRepository.findById(1L)).thenReturn(Optional.of(validFavoriteCar))
        `when`(favoriteCarRepository.save(any(FavoriteCar::class.java))).thenReturn(validFavoriteCar)

        val result = favoriteService.updateReview(1L, 3, "Updated comment")
        assertEquals(3, result.rating)
        assertEquals("Updated comment", result.comment)
        verify(favoriteCarRepository).save(validFavoriteCar)
    }

    @Test
    @DisplayName("Should clear review successfully")
    fun shouldClearReview() {
        `when`(favoriteCarRepository.findById(1L)).thenReturn(Optional.of(validFavoriteCar))
        `when`(favoriteCarRepository.save(any(FavoriteCar::class.java))).thenReturn(validFavoriteCar)

        val result = favoriteService.updateReview(1L, null, null)
        assertNull(result.rating)
        assertNull(result.comment)
        verify(favoriteCarRepository).save(validFavoriteCar)
    }

    // ========== deleteFavorite Tests ==========
    @Test
    @DisplayName("Should delete favorite car successfully")
    fun shouldDeleteFavorite() {
        `when`(favoriteCarRepository.findById(1L)).thenReturn(Optional.of(validFavoriteCar))
        favoriteService.deleteFavoriteCar(1L)
        verify(favoriteCarRepository).delete(validFavoriteCar)
    }

    @Test
    @DisplayName("Should throw exception when deleting non-existent favorite")
    fun shouldThrowExceptionWhenDeletingNonExistentFavorite() {
        `when`(favoriteCarRepository.findById(999L)).thenReturn(Optional.empty())
        val exception =
            assertThrows(NoSuchElementException::class.java) {
                favoriteService.deleteFavoriteCar(999L)
            }
        assertEquals("Favorite car with id 999 not found", exception.message)
        verify(favoriteCarRepository, never()).delete(any(FavoriteCar::class.java))
    }

    // ========== Other Tests ==========
    @Test
    @DisplayName("Should find favorites by buyer id")
    fun shouldFindFavoritesByBuyerId() {
        `when`(favoriteCarRepository.findByBuyerId(1L)).thenReturn(listOf(validFavoriteCar))
        val result = favoriteService.findByBuyerId(1L)
        assertEquals(1, result.size)
        assertEquals(1L, result[0].buyer.id)
        verify(favoriteCarRepository).findByBuyerId(1L)
    }

    @Test
    @DisplayName("Should find favorites by car id")
    fun shouldFindFavoritesByCarId() {
        `when`(favoriteCarRepository.findByCarId(1L)).thenReturn(listOf(validFavoriteCar))
        `when`(favoriteCarRepository.findByCarId(2L)).thenReturn(emptyList())

        val result1 = favoriteService.findByCarId(1L)
        val result2 = favoriteService.findByCarId(2L)

        assertEquals(1, result1.size)
        assertTrue(result2.isEmpty())
        verify(favoriteCarRepository).findByCarId(1L)
        verify(favoriteCarRepository).findByCarId(2L)
    }
}
