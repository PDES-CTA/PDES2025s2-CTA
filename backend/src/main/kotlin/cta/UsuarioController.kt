package cta

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = ["http://localhost:3000"]) // Para React
class UsuarioController(private val usuarioRepository: UserRepository) {

    @GetMapping
    fun obtenerTodos(): List<Usuario> {
        return usuarioRepository.findAll()
    }

    @GetMapping("/{id}")
    fun obtenerPorId(@PathVariable id: Int): ResponseEntity<Usuario> {
        val usuario = usuarioRepository.findById(id)
        return if (usuario.isPresent) {
            ResponseEntity.ok(usuario.get())
        } else {
            ResponseEntity.notFound().build()
        }
    }
}