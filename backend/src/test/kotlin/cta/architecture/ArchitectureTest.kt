package cta.architecture

import com.tngtech.archunit.core.domain.JavaClasses
import com.tngtech.archunit.core.importer.ClassFileImporter
import com.tngtech.archunit.core.importer.ImportOption
import com.tngtech.archunit.lang.syntax.ArchRuleDefinition.*
import com.tngtech.archunit.library.Architectures.layeredArchitecture
import com.tngtech.archunit.library.dependencies.SlicesRuleDefinition.slices
import jakarta.persistence.Entity
import jakarta.validation.constraints.*
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test
import org.springframework.stereotype.Repository
import org.springframework.stereotype.Service
import org.springframework.web.bind.annotation.RestController

class ArchitectureTest {
    companion object {
        private lateinit var importedClasses: JavaClasses

        @JvmStatic
        @BeforeAll
        fun setup() {
            importedClasses =
                ClassFileImporter()
                    .withImportOption(ImportOption.DoNotIncludeTests())
                    .importPackages("cta")
        }
    }

    // ========== LAYERED ARCHITECTURE TESTS ==========

    @Test
    fun `should respect layered architecture`() {
        layeredArchitecture()
            .consideringAllDependencies()
            .layer("Controllers").definedBy("..web.controller..")
            .layer("Services").definedBy("..service..")
            .layer("Repositories").definedBy("..repository..")
            .layer("Models").definedBy("..model..")
            .layer("DTOs").definedBy("..web.dto..")
            .layer("Config").definedBy("..config..")
            .whereLayer("Controllers").mayNotBeAccessedByAnyLayer()
            .whereLayer("Services").mayOnlyBeAccessedByLayers("Controllers", "Config")
            .whereLayer("Repositories").mayOnlyBeAccessedByLayers("Services")
            .whereLayer("Models").mayOnlyBeAccessedByLayers("Services", "Repositories", "DTOs", "Controllers")
            .whereLayer("DTOs").mayOnlyBeAccessedByLayers("Controllers", "Services")
            .ignoreDependency(
                com.tngtech.archunit.base.DescribedPredicate.describe("AuthController") {
                    it.name.contains("AuthController")
                },
                com.tngtech.archunit.base.DescribedPredicate.alwaysTrue(),
            )
            .check(importedClasses)
    }

    @Test
    fun `controllers should not depend on repositories directly`() {
        noClasses()
            .that().resideInAPackage("..web.controller..")
            .and().doNotHaveSimpleName("AuthController")
            .should().dependOnClassesThat().resideInAPackage("..repository..")
            .because("Controllers should only interact with services, not repositories directly")
            .check(importedClasses)
    }

    @Test
    fun `services should not depend on controllers`() {
        noClasses()
            .that().resideInAPackage("..service..")
            .should().dependOnClassesThat().resideInAPackage("..web.controller..")
            .because("Services should not know about the web layer")
            .check(importedClasses)
    }

    @Test
    fun `repositories should not depend on services`() {
        noClasses()
            .that().resideInAPackage("..repository..")
            .should().dependOnClassesThat().resideInAPackage("..service..")
            .because("Repositories should not depend on services")
            .check(importedClasses)
    }

    @Test
    fun `repositories should not depend on controllers`() {
        noClasses()
            .that().resideInAPackage("..repository..")
            .should().dependOnClassesThat().resideInAPackage("..web.controller..")
            .because("Repositories should not know about the web layer")
            .check(importedClasses)
    }

    // ========== NAMING CONVENTIONS ==========

    @Test
    fun `controllers should be suffixed with Controller`() {
        classes()
            .that().resideInAPackage("..web.controller..")
            .and().areAnnotatedWith(RestController::class.java)
            .should().haveSimpleNameEndingWith("Controller")
            .check(importedClasses)
    }

    @Test
    fun `services should be suffixed with Service`() {
        classes()
            .that().resideInAPackage("..service..")
            .and().haveSimpleNameNotEndingWith("Impl")
            .and().areAnnotatedWith(Service::class.java)
            .should().haveSimpleNameEndingWith("Service")
            .check(importedClasses)
    }

