package cta.web.dto

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.Size

@Schema(description = "Dealership update data transfer object")
data class DealershipUpdateRequest(
    @field:Size(min = 2, max = 100, message = "Business name must be between 2 and 100 characters")
    @field:Schema(description = "Dealership name")
    val businessName: String? = null,
    @field:Email(message = "Invalid email format")
    @field:Schema(description = "New dealership email")
    val email: String? = null,
    @field:Size(min = 10, max = 15, message = "Phone must be between 10 and 15 characters")
    @field:Schema(description = "New dealership phone")
    val phone: String? = null,
    @field:Schema(description = "New dealership address")
    val address: String? = null,
    @field:Schema(description = "New dealership city")
    val city: String? = null,
    @field:Schema(description = "New dealership province")
    val province: String? = null,
    @field:Schema(description = "New dealership description")
    val description: String? = null,
    @field:Schema(description = "New dealership is active indicator")
    val active: Boolean? = null,
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
            "active" to active,
        ).mapNotNull { (key, value) ->
            value?.let { key to it }
        }.toMap()
    }
}
