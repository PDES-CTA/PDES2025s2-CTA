package cta.web.dto

import cta.model.Buyer
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Pattern
import org.hibernate.validator.constraints.Length

data class BuyerCreateRequest(
    @field:NotNull(message = "The buyer DNI is mandatory")
    @field:NotBlank(message = "The buyer DNI cannot be blank")
    @field:Pattern(
        regexp = "^\\d{2}\\.\\d{3}\\.\\d{3}$|^\\d{3}\\.\\d{3}\\.\\d{3}$",
        message = "DNI must follow the format XX.XXX.XXX or XXX.XXX.XXX"
    )
    val dni: String,

    @field:NotNull(message = "The buyer address is mandatory")
    @field:NotBlank(message = "The buyer address cannot be blank")
    @field:Length(max = 40, message = "The buyer address max length is 40 characters")
    val address: String
) {
    fun toEntity(): Buyer {
        return Buyer().apply {
            dni = this@BuyerCreateRequest.dni
            address = this@BuyerCreateRequest.address
        }
    }
}