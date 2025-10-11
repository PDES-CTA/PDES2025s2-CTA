package cta.model

import cta.enum.FuelType
import cta.enum.PaymentMethod
import cta.enum.PurchaseStatus
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

@DisplayName("Purchase Entity Tests")
class PurchaseTest {
    private lateinit var purchase: Purchase
    private lateinit var carT: Car
    private lateinit var dealershipT: Dealership

    @BeforeEach
    fun setup() {
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

        // Create a dealership
        dealershipT =
            Dealership().apply {
                email = "contact@dealership.com"
                password = "password123"
                firstName = "John"
                lastName = "Dealer"
                phone = "+54 11 1234-5678"
                businessName = "Premium Auto Sales"
                cuit = "20-12345678-9"
                address = "Av. Libertador 1000"
                city = "Buenos Aires"
                province = "CABA"
                active = true
            }

        // Create purchase
        purchase =
            Purchase().apply {
                this.buyerId = 123L
                this.car = carT
                this.dealership = dealershipT
                this.finalPrice = BigDecimal("24000.00")
                this.purchaseDate = LocalDateTime.now()
                this.purchaseStatus = PurchaseStatus.PENDING
                this.paymentMethod = PaymentMethod.CASH
            }
    }

    @Test
    @DisplayName("Should create purchase with default values")
    fun shouldCreatePurchaseWithDefaults() {
        val newPurchase = Purchase()

        assertEquals(0L, newPurchase.buyerId)
        assertEquals(BigDecimal.ZERO, newPurchase.finalPrice)
        assertEquals(PurchaseStatus.PENDING, newPurchase.purchaseStatus)
        assertEquals(PaymentMethod.CASH, newPurchase.paymentMethod)
        assertNull(newPurchase.observations)
        assertNotNull(newPurchase.purchaseDate)
    }

    @Test
    @DisplayName("Should confirm purchase and mark car as sold")
    fun shouldConfirmPurchase() {
        assertTrue(carT.available)
        assertEquals(PurchaseStatus.PENDING, purchase.purchaseStatus)

        purchase.confirmPurchase()

        assertEquals(PurchaseStatus.CONFIRMED, purchase.purchaseStatus)
        assertFalse(carT.available)
    }

