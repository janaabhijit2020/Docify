FROM eclipse-temurin:26-jdk

WORKDIR /app

COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline

COPY src ./src

RUN ./mvnw clean package -DskipTests

EXPOSE 8080

ENV SERVER_PORT=8080

ENTRYPOINT ["java", "-jar", "target/backend-0.0.1-SNAPSHOT.jar"]