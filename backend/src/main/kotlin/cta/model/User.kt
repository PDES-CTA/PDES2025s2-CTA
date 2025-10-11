package cta.model

import cta.enum.UserRole
import jakarta.persistence.*
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.LocalDateTime

@Entity
@Table(name = "cta_user")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "user_type", discriminatorType = DiscriminatorType.STRING)
abstract class User : BaseEntity() {
    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    @Column(unique = true, nullable = false)
    var email: String = ""

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Column(nullable = false)
    var password: String = ""

    @NotBlank(message = "First name is required")
    @Column(name = "first_name", nullable = false)
    var firstName: String = ""

    @NotBlank(message = "Last name is required")
    @Column(name = "last_name", nullable = false)
    var lastName: String = ""

    @Column(name = "phone", nullable = false)
    var phone: String = ""

    @Column(name = "registration_date", nullable = false)
    var registrationDate: LocalDateTime = LocalDateTime.now()

    @Column(nullable = false)
    open var active: Boolean = true

    @get:Enumerated(EnumType.STRING)
    @get:Column(name = "role", nullable = false)
    abstract val role: UserRole

    fun login(
        email: String,
        password: String,
    ): Boolean {
        return this.email == email && this.password == password && active
    }

    fun updateProfile(data: Map<String, Any>) {
        data["firstName"]?.let { firstName = it.toString() }
        data["lastName"]?.let { lastName = it.toString() }
        data["phone"]?.let { phone = it.toString() }
    }

    fun isActive(): Boolean = active

    fun deactivate() {
        this.active = false
    }

    fun activate() {
        this.active = true
    }
}