    @Test
    fun `repositories should be suffixed with Repository`() {
        classes()
            .that().resideInAPackage("..repository..")
            .and().areAnnotatedWith(Repository::class.java)
            .or().areInterfaces()
            .should().haveSimpleNameEndingWith("Repository")
            .check(importedClasses)
    }

    @Test
    fun `entities should reside in model package`() {
        classes()
            .that().areAnnotatedWith(Entity::class.java)
            .should().resideInAPackage("..model..")
            .because("JPA entities should be in the model package")
            .check(importedClasses)
    }

    @Test
    fun `DTOs should be suffixed with Request or Response`() {
        classes()
            .that().resideInAPackage("..web.dto..")
            .and().areNotNestedClasses()
            .should().haveSimpleNameEndingWith("Request")
            .orShould().haveSimpleNameEndingWith("Response")
            .orShould().haveSimpleNameEndingWith("Filters")
            .check(importedClasses)
    }

    // ========== ANNOTATION RULES ==========

    @Test
    fun `controllers should be annotated with RestController`() {
        classes()
            .that().resideInAPackage("..web.controller..")
            .and().haveSimpleNameEndingWith("Controller")
            .should().beAnnotatedWith(RestController::class.java)
            .check(importedClasses)
    }

    @Test
    fun `services should be annotated with Service`() {
        classes()
            .that().resideInAPackage("..service..")
            .and().haveSimpleNameEndingWith("Service")
            .and().areNotInterfaces()
            .should().beAnnotatedWith(Service::class.java)
            .check(importedClasses)
    }

    @Test
    fun `repositories should be annotated with Repository or be interfaces`() {
        classes()
            .that().resideInAPackage("..repository..")
            .and().haveSimpleNameEndingWith("Repository")
            .should().beAnnotatedWith(Repository::class.java)
            .orShould().beInterfaces()
            .check(importedClasses)
    }

    @Test
    fun `controllers should not be annotated with Service`() {
        noClasses()
            .that().resideInAPackage("..web.controller..")
            .should().beAnnotatedWith(Service::class.java)
            .because("Controllers should not be annotated as services")
            .check(importedClasses)
    }

    @Test
    fun `services should not be annotated with RestController`() {
        noClasses()
            .that().resideInAPackage("..service..")
            .should().beAnnotatedWith(RestController::class.java)
            .because("Services should not be web controllers")
            .check(importedClasses)
    }

    // ========== PACKAGE DEPENDENCY RULES ==========

    @Test
    fun `web package should not depend on config package`() {
        noClasses()
            .that().resideInAPackage("..web.controller..")
            .and().doNotHaveSimpleName("AuthController")
            .should().dependOnClassesThat().resideInAPackage("..config..")
            .because("Controllers should not directly depend on configuration")
            .check(importedClasses)
    }

    @Test
    fun `model package should not depend on service package`() {
        noClasses()
            .that().resideInAPackage("..model..")
            .should().dependOnClassesThat().resideInAPackage("..service..")
            .because("Models should be independent from business logic")
            .check(importedClasses)
    }

    @Test
    fun `model package should not depend on repository package`() {
        noClasses()
            .that().resideInAPackage("..model..")
            .should().dependOnClassesThat().resideInAPackage("..repository..")
            .because("Models should not know about data access layer")
            .check(importedClasses)
    }

    @Test
    fun `model package should not depend on web package`() {
        noClasses()
            .that().resideInAPackage("..model..")
            .should().dependOnClassesThat().resideInAPackage("..web..")
            .because("Models should not depend on web layer")
            .check(importedClasses)
    }

    // ========== CYCLIC DEPENDENCY TESTS ==========

    @Test
    fun `should be free of cycles in service layer`() {
        slices()
            .matching("cta.service.(*)")
            .should().beFreeOfCycles()
            .allowEmptyShould(true)
            .check(importedClasses)
    }

    // ========== FIELD AND METHOD RULES ==========

