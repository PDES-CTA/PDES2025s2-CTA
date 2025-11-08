package cta.model

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.time.LocalDateTime

@Entity
@Table(name = "favorite_car")
class FavoriteCar : BaseEntity() {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = false)
    lateinit var buyer: Buyer

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_id", nullable = false)
    lateinit var car: Car

    @Column(name = "date_added", nullable = false)
    var dateAdded: LocalDateTime = LocalDateTime.now()

    @Column(name = "rating")
    var rating: Int? = null

    @Column(name = "comment", columnDefinition = "TEXT")
    var comment: String? = null

    @Column(name = "price_notifications")
    var priceNotifications: Boolean = false

    fun updateRating(newRating: Int?) {
        this.rating = newRating
    }

    fun updateComment(newComment: String?) {
        this.comment = newComment?.ifBlank { null }
    }

    fun enablePriceNotifications() {
        priceNotifications = true
    }

    fun disablePriceNotifications() {
        priceNotifications = false
    }

    fun togglePriceNotifications() {
        priceNotifications = !priceNotifications
    }

    fun isReviewed(): Boolean {
        return rating != null || !comment.isNullOrBlank()
    }
}
