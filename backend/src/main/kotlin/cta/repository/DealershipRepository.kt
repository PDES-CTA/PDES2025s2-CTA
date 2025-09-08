package cta.repository

import cta.model.Dealership
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface DealershipRepository : JpaRepository<Dealership, Long> {

    fun findByActiveTrue(): List<Dealership>

    fun findByCuit(cuit: String): Dealership?

    fun findByEmail(email: String): Dealership?

    fun findByBusinessNameContainingIgnoreCase(businessName: String): List<Dealership>

    fun findByCity(city: String): List<Dealership>

    fun findByProvince(province: String): List<Dealership>

    fun findByCityAndActiveTrue(city: String): List<Dealership>

    fun findByProvinceAndActiveTrue(province: String): List<Dealership>

    @Query("""
        SELECT d FROM Dealership d 
        WHERE d.active = true 
        ORDER BY d.registrationDate DESC
    """)
    fun findActiveOrderedByRegistrationDate(): List<Dealership>
}