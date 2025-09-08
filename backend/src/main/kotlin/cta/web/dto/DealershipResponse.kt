package cta.web.dto

import cta.model.Dealership
import java.time.LocalDateTime

data class DealershipResponse(
    val id: Long?,
    val businessName: String,
    val cuit: String,
    val email: String,
    val phone: String?,
    val address: String?,
    val city: String?,
    val province: String?,
    val registrationDate: LocalDateTime,
    val active: Boolean,
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