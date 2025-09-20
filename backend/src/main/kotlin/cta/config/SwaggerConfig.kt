package cta.config

import io.swagger.v3.oas.models.OpenAPI
import io.swagger.v3.oas.models.info.Info
import io.swagger.v3.oas.models.servers.Server
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
@ConditionalOnProperty(
    name = ["swagger.enabled"],
    havingValue = "true",
    matchIfMissing = true
)
class SwaggerConfig {

    @Value("\${app.environment:development}")
    private lateinit var environment: String

    @Bean
    fun openAPI(): OpenAPI {
        return OpenAPI()
            .info(
                Info()
                    .title("CTA API")
                    .version("0.0.1")
                    .description("Car Trading Application API")
            )
            .servers(getEnvironmentServers())
    }

    private fun getEnvironmentServers(): List<Server> {
        return when (environment) {
            "production" -> listOf(
                Server().url("https://api.cta.com").description("Production")
            )
            else -> listOf(
                Server().url("http://localhost:8080").description("Local/Development")
            )
        }
    }
}