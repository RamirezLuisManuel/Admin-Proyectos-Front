package com.mx.cbtis.bromitas;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import com.mx.cbtis.Ejercicio5ClienteApplication;

@SpringBootTest
class Ejercicio5ClienteApplicationTests {

	@Test
	void contextLoads() {
	}

	@Test
	void mainRuns() {
		Ejercicio5ClienteApplication.main(new String[] {"--server.port=0"});
	}
}
