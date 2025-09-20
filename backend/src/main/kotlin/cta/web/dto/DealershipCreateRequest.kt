package cta.web.dto

import cta.model.Dealership
import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.LocalDateTime

@Schema(description = "Dealership creation data transfer object")
data class DealershipCreateRequest(
    @field:NotBlank(message = "Email is required")
    @field:Email(message = "Invalid email format")
    @field:Schema(description = "Dealership email", example = "my-dealership@gmail.com")
    val email: String,

    @field:NotBlank(message = "Password is required")
    @field:Size(min = 8, message = "Password must be at least 8 characters")
    @field:Schema(description = "Dealership password", example = "password123")
    val password: String,

    @field:NotBlank(message = "First name is required")
    @field:Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
    @field:Schema(description = "Dealership owner first name", example = "John")
    val firstName: String,

    @field:NotBlank(message = "Last name is required")
    @field:Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
    @field:Schema(description = "Dealership owner last name", example = "Example")
    val lastName: String,

    @field:Schema(description = "Dealership phone number", example = "1112341234")
    val phone: String? = null,

    @field:NotBlank(message = "Business name is required")
    @field:Size(min = 2, max = 100, message = "Business name must be between 2 and 100 characters")
    @field:Schema(description = "Dealership name", example = "CTA Cars")
    val businessName: String,

    @field:NotBlank(message = "CUIT is required")
    @field:Size(min = 11, max = 11, message = "CUIT must be 11 characters")
    @field:Schema(description = "Dealership business identification number", example = "12-12345678-12")
    val cuit: String,

    @field:Schema(description = "Dealership address", example = "12 Main Street, BA")
    val address: String? = null,

    @field:Schema(description = "Dealership city", example = "Bernal")
    val city: String? = null,

    @field:Schema(description = "Dealership province", example = "Buenos Aires")
    val province: String? = null,

    @field:Schema(description = "Dealership description")
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