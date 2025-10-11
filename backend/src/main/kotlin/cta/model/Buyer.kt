package cta.model

import cta.enum.UserRole
import jakarta.persistence.Column
import jakarta.persistence.DiscriminatorValue
import jakarta.persistence.Entity
import jakarta.persistence.Table
import jakarta.validation.constraints.NotBlank

@Entity
@Table(name = "buyer")
@DiscriminatorValue("BUYER")
class Buyer : User() {
    @Column(name = "address", nullable = true)
    @NotBlank(message = "Address cannot be blank")
    var address: String = ""

    @Column(name = "dni", unique = true, nullable = true)
    var dni: Int = 0

    override val role: UserRole = UserRole.BUYER

    companion object {
        fun create(
            email: String,
            password: String,
            firstName: String,
            lastName: String,
            phone: String,
            address: String,
            dni: Int,
        ): Buyer {
            return Buyer().apply {
                this.email = email
                this.password = password
                this.firstName = firstName
                this.lastName = lastName
                this.phone = phone
                this.address = address
                this.dni = dni
                this.active = true
            }
        }
    }
}
