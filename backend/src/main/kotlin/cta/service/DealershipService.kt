package cta.service

import cta.model.Dealership
import cta.repository.DealershipRepository
import cta.web.dto.DealershipCreateRequest
import org.slf4j.LoggerFactory
import org.springframework.data.repository.findByIdOrNull
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class DealershipService(
    private val dealershipRepository: DealershipRepository,
    private val passwordEncoder: PasswordEncoder,
) {
    private val logger = LoggerFactory.getLogger(javaClass)

    fun findById(id: Long): Dealership {
        logger.debug("Fetching Dealership with ID: {}", id)

        return try {
            dealershipRepository.findByIdOrNull(id)
                ?.also { logger.debug("Dealership found: {}", it.businessName) }
                ?: run {
                    logger.warn("Dealership with ID {} not found", id)
                    throw NoSuchElementException("Dealership with ID $id not found")
                }
        } catch (e: NoSuchElementException) {
            throw e
        } catch (e: Exception) {
            logger.error("Error retrieving dealership with ID {}", id, e)
            throw RuntimeException("Error retrieving dealership with ID $id", e)
        }
    }

    fun findAll(): List<Dealership> {
        logger.debug("Fetching all dealerships")

        return try {
            val dealerships = dealershipRepository.findAll()
            logger.debug("Found {} dealerships", dealerships.size)
            dealerships
        } catch (e: Exception) {
            logger.error("Error retrieving all dealerships", e)
            throw RuntimeException("Error retrieving all dealerships", e)
        }
    }

    fun findActive(): List<Dealership> {
        logger.debug("Fetching active dealerships")

        return try {
            val dealerships = dealershipRepository.findByActiveTrue()
            logger.debug("Found {} active dealerships", dealerships.size)
            dealerships
        } catch (e: Exception) {
            logger.error("Error retrieving active dealerships", e)
            throw RuntimeException("Error retrieving active dealerships", e)
        }
    }

    fun findByCuit(cuit: String): Dealership? {
        logger.debug("Searching dealership by CUIT: {}", cuit)

        return try {
            require(cuit.isNotBlank()) { "CUIT cannot be empty" }
            val dealership = dealershipRepository.findByCuit(cuit)
            if (dealership != null) {
                logger.debug("Dealership found by CUIT: {}", cuit)
            } else {
                logger.debug("Dealership not found by CUIT: {}", cuit)
            }
            dealership
        } catch (e: IllegalArgumentException) {
            logger.warn("Invalid CUIT format: {}", e.message)
            throw e
        } catch (e: Exception) {
            logger.error("Error searching dealership by CUIT", e)
            throw RuntimeException("Error searching dealership by CUIT", e)
        }
    }

    fun findByEmail(email: String): Dealership? {
        logger.debug("Searching dealership by email: {}", email)

        return try {
            require(email.isNotBlank()) { "Email cannot be empty" }
            val dealership = dealershipRepository.findByEmail(email)
            if (dealership != null) {
                logger.debug("Dealership found by email: {}", email)
            } else {
                logger.debug("Dealership not found by email: {}", email)
            }
            dealership
        } catch (e: IllegalArgumentException) {
            logger.warn("Invalid email: {}", e.message)
            throw e
        } catch (e: Exception) {
            logger.error("Error searching dealership by email", e)
            throw RuntimeException("Error searching dealership by email", e)
        }
    }

    fun searchDealerships(filters: DealershipSearchFilters): List<Dealership> {
        logger.info("Starting search for dealerships with filters - businessName: {}, city: {}, province: {}",
            filters.businessName, filters.city, filters.province)

        return try {
            var dealerships = dealershipRepository.findByActiveTrue()

            filters.businessName?.let { name ->
                require(name.isNotBlank()) { "Business name filter cannot be empty" }
                dealerships =
                    dealerships.filter {
                        it.businessName.contains(name, ignoreCase = true)
                    }
            }

            filters.city?.let { city ->
                require(city.isNotBlank()) { "City filter cannot be empty" }
                dealerships =
                    dealerships.filter {
                        it.city?.equals(city, ignoreCase = true) == true
                    }
            }

            filters.province?.let { province ->
                require(province.isNotBlank()) { "Province filter cannot be empty" }
                dealerships =
                    dealerships.filter {
                        it.province?.equals(province, ignoreCase = true) == true
                    }
            }

            filters.cuit?.let { cuit ->
                require(cuit.isNotBlank()) { "CUIT filter cannot be empty" }
                dealerships =
                    dealerships.filter {
                        it.cuit.contains(cuit, ignoreCase = true)
                    }
            }

            val sortedDealerships = dealerships.sortedByDescending { it.registrationDate }
            logger.info("Dealership search completed. Found {} dealerships matching filters", sortedDealerships.size)
            sortedDealerships
        } catch (e: IllegalArgumentException) {
            logger.warn("Validation error in dealership search: {}", e.message)
            throw e
        } catch (e: Exception) {
            logger.error("Error searching dealerships", e)
            throw RuntimeException("Error searching dealerships", e)
        }
    }

    @Transactional
    fun createDealership(request: DealershipCreateRequest): Dealership {
        logger.info("Starting creation of Dealership with business name: {} and CUIT: {}", request.businessName, request.cuit)

        return try {
            validateDealershipCreate(request)
            val dealership = request.toEntity()

            dealership.password = passwordEncoder.encode(dealership.password)

            validateDealership(dealership)
            val savedDealership = dealershipRepository.save(dealership)
            logger.info("Dealership created successfully with ID: {} and CUIT: {}", savedDealership.id, savedDealership.cuit)
            savedDealership
        } catch (e: IllegalArgumentException) {
            logger.warn("Validation error when creating dealership: {}", e.message)
            throw e
        } catch (e: Exception) {
            logger.error("Error creating dealership", e)
            throw RuntimeException("Error creating dealership", e)
        }
    }

    @Transactional
    fun updateDealership(
        id: Long,
        updateData: Map<String, Any>,
    ): Dealership {
        logger.info("Starting update of Dealership with ID: {}", id)

        return try {
            require(id > 0) { "Dealership ID must be positive" }
            require(updateData.isNotEmpty()) { "Update data cannot be empty" }

            val dealership = findById(id)

            updateData["businessName"]?.let {
                val value = it.toString().trim()
                require(value.isNotBlank()) { "Business name cannot be empty" }
                dealership.businessName = value
            }
            updateData["email"]?.let {
                val value = it.toString().trim()
                require(value.isNotBlank()) { "Email cannot be empty" }
                dealership.email = value
            }
            updateData["phone"]?.let {
                val value = it.toString().trim()
                if (value.isNotBlank()) dealership.phone = value
            }
            updateData["address"]?.let { dealership.address = it.toString().trim() }
            updateData["city"]?.let { dealership.city = it.toString().trim() }
            updateData["province"]?.let { dealership.province = it.toString().trim() }
            updateData["description"]?.let { dealership.description = it.toString().trim() }
            updateData["active"]?.let {
                dealership.active = it.toString().toBooleanStrictOrNull()
                    ?: throw IllegalArgumentException("Invalid boolean value for active field")
            }

            validateDealership(dealership)
            val updatedDealership = dealershipRepository.save(dealership)
            logger.info("Dealership ID {} updated successfully. Changed fields: {}", id, updateData.keys.joinToString(", "))
            updatedDealership
        } catch (e: IllegalArgumentException) {
            logger.warn("Validation error when updating dealership {}: {}", id, e.message)
            throw e
        } catch (e: NoSuchElementException) {
            throw e
        } catch (e: Exception) {
            logger.error("Error updating dealership with ID {}", id, e)
            throw RuntimeException("Error updating dealership with ID $id", e)
        }
    }

    @Transactional
    fun deactivate(id: Long): Dealership {
        logger.info("Starting deactivation of Dealership with ID: {}", id)

        return try {
            require(id > 0) { "Dealership ID must be positive" }
            val dealership = findById(id)

            if (!dealership.active) {
                logger.warn("Attempt to deactivate already inactive dealership with ID: {}", id)
                throw IllegalStateException("Dealership is already deactivated")
            }

            dealership.deactivate()
            val deactivatedDealership = dealershipRepository.save(dealership)
            logger.info("Dealership ID {} deactivated successfully", id)
            deactivatedDealership
        } catch (e: IllegalArgumentException) {
            logger.warn("Validation error when deactivating dealership: {}", e.message)
            throw e
        } catch (e: IllegalStateException) {
            logger.warn("State error when deactivating dealership: {}", e.message)
            throw e
        } catch (e: NoSuchElementException) {
            throw e
        } catch (e: Exception) {
            logger.error("Error deactivating dealership with ID {}", id, e)
            throw RuntimeException("Error deactivating dealership with ID $id", e)
        }
    }

    @Transactional
    fun activate(id: Long): Dealership {
        logger.info("Starting activation of Dealership with ID: {}", id)

        return try {
            require(id > 0) { "Dealership ID must be positive" }
            val dealership = findById(id)

            if (dealership.active) {
                logger.warn("Attempt to activate already active dealership with ID: {}", id)
                throw IllegalStateException("Dealership is already active")
            }

            dealership.activate()
            val activatedDealership = dealershipRepository.save(dealership)
            logger.info("Dealership ID {} activated successfully", id)
            activatedDealership
        } catch (e: IllegalArgumentException) {
            logger.warn("Validation error when activating dealership: {}", e.message)
            throw e
        } catch (e: IllegalStateException) {
            logger.warn("State error when activating dealership: {}", e.message)
            throw e
        } catch (e: NoSuchElementException) {
            throw e
        } catch (e: Exception) {
            logger.error("Error activating dealership with ID {}", id, e)
            throw RuntimeException("Error activating dealership with ID $id", e)
        }
    }

    @Transactional
    fun deleteDealership(id: Long) {
        logger.info("Starting deletion of Dealership with ID: {}", id)

        try {
            require(id > 0) { "Dealership ID must be positive" }
            val dealership = findById(id)
            dealershipRepository.delete(dealership)
            logger.info("Dealership ID {} deleted successfully", id)
        } catch (e: IllegalArgumentException) {
            logger.warn("Validation error when deleting dealership: {}", e.message)
            throw e
        } catch (e: NoSuchElementException) {
            throw e
        } catch (e: Exception) {
            logger.error("Error deleting dealership with ID {}", id, e)
            throw RuntimeException("Error deleting dealership with ID $id", e)
        }
    }

    private fun validateDealershipCreate(request: DealershipCreateRequest) {
        try {
            dealershipRepository.findByCuit(request.cuit)?.let {
                logger.warn("Attempt to create dealership with existing CUIT: {}", request.cuit)
                throw IllegalArgumentException("Dealership with CUIT ${request.cuit} already exists")
            }

            dealershipRepository.findByEmail(request.email)?.let {
                logger.warn("Attempt to create dealership with existing email: {}", request.email)
                throw IllegalArgumentException("Dealership with email ${request.email} already exists")
            }
        } catch (e: IllegalArgumentException) {
            throw e
        } catch (e: Exception) {
            logger.error("Error validating dealership creation", e)
            throw RuntimeException("Error validating dealership creation", e)
        }
    }

    private fun validateDealership(dealership: Dealership) {
        try {
            require(dealership.businessName.isNotBlank()) { "Business name cannot be empty" }
            require(dealership.cuit.isNotBlank()) { "CUIT cannot be empty" }
            require(dealership.email.isNotBlank()) { "Email cannot be empty" }
            require(dealership.firstName.isNotBlank()) { "First name cannot be empty" }
            require(dealership.lastName.isNotBlank()) { "Last name cannot be empty" }

            dealership.phone.let { phone ->
                require(phone.isNotBlank()) { "Phone cannot be empty if provided" }
                require(phone.length >= 10) { "Phone must be at least 10 characters" }
            }

            // Basic email validation
            require(dealership.email.contains("@") && dealership.email.contains(".")) {
                "Invalid email format"
            }

            // CUIT format validation
            require(dealership.cuit.length == 11) { "CUIT must be exactly 11 characters" }
            require(dealership.cuit.all { it.isDigit() }) { "CUIT must contain only digits" }

            logger.debug("Dealership validation completed successfully")
        } catch (e: IllegalArgumentException) {
            throw e
        } catch (e: Exception) {
            logger.error("Error validating dealership data", e)
            throw RuntimeException("Error validating dealership data", e)
        }
    }
}
