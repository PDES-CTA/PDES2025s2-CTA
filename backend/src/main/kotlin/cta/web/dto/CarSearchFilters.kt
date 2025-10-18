package cta.web.dto

import cta.enum.FuelType
import cta.enum.TransmissionType

data class CarSearchFilters(
    val keyword: String? = null,
    val minYear: Int? = null,
    val maxYear: Int? = null,
    val brand: String? = null,
    val fuelType: FuelType? = null,
    val transmission: TransmissionType? = null,
)