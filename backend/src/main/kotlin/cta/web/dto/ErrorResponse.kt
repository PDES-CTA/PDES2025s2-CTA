package cta.web.dto

import io.swagger.v3.oas.annotations.media.Schema
import java.time.LocalDateTime

@Schema(description = "Data transfer object for error responses")
data class ErrorResponse(
    @field:Schema(description = "Error code")
    val status: Int,
    @field:Schema(description = "Error name")
    val error: String,
    @field:Schema(description = "Error message")
    val message: String,
    @field:Schema(description = "Error timestamp")
    val timestamp: LocalDateTime,
    @field:Schema(description = "Error details")
    val details: List<String>?,
)
