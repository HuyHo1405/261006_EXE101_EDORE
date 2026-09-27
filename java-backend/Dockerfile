# Stage 1: Build JAR using Maven & OpenJDK 21
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /app

# Copy pom.xml and resolve dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build executable JAR
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Minimal Runtime JRE 21 Alpine
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create non-root user for security
RUN addgroup -S edore && adduser -S edore -G edore
USER edore

# Copy built JAR artifact from builder stage
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

# Configure JVM memory limits suited for 512MB free tier containers
ENV JAVA_OPTS="-Xms256m -Xmx400m -XX:+UseG1GC"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
