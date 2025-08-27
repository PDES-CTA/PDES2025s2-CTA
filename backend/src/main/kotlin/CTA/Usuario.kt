package CTA

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "usuarios")
data class Usuario(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int = 0,

    @Column(nullable = false, length = 100)
    val nombre: String = "",

    @Column(nullable = false, length = 100, unique = true)
    val email: String = "",

    @Column(nullable = false)
    val edad: Int = 0,

    @Column(name = "fecha_registro", nullable = false)
    val fechaRegistro: LocalDateTime = LocalDateTime.now()
)