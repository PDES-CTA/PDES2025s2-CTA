package cta.service

data class DealershipSearchFilters(
    val businessName: String? = null,
    val city: String? = null,
    val province: String? = null,
    val cuit: String? = null
)