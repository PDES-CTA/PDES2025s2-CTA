package cta.web.dto

import cta.model.Buyer
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import org.hibernate.validator.constraints.Length

data class BuyerCreateRequest(
    @field:NotNull(message = "The buyer DNI is mandatory")
    @field:Length(min = 6, max = 9, message = "The buyer DNI must be at least 6 characters long")
    val dni: Int,

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