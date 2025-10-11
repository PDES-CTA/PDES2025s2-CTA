package cta.web.dto

import cta.model.Dealership
import io.swagger.v3.oas.annotations.media.Schema
import java.time.LocalDateTime

@Schema(description = "Dealership information response object containing all dealership details")
data class DealershipResponse(
    @field:Schema(description = "Unique identifier for the dealership")
    val id: Long?,

    @field:Schema(description = "Business name of the dealership")
    val businessName: String,

    @field:Schema(description = "Dealership CUIT number")
    val cuit: String,

    @field:Schema(description = "Dealership email")
    val email: String,

    @field:Schema(description = "Dealership phone")
    val phone: String?,

    @field:Schema(description = "Dealership address")
    val address: String?,

    @field:Schema(description = "Dealership city")
    val city: String?,

    @field:Schema(description = "Dealership province")
    val province: String?,

    @field:Schema(description = "Dealership registration date in the app")
    val registrationDate: LocalDateTime,

    @field:Schema(description = "Dealership is active indicator")
    val active: Boolean,

    @field:Schema(description = "Dealership description")
    val description: String?
) {
    companion object {
        fun fromEntity(dealership: Dealership): DealershipResponse {
            return DealershipResponse(
                id = dealership.id,
                businessName = dealership.businessName,
                cuit = dealership.cuit,
                email = dealership.email,
                phone = dealership.phone,
                address = dealership.address,
                city = dealership.city,
                province = dealership.province,
                registrationDate = dealership.registrationDate,
                active = dealership.active,
                description = dealership.description
            )
        }
    }
}