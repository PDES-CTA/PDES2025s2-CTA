package cta.service

import cta.enum.FuelType
import cta.enum.TransmissionType
import java.math.BigDecimal

data class CarSearchFilters(
    val keyword: String? = null,
    val minPrice: BigDecimal? = null,
    val maxPrice: BigDecimal? = null,
    val minYear: Int? = null,
    val maxYear: Int? = null,
    val brand: String? = null,
    val fuelType: FuelType? = null,
    val transmission: TransmissionType? = null,
)
