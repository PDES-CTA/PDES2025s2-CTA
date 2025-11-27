package cta.web.controller

import cta.config.JwtTokenProvider
import cta.enum.UserRole
import cta.model.Buyer
import cta.repository.UserRepository
import cta.service.BuyerService
import cta.web.dto.BuyerCreateRequest
import cta.web.dto.LoginRequest
import cta.web.dto.LoginResponse
import cta.web.dto.UserResponse
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = ["http://localhost:5173", "http://localhost:3000"])
class AuthController(
    private val authenticationManager: AuthenticationManager,
    private val jwtTokenProvider: JwtTokenProvider,
    private val userDetailsService: UserDetailsService,
    private val buyerService: BuyerService,
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
) {
    @PostMapping("/login")
    fun login(
        @Valid @RequestBody loginRequest: LoginRequest,
    ): ResponseEntity<LoginResponse> {
        // Auth user
        val authentication: Authentication =
            authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken(
                    loginRequest.email,
                    loginRequest.password,
                ),
            )

        SecurityContextHolder.getContext().authentication = authentication

        // Generate token
        val userDetails = userDetailsService.loadUserByUsername(loginRequest.email)
        val token = jwtTokenProvider.generateToken(userDetails)

        // Get full user
        val usuario =
            userRepository.findByEmail(loginRequest.email)
                ?: throw RuntimeException("User not found")

        val response =
            LoginResponse(
                token = token,
                type = "Bearer",
                id = usuario.id!!,
                email = usuario.email,
                nombre = usuario.firstName,
                apellido = usuario.lastName,
                role = userDetails.authorities.first().authority.removePrefix("ROLE_"),
            )

        return ResponseEntity.ok(response)
    }

    @PostMapping("/register")
    fun register(
        @Valid @RequestBody request: BuyerCreateRequest,
    ): ResponseEntity<UserResponse> {
        // Verify if email already exists
        if (userRepository.existsByEmail(request.email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build()
        }

        // Create a new Buyer using factory method
        val buyer =
            Buyer.create(
                email = request.email,
                password = passwordEncoder.encode(request.password),
                firstName = request.firstName,
                lastName = request.lastName,
                phone = request.phone,
                address = request.address,
                dni = request.dni,
            )

        val savedBuyer = buyerService.createBuyer(buyer)

        val response =
            UserResponse(
                id = savedBuyer.id!!,
                email = savedBuyer.email,
                firstName = savedBuyer.firstName,
                lastName = savedBuyer.lastName,
                phone = savedBuyer.phone,
                role = UserRole.BUYER,
            )

        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    @GetMapping("/me")
    fun getCurrentUser(): ResponseEntity<UserResponse> {
        val authentication = SecurityContextHolder.getContext().authentication
        val email = authentication.name

        val usuario =
            userRepository.findByEmail(email)
                ?: throw RuntimeException("User not found")

        val response =
            UserResponse(
                id = usuario.id!!,
                email = usuario.email,
                firstName = usuario.firstName,
                lastName = usuario.lastName,
                phone = usuario.phone,
                role = usuario.role,
            )

        return ResponseEntity.ok(response)
    }
}