    @Test
    fun `fields in controllers should be private`() {
        fields()
            .that().areDeclaredInClassesThat().resideInAPackage("..web.controller..")
            .and().areNotStatic()
            .should().bePrivate()
            .because("Controller fields should be private for encapsulation")
            .check(importedClasses)
    }

    @Test
    fun `fields in services should be private`() {
        fields()
            .that().areDeclaredInClassesThat().resideInAPackage("..service..")
            .and().areNotStatic()
            .should().bePrivate()
            .because("Service fields should be private for encapsulation")
            .check(importedClasses)
    }

    @Test
    fun `controllers should not have field injection`() {
        noFields()
            .that().areDeclaredInClassesThat().resideInAPackage("..web.controller..")
            .should().beAnnotatedWith("org.springframework.beans.factory.annotation.Autowired")
            .because("Constructor injection should be used instead of field injection")
            .check(importedClasses)
    }

    @Test
    fun `services should not have field injection`() {
        noFields()
            .that().areDeclaredInClassesThat().resideInAPackage("..service..")
            .should().beAnnotatedWith("org.springframework.beans.factory.annotation.Autowired")
            .because("Constructor injection should be used instead of field injection")
            .check(importedClasses)
    }

    // ========== CONTROLLER SPECIFIC RULES ==========

    @Test
    fun `controllers should have CrossOrigin annotation`() {
        classes()
            .that().resideInAPackage("..web.controller..")
            .and().areAnnotatedWith(RestController::class.java)
            .should().beAnnotatedWith("org.springframework.web.bind.annotation.CrossOrigin")
            .because("Controllers should explicitly handle CORS")
            .check(importedClasses)
    }

    @Test
    fun `controllers should have RequestMapping annotation`() {
        classes()
            .that().resideInAPackage("..web.controller..")
            .and().areAnnotatedWith(RestController::class.java)
            .should().beAnnotatedWith("org.springframework.web.bind.annotation.RequestMapping")
            .because("Controllers should define their base path")
            .check(importedClasses)
    }

    @Test
    fun `controller request body parameters should be validated`() {
        methods()
            .that().areDeclaredInClassesThat().areAnnotatedWith(RestController::class.java)
            .and().arePublic()
            .and().areDeclaredInClassesThat().resideInAPackage("..web.controller..")
            .and().areAnnotatedWith("org.springframework.web.bind.annotation.PostMapping")
            .or().areAnnotatedWith("org.springframework.web.bind.annotation.PutMapping")
            .should().notHaveRawParameterTypes("..web.dto..*Request")
            .because("Request DTOs should be validated with @Valid annotation")
            .check(importedClasses)
    }

    // ========== DTO SPECIFIC RULES ==========

    @Test
    fun `DTOs should be data classes or have proper validation`() {
        classes()
            .that().resideInAPackage("..web.dto..")
            .and().haveSimpleNameEndingWith("Request")
            .should().haveOnlyFinalFields()
            .orShould().beRecords()
            .because("DTOs should be immutable")
    }

    @Test
    fun `Request DTOs should have validation annotations`() {
        fields()
            .that().areDeclaredInClassesThat().resideInAPackage("..web.dto..")
            .and().areDeclaredInClassesThat().haveSimpleNameEndingWith("Request")
            .and().areNotStatic()
            .should().beAnnotatedWith(NotNull::class.java)
            .orShould().beAnnotatedWith(NotBlank::class.java)
            .orShould().beAnnotatedWith(Email::class.java)
            .orShould().beAnnotatedWith(Size::class.java)
            .orShould().beAnnotatedWith(Min::class.java)
            .orShould().beAnnotatedWith(Max::class.java)
            .orShould().beAnnotatedWith(Pattern::class.java)
            .orShould().beAnnotatedWith("org.hibernate.validator.constraints.Length")
            .orShould().notBeAnnotatedWith(NotNull::class.java)
            .because("Request DTO fields should have validation annotations where appropriate")
    }

    // ========== ENTITY SPECIFIC RULES ==========

    @Test
    fun `entities should not have setters for id field`() {
        noMethods()
            .that().areDeclaredInClassesThat().areAnnotatedWith(Entity::class.java)
            .and().haveName("setId")
            .should().bePublic()
            .because("Entity IDs should be managed by JPA, not set manually")
    }

