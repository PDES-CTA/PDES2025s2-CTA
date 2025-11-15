package cta.web.controller

import cta.web.dto.ErrorResponse
import jakarta.persistence.EntityNotFoundException
import jakarta.persistence.NoResultException
import jakarta.validation.ConstraintViolationException
import org.slf4j.LoggerFactory
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import java.time.LocalDateTime

@RestControllerAdvice
class GlobalExceptionHandler {
    private val logger = LoggerFactory.getLogger(this::class.java)

    // JSON parsing errors
    @ExceptionHandler(HttpMessageNotReadableException::class)
    fun handleHttpMessageNotReadable(ex: HttpMessageNotReadableException): ResponseEntity<ErrorResponse> {
        logger.warn("Invalid JSON request: ${ex.message}")

        val errorMessage =
            when {
                ex.message?.contains("missing") == true ->
                    "Required field is missing or null. Please check your request body."
                ex.message?.contains("type mismatch") == true ->
                    "Invalid data type in request. Please check field types."
                ex.message?.contains("JSON parse error") == true ->
                    "Malformed JSON. Please verify your request format."
                else ->
                    "Invalid request format. Please check your JSON."
            }

        val errorResponse =
            ErrorResponse(
                status = HttpStatus.BAD_REQUEST.value(),
                error = "Invalid Request Format",
                message = errorMessage,
                timestamp = LocalDateTime.now(),
                details = null,
            )

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse)
    }

    @ExceptionHandler(DataIntegrityViolationException::class)
    fun handleDataIntegrityViolation(ex: DataIntegrityViolationException): ResponseEntity<ErrorResponse> {
        val message =
            when {
                ex.message?.contains("cta_user_email_key") == true -> "duplicate key: this email is already registered"
                ex.message?.contains("dni") == true -> "duplicate key: this dni is already registered"
                else -> "duplicate key: a record with this information already exists"
            }

        return ResponseEntity
            .status(HttpStatus.CONFLICT)
            .body(
                ErrorResponse(
                    status = 409,
                    error = "Conflict",
                    message = message,
                    timestamp = LocalDateTime.now(),
                    details = null,
                ),
            )
    }

    @ExceptionHandler(ConstraintViolationException::class)
    fun handleConstraintViolation(ex: ConstraintViolationException): ResponseEntity<ErrorResponse> {
        val message =
            when {
                ex.message?.contains("cta_user_email_key") == true -> "duplicate key: this email is already registered"
                ex.message?.contains("cuit") == true -> "duplicate key: this cuit is already registered"
                else -> "duplicate key: a record with this information already exists"
            }

        return ResponseEntity
            .status(HttpStatus.CONFLICT)
            .body(
                ErrorResponse(
                    status = 409,
                    error = "Conflict",
                    message = message,
                    timestamp = LocalDateTime.now(),
                    details = null,
                ),
            )
    }

    // Bean validation errors
    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidationErrors(ex: MethodArgumentNotValidException): ResponseEntity<ErrorResponse> {
        val errors =
            ex.bindingResult.fieldErrors.map {
                "${it.field}: ${it.defaultMessage}"
            }
        logger.warn("Validation errors: $errors")

        val errorResponse =
            ErrorResponse(
                status = HttpStatus.BAD_REQUEST.value(),
                error = "Validation Error",
                message = "One or more fields contain invalid data",
                timestamp = LocalDateTime.now(),
                details = errors,
            )

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse)
    }

    // Invalid validation configuration
    @ExceptionHandler(jakarta.validation.UnexpectedTypeException::class)
    fun handleUnexpectedTypeException(ex: jakarta.validation.UnexpectedTypeException): ResponseEntity<ErrorResponse> {
        logger.error("Validation configuration error: ${ex.message}")

        val errorResponse =
            ErrorResponse(
                status = HttpStatus.BAD_REQUEST.value(),
                error = "Invalid Request",
                message = "Invalid data type provided. Please verify your request format.",
                timestamp = LocalDateTime.now(),
                details = null,
            )

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse)
    }

    // Resource not found
    @ExceptionHandler(NoSuchElementException::class)
    fun handleNoSuchElementException(ex: NoSuchElementException): ResponseEntity<ErrorResponse> {
        logger.warn("Resource not found: ${ex.message}")

        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(
                ErrorResponse(
                    status = HttpStatus.NOT_FOUND.value(),
                    error = "Resource Not Found",
                    message = ex.message ?: "The requested resource was not found",
                    timestamp = LocalDateTime.now(),
                    details = null,
                ),
            )
    }

    // Entity not found (JPA)
    @ExceptionHandler(value = [EntityNotFoundException::class, NoResultException::class, EmptyResultDataAccessException::class])
    fun handleEntityNotFound(ex: Exception): ResponseEntity<ErrorResponse> {
        logger.warn("Entity not found: ${ex.message}")

        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(
                ErrorResponse(
                    status = HttpStatus.NOT_FOUND.value(),
                    error = "Not Found",
                    message = "The requested resource was not found",
                    timestamp = LocalDateTime.now(),
                    details = null,
                ),
            )
    }

    // Invalid argument
    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgumentException(ex: IllegalArgumentException): ResponseEntity<ErrorResponse> {
        logger.warn("Invalid argument: ${ex.message}")

        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(
                ErrorResponse(
                    status = HttpStatus.BAD_REQUEST.value(),
                    error = "Invalid Request",
                    message = ex.message ?: "Invalid request parameters provided",
                    timestamp = LocalDateTime.now(),
                    details = null,
                ),
            )
    }

    // Invalid state / conflict
    @ExceptionHandler(IllegalStateException::class)
    fun handleIllegalStateException(ex: IllegalStateException): ResponseEntity<ErrorResponse> {
        logger.warn("Invalid state: ${ex.message}")

        return ResponseEntity
            .status(HttpStatus.CONFLICT)
            .body(
                ErrorResponse(
                    status = HttpStatus.CONFLICT.value(),
                    error = "Conflict",
                    message = ex.message ?: "The requested operation cannot be completed in the current state",
                    timestamp = LocalDateTime.now(),
                    details = null,
                ),
            )
    }

    // Generic error - must be last
    @ExceptionHandler(Exception::class)
    fun handleGenericException(ex: Exception): ResponseEntity<ErrorResponse> {
        logger.error("Unexpected server error: ${ex.javaClass.simpleName}: ${ex.message}", ex)

        val errorResponse =
            ErrorResponse(
                status = HttpStatus.INTERNAL_SERVER_ERROR.value(),
                error = "Internal Server Error",
                message = "An unexpected error occurred. Please try again later.",
                timestamp = LocalDateTime.now(),
                details = null,
            )

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse)
    }
}
