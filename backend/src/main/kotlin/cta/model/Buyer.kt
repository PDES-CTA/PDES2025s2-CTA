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

    @Column(name = "address", nullable = false)
    @NotBlank(message = "Address cannot be blank")
    var address: String? = null

    @Column(name = "dni", unique = true, nullable = false)
    var dni: Int? = null

    override val role: UserRole = UserRole.BUYER
}