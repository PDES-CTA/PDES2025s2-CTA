package cta.web.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.Size

data class DealershipUpdateRequest(
    @field:Size(min = 2, max = 100, message = "Business name must be between 2 and 100 characters")
    val businessName: String? = null,

    @field:Email(message = "Invalid email format")
    val email: String? = null,

    @field:Size(min = 10, max = 15, message = "Phone must be between 10 and 15 characters")
    val phone: String? = null,

    val address: String? = null,
    val city: String? = null,
    val province: String? = null,
    val description: String? = null,
    val active: Boolean? = null
) {
    fun toMap(): Map<String, Any> {
        return listOf(
            "businessName" to businessName,
            "email" to email,
            "phone" to phone,
            "address" to address,
            "city" to city,
            "province" to province,
            "description" to description,
            "active" to active
        ).mapNotNull { (key, value) ->
            value?.let { key to it }
        }.toMap()
    }
}