package cta.service

import cta.model.Buyer
import cta.repository.BuyerRepository
import org.slf4j.LoggerFactory
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class BuyerService(
    private val buyerRepository: BuyerRepository,
) {
    private val logger = LoggerFactory.getLogger(javaClass)

    fun findById(id: Long): Buyer {
        logger.debug("Fetching Buyer with ID: {}", id)

        return buyerRepository.findByIdOrNull(id)
            ?.also { logger.debug("Buyer found: {}", it.id) }
            ?: run {
                logger.warn("Buyer with ID {} not found", id)
                throw NoSuchElementException("Buyer with ID $id not found")
            }
    }

    @Transactional
    fun createBuyer(buyer: Buyer): Buyer {
        logger.info("Starting creation of Buyer with email: {}", buyer.email)

        return try {
            validateBuyer(buyer)
            val savedBuyer = buyerRepository.save(buyer)
            logger.info("Buyer created successfully with ID: {} and email: {}", savedBuyer.id, savedBuyer.email)
            savedBuyer
        } catch (ex: IllegalArgumentException) {
            logger.warn("Validation error when creating Buyer: {}", ex.message)
            throw ex
        } catch (ex: Exception) {
            logger.error("Unexpected error when creating Buyer with email: {}", buyer.email, ex)
            throw ex
        }
    }

    @Transactional
    fun updateBuyer(
        id: Long,
        updateData: Map<String, Any>,
    ): Buyer {
        logger.info("Starting update of Buyer with ID: {}", id)

        val buyer =
            buyerRepository.findByIdOrNull(id)
                ?: run {
                    logger.warn("Attempt to update non-existent Buyer with ID: {}", id)
                    throw Exception("Buyer with ID $id not found")
                }

        try {
            updateData["dni"]?.let { buyer.dni = it.toString().toInt() }
            updateData["address"]?.let { buyer.address = (it.toString()) }
            updateData["email"]?.let { buyer.email = (it.toString()) }
            updateData["phone"]?.let { buyer.phone = (it.toString()) }
            updateData["active"]?.let { buyer.active = (it.toString().toBoolean()) }

            validateBuyer(buyer)

            val updatedBuyer = buyerRepository.save(buyer)
            logger.info("Buyer ID {} updated successfully. Changed fields: {}", id, updateData.keys.joinToString(", "))

            return updatedBuyer
        } catch (ex: IllegalArgumentException) {
            logger.warn("Validation error when updating Buyer {}: {}", id, ex.message)
            throw ex
        } catch (ex: Exception) {
            logger.error("Unexpected error when updating Buyer with ID: {}", id, ex)
            throw ex
        }
    }

    @Transactional
    fun deleteBuyer(id: Long) {
        logger.info("Starting deletion of Buyer with ID: {}", id)

        val buyer =
            buyerRepository.findByIdOrNull(id)
                ?: run {
                    logger.warn("Attempt to delete non-existent Buyer with ID: {}", id)
                    throw Exception("Buyer with ID $id not found")
                }

        try {
            buyerRepository.delete(buyer)
            logger.info("Buyer ID {} deleted successfully", id)
        } catch (ex: Exception) {
            logger.error("Error when deleting Buyer with ID: {}", id, ex)
            throw ex
        }
    }

    private fun validateBuyer(buyer: Buyer) {
        require(buyer.address.isNotBlank()) { "Address cannot be empty" }
        require(buyer.dni > 0) { "DNI must be a positive number" }
        require(buyer.dni.toString().length in 7..8) { "DNI must be 7 or 8 digits" }
        logger.debug("Buyer validation completed successfully")
    }
}
