package cta.web.dto

import cta.model.Buyer

data class BuyerResponse(
    val id: Long?,
    val dni: String?,
    val address: String?
) {
    companion object {
        fun fromEntity(buyer: Buyer): BuyerResponse {
            return BuyerResponse(
                id = buyer.id,
                dni = buyer.dni,
                address = buyer.address
            )
        }
    }
}