package cta.model

import cta.enum.FuelType
import cta.enum.PaymentMethod
import cta.enum.PurchaseStatus
import cta.enum.TransmissionType
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import java.math.BigDecimal
import java.time.LocalDateTime

@DisplayName("Purchase Entity Tests")
class PurchaseTest {
    private lateinit var purchase: Purchase
    private lateinit var car: Car
    private lateinit var dealership: Dealership

    @BeforeEach
    fun setUp() {
        car =
            Car().apply {
                id = 1L
                brand = "Toyota"
                model = "Corolla"
                year = 2023
                plate = "ABC123"
                mileage = 15000
                color = "Blue"
                fuelType = FuelType.GASOLINE
                transmission = TransmissionType.AUTOMATIC
                available = true
            }

        dealership =
            Dealership().apply {
                id = 1L
                businessName = "Test Dealership"
                cuit = "30-12345678-9"
                email = "contact@dealership.com"
                active = true
            }

        purchase =
            Purchase().apply {
                this.buyerId = 1L
                this.car = this@PurchaseTest.car
                this.dealership = this@PurchaseTest.dealership
                this.purchaseDate = LocalDateTime.now()
                this.finalPrice = BigDecimal("25000.00")
                this.purchaseStatus = PurchaseStatus.PENDING
                this.paymentMethod = PaymentMethod.CREDIT_CARD
                this.observations = "Initial observations"
            }
    }

    @Test
    @DisplayName("Should create new purchase with correct values")
    fun shouldCreateNewPurchase() {
        assertNotNull(purchase.car)
        assertNotNull(purchase.dealership)
        assertEquals(1L, purchase.buyerId)
        assertEquals(car, purchase.car)
        assertEquals(dealership, purchase.dealership)
        assertNotNull(purchase.purchaseDate)
        assertEquals(BigDecimal("25000.00"), purchase.finalPrice)
        assertEquals(PurchaseStatus.PENDING, purchase.purchaseStatus)
        assertEquals(PaymentMethod.CREDIT_CARD, purchase.paymentMethod)
        assertEquals("Initial observations", purchase.observations)
    }

    @Test
    @DisplayName("Should create new purchase with default (nullable) values")
    fun shouldCreateNewPurchaseWithDefaultValues() {
        val newPurchase = Purchase()

        assertNull(newPurchase.id)
        assertEquals(0L, newPurchase.buyerId)

        assertThrows(UninitializedPropertyAccessException::class.java) {
            newPurchase.car
        }
        assertThrows(UninitializedPropertyAccessException::class.java) {
            newPurchase.dealership
        }

        assertNotNull(newPurchase.purchaseDate)
        assertEquals(BigDecimal.ZERO, newPurchase.finalPrice)
        assertEquals(PurchaseStatus.PENDING, newPurchase.purchaseStatus)
        assertEquals(PaymentMethod.CASH, newPurchase.paymentMethod)
        assertNull(newPurchase.observations)
    }

    @Test
    @DisplayName("Should update status correctly")
    fun shouldUpdateStatus() {
        purchase.purchaseStatus = PurchaseStatus.CONFIRMED
        assertEquals(PurchaseStatus.CONFIRMED, purchase.purchaseStatus)

        purchase.purchaseStatus = PurchaseStatus.DELIVERED
        assertEquals(PurchaseStatus.DELIVERED, purchase.purchaseStatus)

        purchase.purchaseStatus = PurchaseStatus.CANCELLED
        assertEquals(PurchaseStatus.CANCELLED, purchase.purchaseStatus)
    }

    @Test
    @DisplayName("Should update final price")
    fun shouldUpdateFinalPrice() {
        val newPrice = BigDecimal("24500.50")
        purchase.finalPrice = newPrice
        assertEquals(newPrice, purchase.finalPrice)
    }

    @Test
    @DisplayName("Should update payment method")
    fun shouldUpdatePaymentMethod() {
        purchase.paymentMethod = PaymentMethod.CHECK
        assertEquals(PaymentMethod.CHECK, purchase.paymentMethod)
    }

    @Test
    @DisplayName("Should update observations")
    fun shouldUpdateObservations() {
        val newObs = "Updated observations"
        purchase.observations = newObs
        assertEquals(newObs, purchase.observations)
    }

    @Test
    @DisplayName("Should clear observations")
    fun shouldClearObservations() {
        purchase.observations = null
        assertNull(purchase.observations)
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
        purchase.car = newCar
        assertEquals(newCar, purchase.car)
    }

    @Test
    @DisplayName("Should update dealership reference")
    fun shouldUpdateDealershipReference() {
        val newDealership =
            Dealership().apply {
                id = 2L
                businessName = "New Dealership"
            }
        purchase.dealership = newDealership
        assertEquals(newDealership, purchase.dealership)
    }
}
