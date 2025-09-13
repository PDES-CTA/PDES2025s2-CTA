package cta.web.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import org.hibernate.validator.constraints.Length

data class BuyerUpdateRequest(
    @field:NotBlank(message = "The buyer DNI cannot be blank")
    @field:Pattern(
        regexp = "^\\d{2}\\.\\d{3}\\.\\d{3}$|^\\d{3}\\.\\d{3}\\.\\d{3}$",
        message = "DNI must follow the format XX.XXX.XXX or XXX.XXX.XXX"
    )
    val dni: String? = null,

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