package cta.web.dto

import cta.model.Buyer
import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import org.hibernate.validator.constraints.Length

@Schema(description = "Buyer creation data transfer object")
data class BuyerCreateRequest(
    @field:NotBlank(message = "Email is required")
    @field:Email(message = "Invalid email format")
    @field:Schema(description = "Buyer email", example = "buyer-user@gmail.com")
    val email: String,

    @field:NotBlank(message = "Password is required")
    @field:Size(min = 8, message = "Password must be at least 8 characters")
    @field:Schema(description = "Buyer password", example = "password123")
    val password: String,

    @field:NotBlank(message = "First name is required")
    @field:Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
    @field:Schema(description = "Buyer first name", example = "John")
    val firstName: String,

    @field:NotBlank(message = "Last name is required")
    @field:Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
    @field:Schema(description = "Buyer last name", example = "Example")
    val lastName: String,

    @field:NotBlank(message = "Phone is required")
    @field:Schema(description = "Buyer phone number", example = "1112341234")
    val phone: String,

    @field:NotNull(message = "The buyer DNI is mandatory")
    @field:Min(value = 1000000, message = "DNI must be at least 7 digits")
    @field:Max(value = 99999999, message = "DNI must be at most 8 digits")
    @field:Schema(description = "Buyer national identification number", example = "59252192")
    val dni: Int,

    @field:NotNull(message = "The buyer address is mandatory")
    @field:NotBlank(message = "The buyer address cannot be blank")
    @field:Length(max = 40, message = "The buyer address max length is 40 characters")
    @field:Schema(description = "Address of the buyer", example = "24 Main Street, BA")
    val address: String
) {
    fun toEntity(): Buyer {
        return Buyer().apply {
            dni = this@BuyerCreateRequest.dni
            address = this@BuyerCreateRequest.address
            email = this@BuyerCreateRequest.email
            password = this@BuyerCreateRequest.password
            firstName = this@BuyerCreateRequest.firstName
            lastName = this@BuyerCreateRequest.lastName
            phone = this@BuyerCreateRequest.phone
        }
    }
}