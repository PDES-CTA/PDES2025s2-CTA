package cta.web.dto

import io.swagger.v3.oas.annotations.media.Schema
import java.math.BigDecimal

@Schema(description = "Admin dashboard overview with system statistics")
data class AdminDashboardResponse(
    @field:Schema(description = "Total number of registered buyers")
    val totalBuyers: Long,
    @field:Schema(description = "Total number of registered dealerships")
    val totalDealerships: Long,
    @field:Schema(description = "Total number of purchases in the system")
    val totalPurchases: Long,
    @field:Schema(description = "Total revenue from all purchases")
    val totalRevenue: BigDecimal,
)
