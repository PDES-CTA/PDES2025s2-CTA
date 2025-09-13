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

    @Column(name = "address")
    var address: String? = null

    @NotBlank(message = "DNI is required")
    @Column(name = "dni", unique = true, nullable = false)
    var dni: String? = null

    override val role: UserRole = UserRole.BUYER
}