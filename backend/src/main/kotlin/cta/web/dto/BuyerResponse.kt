package cta.web.dto

import cta.model.Buyer
import io.swagger.v3.oas.annotations.media.Schema
import java.time.LocalDateTime

@Schema(description = "Buyer information response object containing all buyer details")
data class BuyerResponse(
    @field:Schema(description = "Unique identifier for the buyer")
    val id: Long?,

    @field:Schema(description = "Buyer national identification number")
    val dni: Int?,

    @field:Schema(description = "Address of the buyer")
    val address: String?,

    @field:Schema(description = "Buyer email")
    val email: String,

    @field:Schema(description = "Buyer phone")
    val phone: String?,

    @field:Schema(description = "Buyer registration date")
    val registrationDate: LocalDateTime,

    @field:Schema(description = "Buyer is active indicator")
    val active: Boolean,
) {
    companion object {
        fun fromEntity(buyer: Buyer): BuyerResponse {
            return BuyerResponse(
                id = buyer.id,
                dni = buyer.dni,
                address = buyer.address,
                email = buyer.email,
                phone = buyer.phone,
                registrationDate = buyer.registrationDate,
                active = buyer.active
            )
        }
    }
}