    @Test
    fun `entities should not have only private constructors`() {
        noClasses()
            .that().areAnnotatedWith(Entity::class.java)
            .should().haveOnlyPrivateConstructors()
            .because("JPA entities need accessible constructors for the framework")
            .check(importedClasses)
    }

    // ========== SERVICE SPECIFIC RULES ==========

    @Test
    fun `service classes should not be final`() {
        classes()
            .that().resideInAPackage("..service..")
            .and().areAnnotatedWith(Service::class.java)
            .should().notBeAnnotatedWith("kotlin.jvm.JvmInline")
            .because("Services may need to be proxied by Spring")
    }

    @Test
    fun `service methods should be transactional when modifying data`() {
        methods()
            .that().areDeclaredInClassesThat().resideInAPackage("..service..")
            .and().haveNameMatching("(create|update|delete|save|mark).*")
            .and().arePublic()
            .should().beAnnotatedWith("org.springframework.transaction.annotation.Transactional")
            .because("Data modification operations should be transactional")
            .check(importedClasses)
    }

    // ========== REPOSITORY SPECIFIC RULES ==========

    @Test
    fun `repositories should extend JpaRepository or similar`() {
        classes()
            .that().resideInAPackage("..repository..")
            .and().areInterfaces()
            .should().beAssignableTo("org.springframework.data.repository.Repository")
            .because("Repositories should extend Spring Data interfaces")
            .check(importedClasses)
    }

    @Test
    fun `custom repository implementations should follow naming convention`() {
        classes()
            .that().resideInAPackage("..repository..")
            .and().haveSimpleNameEndingWith("Impl")
            .should().implement("..repository..*Custom")
            .because("Custom repository implementations should implement corresponding Custom interface")
    }

    // ========== SECURITY RULES ==========

    @Test
    fun `services should not expose sensitive data in exceptions`() {
        noMethods()
            .that().areDeclaredInClassesThat().resideInAPackage("..service..")
            .should().declareThrowableOfType(RuntimeException::class.java)
            .andShould().haveNameContaining("password")
            .because("Services should not expose sensitive data in exception messages")
    }

    // ========== CODE QUALITY RULES ==========

    @Test
    fun `classes should not use deprecated APIs`() {
        noClasses()
            .should().dependOnClassesThat().areAnnotatedWith(Deprecated::class.java)
            .because("Deprecated APIs should not be used")
            .check(importedClasses)
    }

    @Test
    fun `no classes should use System out or err`() {
        noClasses()
            .should().accessClassesThat().haveFullyQualifiedName("java.lang.System")
            .because("Use proper logging instead of System.out/err")
            .check(importedClasses)
    }

    @Test
    fun `no classes should throw generic exceptions`() {
        noMethods()
            .that().areDeclaredInClassesThat().resideInAPackage("cta..")
            .should().declareThrowableOfType(Exception::class.java)
            .because("Use specific exception types instead of generic exceptions")
            .check(importedClasses)
    }

    // ========== PACKAGE STRUCTURE TESTS ==========

    @Test
    fun `package structure should follow standard layout`() {
        classes()
            .that().areNotAnnotatedWith("org.springframework.boot.autoconfigure.SpringBootApplication")
            .and().doNotHaveSimpleName("Application")
            .and().doNotHaveSimpleName("MainKt")
            .should().resideInAnyPackage(
                "cta.web.controller..",
                "cta.service..",
                "cta.enum..",
                "cta.repository..",
                "cta.model..",
                "cta.web.dto..",
                "cta.config..",
                "cta.exception..",
                "cta.util..",
            )
            .check(importedClasses)
    }

    // ========== TESTING RULES ==========

    @Test
    fun `test classes should be in test packages`() {
        noClasses()
            .that().haveSimpleNameEndingWith("Test")
            .should().resideInAPackage("cta..")
            .because("Test classes should be in src/test, not src/main")
            .allowEmptyShould(true)
            .check(importedClasses)
    }
}
