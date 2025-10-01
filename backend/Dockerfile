FROM gradle:8-jdk21 AS build
WORKDIR /app
COPY build.gradle.kts settings.gradle.kts ./
COPY gradle gradle
COPY src src
RUN gradle build --no-daemon -x test
RUN ls -la /app/build/libs/ || echo "No libs directory in build stage"

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/build/libs/CTA-0.0.1-SNAPSHOT.war app.jar
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]