package cta.service

import cta.model.Dealership
import cta.repository.DealershipRepository
import cta.web.dto.DealershipCreateRequest
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.NoSuchElementException

@Service
class DealershipService(
    private val dealershipRepository: DealershipRepository,
) {
    fun findById(id: Long): Dealership {
        return try {
            dealershipRepository.findByIdOrNull(id)
                ?: throw NoSuchElementException("Dealership with ID $id not found")
        } catch (e: Exception) {
            when (e) {
                is NoSuchElementException -> throw e
                else -> throw RuntimeException("Error retrieving dealership with ID $id", e)
            }
        }
    }

    fun findAll(): List<Dealership> {
        return try {
            dealershipRepository.findAll()
        } catch (e: Exception) {
            throw RuntimeException("Error retrieving all dealerships", e)
        }
    }

    fun findActive(): List<Dealership> {
        return try {
            dealershipRepository.findByActiveTrue()
        } catch (e: Exception) {
            throw RuntimeException("Error retrieving active dealerships", e)
        }
    }

    fun findByCuit(cuit: String): Dealership? {
        return try {
            require(cuit.isNotBlank()) { "CUIT cannot be empty" }
            dealershipRepository.findByCuit(cuit)
        } catch (e: IllegalArgumentException) {
            throw e
        } catch (e: Exception) {
            throw RuntimeException("Error searching dealership by CUIT", e)
        }
    }

    fun findByEmail(email: String): Dealership? {
        return try {
            require(email.isNotBlank()) { "Email cannot be empty" }
            dealershipRepository.findByEmail(email)
        } catch (e: IllegalArgumentException) {
            throw e
        } catch (e: Exception) {
            throw RuntimeException("Error searching dealership by email", e)
        }
    }

    fun searchDealerships(filters: DealershipSearchFilters): List<Dealership> {
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

            dealerships.sortedByDescending { it.registrationDate }
        } catch (e: IllegalArgumentException) {
            throw e
        } catch (e: Exception) {
            throw RuntimeException("Error searching dealerships", e)
        }
    }

    @Transactional
    fun createDealership(request: DealershipCreateRequest): Dealership {
        return try {
            validateDealershipCreate(request)
            val dealership = request.toEntity()
            validateDealership(dealership)
            dealershipRepository.save(dealership)
        } catch (e: IllegalArgumentException) {
            throw e
        } catch (e: Exception) {
            throw RuntimeException("Error creating dealership", e)
        }
    }

    @Transactional
    fun updateDealership(
        id: Long,
        updateData: Map<String, Any>,
    ): Dealership {
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
            dealershipRepository.save(dealership)
        } catch (e: IllegalArgumentException) {
            throw e
        } catch (e: NoSuchElementException) {
            throw e
        } catch (e: Exception) {
            throw RuntimeException("Error updating dealership with ID $id", e)
        }
    }

    @Transactional
    fun deactivate(id: Long): Dealership {
        return try {
            require(id > 0) { "Dealership ID must be positive" }
            val dealership = findById(id)

            if (!dealership.active) {
                throw IllegalStateException("Dealership is already deactivated")
            }

            dealership.deactivate()
            dealershipRepository.save(dealership)
        } catch (e: IllegalArgumentException) {
            throw e
        } catch (e: IllegalStateException) {
            throw e
        } catch (e: NoSuchElementException) {
            throw e
        } catch (e: Exception) {
            throw RuntimeException("Error deactivating dealership with ID $id", e)
        }
    }

    @Transactional
    fun activate(id: Long): Dealership {
        return try {
            require(id > 0) { "Dealership ID must be positive" }
            val dealership = findById(id)

            if (dealership.active) {
                throw IllegalStateException("Dealership is already active")
            }

            dealership.activate()
            dealershipRepository.save(dealership)
        } catch (e: IllegalArgumentException) {
            throw e
        } catch (e: IllegalStateException) {
            throw e
        } catch (e: NoSuchElementException) {
            throw e
        } catch (e: Exception) {
            throw RuntimeException("Error activating dealership with ID $id", e)
        }
    }

    @Transactional
    fun deleteDealership(id: Long) {
        try {
            require(id > 0) { "Dealership ID must be positive" }
            val dealership = findById(id)
            dealershipRepository.delete(dealership)
        } catch (e: IllegalArgumentException) {
            throw e
        } catch (e: NoSuchElementException) {
            throw e
        } catch (e: Exception) {
            throw RuntimeException("Error deleting dealership with ID $id", e)
        }
    }

    private fun validateDealershipCreate(request: DealershipCreateRequest) {
        try {
            dealershipRepository.findByCuit(request.cuit)?.let {
                throw IllegalArgumentException("Dealership with CUIT ${request.cuit} already exists")
            }

            dealershipRepository.findByEmail(request.email)?.let {
                throw IllegalArgumentException("Dealership with email ${request.email} already exists")
            }
        } catch (e: IllegalArgumentException) {
            throw e
        } catch (e: Exception) {
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

            dealership.phone?.let { phone ->
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
        } catch (e: IllegalArgumentException) {
            throw e
        } catch (e: Exception) {
            throw RuntimeException("Error validating dealership data", e)
        }
    }
}
