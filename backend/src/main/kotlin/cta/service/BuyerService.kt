package cta.service

import cta.model.Buyer
import cta.repository.BuyerRepository
import jakarta.transaction.Transactional
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service

@Service
class BuyerService(
    private val buyerRepository: BuyerRepository
) {

    fun findById(id : Long) : Buyer {
        return buyerRepository.findByIdOrNull(id)
            ?: throw NoSuchElementException("Buyer with ID $id not found")
    }

    @Transactional
    fun createBuyer(buyer: Buyer): Buyer {
        validateBuyer(buyer)
        return buyerRepository.save(buyer)
    }

    @Transactional
    fun updateBuyer(id: Long, updateData: Map<String, Any>): Buyer {
        val buyer = buyerRepository.findByIdOrNull(id)
            ?: throw Exception("Favorite car with ID $id not found")

        updateData["rating"]?.let { buyer.dni = (it.toString()) }
        updateData["comment"]?.let { buyer.address = (it.toString()) }

        validateBuyer(buyer)
        return buyerRepository.save(buyer)
    }

    @Transactional
    fun deleteBuyer(id: Long) {
        val favoriteCar = buyerRepository.findByIdOrNull(id)
            ?: throw Exception("Favorite car with ID $id not found")
        buyerRepository.delete(favoriteCar)
    }

    private fun validateBuyer(buyer: Buyer) {
        require(buyer.address!!.isNotBlank()) { "Address cannot be empty" }
        require(buyer.dni!!.matches(Regex("^\\d{2}\\.\\d{3}\\.\\d{3}$|^\\d{3}\\.\\d{3}\\.\\d{3}$"))) {
            "DNI must follow the format XX.XXX.XXX or XXX.XXX.XXX"
        }
    }
}