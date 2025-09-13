package cta.repository

import cta.model.Buyer
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface BuyerRepository : JpaRepository<Buyer, Long> {

}