package cta.web.dto

import cta.model.Dealership
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.LocalDateTime

data class DealershipCreateRequest(
    @field:NotBlank(message = "Email is required")
    @field:Email(message = "Invalid email format")
    val email: String,

    @field:NotBlank(message = "Password is required")
    @field:Size(min = 8, message = "Password must be at least 8 characters")
    val password: String,

    @field:NotBlank(message = "First name is required")
    @field:Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
    val firstName: String,

    @field:NotBlank(message = "Last name is required")
    @field:Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
    val lastName: String,

    val phone: String? = null,

    @field:NotBlank(message = "Business name is required")
    @field:Size(min = 2, max = 100, message = "Business name must be between 2 and 100 characters")
    val businessName: String,

    @field:NotBlank(message = "CUIT is required")
    @field:Size(min = 11, max = 11, message = "CUIT must be 11 characters")
    val cuit: String,

    val address: String? = null,
    val city: String? = null,
    val province: String? = null,
    val description: String? = null
) {
    fun toEntity(): Dealership {
        return Dealership().apply {
            email = this@DealershipCreateRequest.email
            password = this@DealershipCreateRequest.password
            firstName = this@DealershipCreateRequest.firstName
            lastName = this@DealershipCreateRequest.lastName
            phone = this@DealershipCreateRequest.phone
            businessName = this@DealershipCreateRequest.businessName
            cuit = this@DealershipCreateRequest.cuit
            address = this@DealershipCreateRequest.address
            city = this@DealershipCreateRequest.city
            province = this@DealershipCreateRequest.province
            description = this@DealershipCreateRequest.description
            registrationDate = LocalDateTime.now()
            active = true
        }
    }
}