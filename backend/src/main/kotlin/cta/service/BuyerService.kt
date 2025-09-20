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

        updateData["dni"]?.let { buyer.dni = (it.toString().toInt()) }
        updateData["address"]?.let { buyer.address = (it.toString()) }
        updateData["email"]?.let { buyer.email = (it.toString()) }
        updateData["phone"]?.let { buyer.phone = (it.toString()) }
        updateData["active"]?.let { buyer.active = (it.toString().toBoolean()) }

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
        require(buyer.dni.toString().length in 6..9) { "Dni cannot be null" }
    }
}