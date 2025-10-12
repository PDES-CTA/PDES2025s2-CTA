FROM gradle:8-jdk21-alpine AS build
WORKDIR /app

# Copy only dependency files first for better caching
COPY build.gradle.kts settings.gradle.kts gradle.properties* ./
COPY gradle gradle

RUN --mount=type=cache,target=/root/.gradle \
    gradle dependencies --no-daemon --quiet

COPY src src

RUN gradle build --no-daemon -x test \
    && ls -la /app/build/libs/

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN apk add --no-cache curl

# Create non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

COPY --from=build --chown=spring:spring /app/build/libs/*.war app.jar

EXPOSE 8080

HEALTHCHECK --interval=90s --timeout=5s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# JVM optimization flags
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseG1GC -XX:+UseStringDeduplication"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]