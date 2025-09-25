# syntax=docker/dockerfile:1

FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2 mvn -q -e -B -DskipTests dependency:go-offline
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 mvn -q -e -B -DskipTests clean package && ls -la target/

FROM eclipse-temurin:21-jre
ENV JAVA_OPTS="-Xmx512m -Xms256m"
WORKDIR /app
COPY --from=build /workspace/target/community-resource-map-api-*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]

