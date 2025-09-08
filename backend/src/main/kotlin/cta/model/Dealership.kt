package cta.model

import cta.enum.UserRole
import jakarta.persistence.*
import jakarta.validation.constraints.NotBlank

@Entity
@DiscriminatorValue("DEALERSHIP")
class Dealership : User() {

    @NotBlank(message = "Business name is required")
    @Column(name = "business_name", nullable = false)
    var businessName: String = ""

    @NotBlank(message = "CUIT is required")
    @Column(name = "cuit", unique = true, nullable = false)
    var cuit: String = ""

    @Column(name = "address")
    var address: String? = null

    @Column(name = "city")
    var city: String? = null

    @Column(name = "province")
    var province: String? = null

    @Column(columnDefinition = "TEXT")
    var description: String? = null

    override val role: UserRole = UserRole.DEALERSHIP

    fun updateDealershipProfile(data: Map<String, Any>) {
        // Call parent's updateProfile for common fields
        updateProfile(data)

        // Update dealership-specific fields
        data["businessName"]?.let { businessName = it.toString() }
        data["cuit"]?.let { cuit = it.toString() }
        data["address"]?.let { address = it.toString() }
        data["city"]?.let { city = it.toString() }
        data["province"]?.let { province = it.toString() }
        data["description"]?.let { description = it.toString() }
    }

    fun getFullAddress(): String {
        val addressParts = listOfNotNull(address, city, province)
        return if (addressParts.isNotEmpty()) {
            addressParts.joinToString(", ")
        } else {
            "Address not specified"
        }
    }

    fun getDisplayName(): String {
        return businessName.ifBlank { "$firstName $lastName" }
    }
}