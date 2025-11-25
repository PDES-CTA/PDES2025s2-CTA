package cta.model

import cta.enum.UserRole
import jakarta.persistence.DiscriminatorValue
import jakarta.persistence.Entity

@Entity
@DiscriminatorValue("ADMINISTRATOR")
class Admin(
    email: String = "",
    password: String = "",
    firstName: String = "",
    lastName: String = "",
    phone: String = "",
) : User() {
    init {
        this.email = email
        this.password = password
        this.firstName = firstName
        this.lastName = lastName
        this.phone = phone
    }

    override val role: UserRole = UserRole.ADMINISTRATOR

    companion object {
        fun create(
            email: String,
            password: String,
            firstName: String,
            lastName: String,
            phone: String,
        ): Admin {
            return Admin(
                email = email,
                password = password,
                firstName = firstName,
                lastName = lastName,
                phone = phone,
            )
        }
    }
}