    @Test
    @DisplayName("Should cancel purchase and make car available again")
    fun shouldCancelPurchase() {
        purchase.confirmPurchase()
        assertFalse(carT.available)

        purchase.cancelPurchase()

        assertEquals(PurchaseStatus.CANCELLED, purchase.purchaseStatus)
        assertTrue(carT.available)
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
    @DisplayName("Should obtain purchase details")
    fun shouldObtainPurchaseDetails() {
        purchase.id = 1L
        purchase.observations = "Urgent delivery requested"

        val details = purchase.obtainDetails()

        assertEquals(1L, details["Purchase ID"])
        assertEquals("Toyota Corolla 2023", details["Car"])
        assertEquals("Premium Auto Sales", details["Dealership"])
        assertEquals(BigDecimal("24000.00"), details["Final price"])
        assertEquals(purchase.purchaseDate, details["Purchase date"])
        assertEquals(PurchaseStatus.PENDING, details["Status"])
        assertEquals(PaymentMethod.CASH, details["Payment method"])
        assertEquals("Urgent delivery requested", details["Observations"])
    }

    @Test
    @DisplayName("Should obtain details with null observations")
    fun shouldObtainDetailsWithNullObservations() {
        purchase.id = 2L
        purchase.observations = null

        val details = purchase.obtainDetails()

        assertNull(details["Observations"])
    }

    @Test
    @DisplayName("Should handle different payment methods")
    fun shouldHandleDifferentPaymentMethods() {
        purchase.paymentMethod = PaymentMethod.CREDIT_CARD
        assertEquals(PaymentMethod.CREDIT_CARD, purchase.paymentMethod)

        purchase.paymentMethod = PaymentMethod.CASH
        assertEquals(PaymentMethod.CASH, purchase.paymentMethod)

        purchase.paymentMethod = PaymentMethod.CHECK
        assertEquals(PaymentMethod.CHECK, purchase.paymentMethod)
    }

    @Test
    @DisplayName("Should handle different purchase statuses")
    fun shouldHandleDifferentPurchaseStatuses() {
        purchase.purchaseStatus = PurchaseStatus.CONFIRMED
        assertEquals(PurchaseStatus.CONFIRMED, purchase.purchaseStatus)

        purchase.purchaseStatus = PurchaseStatus.DELIVERED
        assertEquals(PurchaseStatus.DELIVERED, purchase.purchaseStatus)

        purchase.purchaseStatus = PurchaseStatus.CANCELLED
        assertEquals(PurchaseStatus.CANCELLED, purchase.purchaseStatus)
    }

    @Test
    @DisplayName("Should set and get final price")
    fun shouldSetAndGetFinalPrice() {
        val newPrice = BigDecimal("30000.00")

        purchase.finalPrice = newPrice

        assertEquals(newPrice, purchase.finalPrice)
    }

    @Test
    @DisplayName("Should set and get buyer ID")
    fun shouldSetAndGetBuyerId() {
        purchase.buyerId = 999L

        assertEquals(999L, purchase.buyerId)
    }

    @Test
    @DisplayName("Should set and get observations")
    fun shouldSetAndGetObservations() {
        purchase.observations = "Customer requested home delivery"

        assertEquals("Customer requested home delivery", purchase.observations)
    }

    @Test
    @DisplayName("Should update purchase date")
    fun shouldUpdatePurchaseDate() {
        val newDate = LocalDateTime.of(2024, 6, 15, 14, 30)

        purchase.purchaseDate = newDate

        assertEquals(newDate, purchase.purchaseDate)
    }

    @Test
    @DisplayName("Should associate car correctly")
    fun shouldAssociateCarCorrectly() {
        assertEquals(carT, purchase.car)
        assertEquals("Toyota", purchase.car.brand)
        assertEquals("Corolla", purchase.car.model)
    }

    @Test
    @DisplayName("Should associate dealership correctly")
    fun shouldAssociateDealershipCorrectly() {
        assertEquals(dealershipT, purchase.dealership)
        assertEquals("Premium Auto Sales", purchase.dealership.businessName)
    }

    @Test
    @DisplayName("Should handle purchase workflow - pending to confirmed to delivered")
    fun shouldHandlePurchaseWorkflow() {
        // Start as pending
        assertEquals(PurchaseStatus.PENDING, purchase.purchaseStatus)
        assertTrue(carT.available)

        // Confirm purchase
        purchase.confirmPurchase()
        assertEquals(PurchaseStatus.CONFIRMED, purchase.purchaseStatus)
        assertFalse(carT.available)

        // Deliver purchase
        purchase.deliverPurchase()
        assertEquals(PurchaseStatus.DELIVERED, purchase.purchaseStatus)
    }

    @Test
    @DisplayName("Should handle purchase cancellation workflow")
    fun shouldHandlePurchaseCancellationWorkflow() {
        // Confirm purchase
        purchase.confirmPurchase()
        assertEquals(PurchaseStatus.CONFIRMED, purchase.purchaseStatus)
        assertFalse(carT.available)

        // Cancel purchase
        purchase.cancelPurchase()
        assertEquals(PurchaseStatus.CANCELLED, purchase.purchaseStatus)
        assertTrue(carT.available)
    }

    @Test
    @DisplayName("Should allow multiple status changes")
    fun shouldAllowMultipleStatusChanges() {
        purchase.confirmPurchase()
        assertEquals(PurchaseStatus.CONFIRMED, purchase.purchaseStatus)

        purchase.pendingPurchase()
        assertEquals(PurchaseStatus.PENDING, purchase.purchaseStatus)

        purchase.confirmPurchase()
        assertEquals(PurchaseStatus.CONFIRMED, purchase.purchaseStatus)

        purchase.deliverPurchase()
        assertEquals(PurchaseStatus.DELIVERED, purchase.purchaseStatus)
    }

    @Test
    @DisplayName("Should handle long observations")
    fun shouldHandleLongObservations() {
        val longObservation = "A".repeat(1000)

        purchase.observations = longObservation

        assertEquals(longObservation, purchase.observations)
    }

    @Test
    @DisplayName("Should create purchase with all fields set")
    fun shouldCreatePurchaseWithAllFieldsSet() {
        val completePurchase =
            Purchase().apply {
                this.buyerId = 456L
                this.car = carT
                this.dealership = dealershipT
                this.finalPrice = BigDecimal("22000.00")
                this.purchaseDate = LocalDateTime.of(2024, 1, 1, 10, 0)
                this.purchaseStatus = PurchaseStatus.CONFIRMED
                this.paymentMethod = PaymentMethod.CREDIT_CARD
                this.observations = "VIP customer"
            }

        assertEquals(456L, completePurchase.buyerId)
        assertEquals(BigDecimal("22000.00"), completePurchase.finalPrice)
        assertEquals(PurchaseStatus.CONFIRMED, completePurchase.purchaseStatus)
        assertEquals(PaymentMethod.CREDIT_CARD, completePurchase.paymentMethod)
        assertEquals("VIP customer", completePurchase.observations)
    }

    @Test
    @DisplayName("Should use dealership display name in details")
    fun shouldUseDealershipDisplayNameInDetails() {
        val details = purchase.obtainDetails()

        assertEquals("Premium Auto Sales", details["Dealership"])
    }

    @Test
    @DisplayName("Should use dealership name fallback when business name is blank")
    fun shouldUseDealershipNameFallbackWhenBusinessNameBlank() {
        dealershipT.businessName = ""

        val details = purchase.obtainDetails()

        assertEquals("John Dealer", details["Dealership"])
    }
}
