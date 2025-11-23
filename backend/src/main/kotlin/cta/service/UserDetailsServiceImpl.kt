package cta.service

import cta.repository.UserRepository
import org.slf4j.LoggerFactory
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.User
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service

@Service
class UserDetailsServiceImpl(
    private val userRepository: UserRepository,
) : UserDetailsService {
    private val logger = LoggerFactory.getLogger(javaClass)

    override fun loadUserByUsername(email: String): UserDetails {
        logger.debug("Loading user details for email: {}", email)

        val usuario =
            userRepository.findByEmail(email)
                ?: run {
                    logger.warn("User not found with email: {}", email)
                    throw UsernameNotFoundException("User not found with the following email: $email")
                }

        // Get role based on the user type
        val role =
            when {
                usuario.javaClass.simpleName == "Administrator" -> "ROLE_ADMIN"
                usuario.javaClass.simpleName == "Dealership" -> "ROLE_DEALERSHIP"
                usuario.javaClass.simpleName == "Buyer" -> "ROLE_BUYER"
                else -> "ROLE_USER"
            }

        logger.debug("User found with email: {} and role: {}", email, role)

        val authorities = listOf(SimpleGrantedAuthority(role))

        return User(
            usuario.email,
            usuario.password,
            usuario.active,
            true,
            true,
            true,
            authorities,
        ).also {
            logger.info("UserDetails loaded successfully for email: {}", email)
        }
    }
}
