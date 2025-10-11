package cta.service

import cta.repository.UserRepository
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
    override fun loadUserByUsername(email: String): UserDetails {
        val usuario =
            userRepository.findByEmail(email)
                ?: throw UsernameNotFoundException("User not found with the following email: $email")

        // Get role based on the user type
        val role =
            when {
                usuario.javaClass.simpleName == "Administrator" -> "ROLE_ADMIN"
                usuario.javaClass.simpleName == "Dealership" -> "ROLE_DEALERSHIP"
                usuario.javaClass.simpleName == "Buyer" -> "ROLE_BUYER"
                else -> "ROLE_USER"
            }

        val authorities = listOf(SimpleGrantedAuthority(role))

        return User(
            usuario.email,
            usuario.password,
            usuario.active,
            true, // accountNonExpired
            true, // credentialsNonExpired
            true, // accountNonLocked
            authorities,
        )
    }
}
