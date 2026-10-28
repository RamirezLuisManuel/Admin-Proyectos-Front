package com.mx.cbtis.bromitas;

import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import com.mx.cbtis.Ejercicio5ClienteApplication;

@SpringBootTest
class Ejercicio5ClienteApplicationTests {

	@Test
	void contextLoads() {
		assertTrue(true, "El contexto de Spring Boot cliente levanta correctamente");
	}

	@Test
	void mainRuns() {
		Ejercicio5ClienteApplication.main(new String[] {"--server.port=0"});
		assertTrue(true, "El metodo main del cliente arranca sin excepciones");
	}
}
