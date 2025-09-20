package cta.web.dto

import jakarta.validation.constraints.NotBlank
import org.hibernate.validator.constraints.Length

data class BuyerUpdateRequest(
    @field:Length(min = 6, max = 9, message = "The buyer DNI must be at least 6 characters long")
    val dni: Int? = null,

    @field:NotBlank(message = "The buyer address cannot be blank")
    @field:Length(max = 40, message = "The buyer address max length is 40 characters")
    val address: String? = null,
) {
    fun toMap(): Map<String, Any> {
        return listOf(
            "dni" to dni,
            "address" to address,
        ).mapNotNull { (key, value) ->
            value?.let { key to it }
        }.toMap()
    }
}