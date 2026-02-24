# Stage 1. Build the application

FROM eclipse-temurin:22-jdk-alpine AS build

WORKDIR /BACKEND/EventTicketingSystem

COPY .mvn/ .mvn
COPY mvnw pom.xml ./


COPY src ./src
RUN ./mvnw clean package -DskipTests


# Stage 2 Runtime

FROM eclipse-temurin:22-jre-alpine
WORKDIR /app

COPY --from=build /BACKEND/EventTicketingSystem/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT [ "java", "-jar", "app.jar" ]