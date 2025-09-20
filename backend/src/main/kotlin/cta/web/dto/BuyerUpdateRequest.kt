package cta.web.dto

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import org.hibernate.validator.constraints.Length

@Schema(description = "Buyer update data transfer object")
data class BuyerUpdateRequest(
    @field:Email(message = "Invalid email format")
    @field:Schema(description = "New buyer email")
    val email: String? = null,

    @field:Size(min = 10, max = 15, message = "Phone must be between 10 and 15 characters")
    @field:Schema(description = "New buyer phone number")
    val phone: String? = null,

    @field:Length(min = 6, max = 9, message = "The buyer DNI must be at least 6 characters long")
    @field:Schema(description = "Buyer national identification number")
    val dni: Int? = null,

    @field:NotBlank(message = "The buyer address cannot be blank")
    @field:Length(max = 40, message = "The buyer address max length is 40 characters")
    @field:Schema(description = "New address of the buyer")
    val address: String? = null,

    @field:Schema(description = "New buyer is active indicator")
    val active: Boolean? = null
) {
    fun toMap(): Map<String, Any> {
        return listOf(
            "dni" to dni,
            "address" to address,
            "phone" to phone,
            "email" to email,
            "active" to active
        ).mapNotNull { (key, value) ->
            value?.let { key to it }
        }.toMap()
    }
}