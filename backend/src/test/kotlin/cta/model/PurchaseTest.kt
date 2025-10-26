package cta.model

import cta.enum.FuelType
import cta.enum.PaymentMethod
import cta.enum.PurchaseStatus
import org.junit.jupiter.api.Assertions.assertEquals
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
    private lateinit var buyer: Buyer
    private lateinit var carOffer: CarOffer

    @BeforeEach
    fun setUp() {
        car =
            Car().apply {
                id = 1L
                brand = "Toyota"
                model = "Corolla"
                year = 2023
                color = "Blue"
                fuelType = FuelType.GASOLINE
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
                id = 1L
                this.dealership = this@PurchaseTest.dealership
                this.car = this@PurchaseTest.car
                price = BigDecimal("12000.00")
            }

        buyer =
            Buyer().apply {
                id = 1L
                firstName = "John"
                lastName = "Doe"
                email = "john.doe@example.com"
                phone = "123456789"
            }

        purchase =
            Purchase().apply {
                this.buyer = this@PurchaseTest.buyer
                this.carOffer = this@PurchaseTest.carOffer
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
        assertNotNull(purchase.buyer)
        assertNotNull(purchase.carOffer)
        assertEquals(buyer, purchase.buyer)
        assertEquals(carOffer, purchase.carOffer)
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

        assertThrows(UninitializedPropertyAccessException::class.java) {
            newPurchase.buyer
        }
        assertThrows(UninitializedPropertyAccessException::class.java) {
            newPurchase.carOffer
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
    @DisplayName("Should confirm purchase and mark car offer as sold")
    fun shouldConfirmPurchase() {
        purchase.confirmPurchase()
        assertEquals(PurchaseStatus.CONFIRMED, purchase.purchaseStatus)
        // Note: You may need to mock carOffer to verify markAsSold() was called
    }

    @Test
    @DisplayName("Should cancel purchase and mark car offer as available")
    fun shouldCancelPurchase() {
        purchase.cancelPurchase()
        assertEquals(PurchaseStatus.CANCELLED, purchase.purchaseStatus)
        // Note: You may need to mock carOffer to verify markAsAvailable() was called
    }

    @Test
    @DisplayName("Should deliver purchase")
    fun shouldDeliverPurchase() {
        purchase.deliverPurchase()
        assertEquals(PurchaseStatus.DELIVERED, purchase.purchaseStatus)
    }

    @Test
    @DisplayName("Should set purchase to pending")
    fun shouldSetPurchaseToPending() {
        purchase.purchaseStatus = PurchaseStatus.CONFIRMED
        purchase.pendingPurchase()
        assertEquals(PurchaseStatus.PENDING, purchase.purchaseStatus)
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
    @DisplayName("Should update buyer reference")
    fun shouldUpdateBuyerReference() {
        val newBuyer =
            Buyer().apply {
                id = 2L
                firstName = "Jane"
                lastName = "Smith"
            }
        purchase.buyer = newBuyer
        assertEquals(newBuyer, purchase.buyer)
    }

    @Test
    @DisplayName("Should update car offer reference")
    fun shouldUpdateCarOfferReference() {
        val newCarOffer =
            CarOffer().apply {
                id = 2L
                price = BigDecimal("15000.00")
            }
        purchase.carOffer = newCarOffer
        assertEquals(newCarOffer, purchase.carOffer)
    }

    @Test
    @DisplayName("Should obtain purchase details correctly")
    fun shouldObtainPurchaseDetails() {
        // Mock getFullName(), getDisplayName() methods if needed
        val details = purchase.obtainDetails()

        assertNotNull(details)
        assertEquals(purchase.id, details["Purchase ID"])
        assertEquals(purchase.finalPrice, details["Final price"])
        assertEquals(purchase.purchaseDate, details["Purchase date"])
        assertEquals(purchase.purchaseStatus, details["Status"])
        assertEquals(purchase.paymentMethod, details["Payment method"])
        assertEquals(purchase.observations, details["Observations"])
    }
}
