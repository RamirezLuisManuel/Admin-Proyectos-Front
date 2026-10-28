package com.mx.cbtis.bromitas;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.model;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrlPattern;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.client.RestTemplate;

import com.mx.cbtis.controller.GestorController;

@SpringBootTest
@AutoConfigureMockMvc
class UpgradeWebIntegrationTest {

    @Autowired private MockMvc mvc;
    @Autowired private GestorController gestorController;
    private MockRestServiceServer mockServer;

    @BeforeEach
    void setUp() {
        RestTemplate restTemplate = new RestTemplate();
        gestorController.setTemplate(restTemplate);
        mockServer = MockRestServiceServer.createServer(gestorController.getTemplate());
    }

    @Test
    void portadaSeRenderizaConThymeleaf() throws Exception {
        assertNotNull(gestorController.getTemplate());
        mvc.perform(get("/"))
                .andExpect(status().isOk()).andExpect(view().name("home"))
                .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_HTML));
    }

    @Test
    void loginSeRenderizaConSpringMvc() throws Exception {
        mvc.perform(get("/login"))
                .andExpect(status().isOk()).andExpect(view().name("login"));
    }

    @Test
    void tutorialSeRenderizaConThymeleaf() throws Exception {
        mvc.perform(get("/tutorial"))
                .andExpect(status().isOk()).andExpect(view().name("tutorial"));
    }

    @Test
    void manualSeRenderizaConThymeleaf() throws Exception {
        mvc.perform(get("/manual"))
                .andExpect(status().isOk()).andExpect(view().name("manual"));
    }

    @Test
    void registroConservaObjetoDeFormulario() throws Exception {
        mvc.perform(get("/register"))
                .andExpect(status().isOk()).andExpect(view().name("register"))
                .andExpect(model().attributeExists("usuario"));
    }

    @Test
    void proyectosConservanObjetoDeFormulario() throws Exception {
        mvc.perform(get("/inicio"))
                .andExpect(status().isOk()).andExpect(view().name("inicio"))
                .andExpect(model().attributeExists("proyectos"));
    }

    @Test
    void tareaVistaSeRenderizaConThymeleaf() throws Exception {
        mvc.perform(get("/tarea"))
                .andExpect(status().isOk()).andExpect(view().name("proyecto"))
                .andExpect(model().attributeExists("tareas"));
    }

    @Test
    void proyectoVistaCargaUsuariosConRestTemplate() throws Exception {
        mockServer.expect(requestTo("http://localhost:8081/buscarUsuarios"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess("[{\"id_usuario\":1,\"nombre\":\"Luis\"}]", MediaType.APPLICATION_JSON));

        mvc.perform(get("/proyecto"))
                .andExpect(status().isOk()).andExpect(view().name("proyecto"))
                .andExpect(model().attributeExists("tarea", "comentarios", "listaUsuarios"));
        mockServer.verify();
    }

    @Test
    void endpointsDeUsuariosYProyectosConRestTemplate() throws Exception {
        mockServer.expect(requestTo("http://localhost:8081/addUsuario"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess("0", MediaType.APPLICATION_JSON));
        mvc.perform(post("/saveUsuario").param("nombre", "Luis"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/login"));

        mockServer.reset();
        mockServer.expect(requestTo("http://localhost:8081/addProyecto"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess("0", MediaType.APPLICATION_JSON));
        mvc.perform(post("/saveProyecto").param("nombre", "Demo"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/inicio"));

        mockServer.reset();
        mockServer.expect(requestTo("http://localhost:8081/buscarProyectos"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess("[{\"id_proyecto\":1,\"nombre\":\"P1\"}]", MediaType.APPLICATION_JSON));
        mvc.perform(post("/consultarProyectos"))
                .andExpect(status().isOk());

        mockServer.reset();
        mockServer.expect(requestTo("http://localhost:8081/deleteProyecto"))
                .andExpect(method(HttpMethod.DELETE))
                .andRespond(withSuccess("0", MediaType.APPLICATION_JSON));
        mvc.perform(post("/eliminarProyecto")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id_proyecto\":1}"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/inicio"));

        mockServer.reset();
        mockServer.expect(requestTo("http://localhost:8081/buscarProyecto?id_proyecto=1"))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withSuccess("{\"id_proyecto\":1,\"nombre\":\"P1\"}", MediaType.APPLICATION_JSON));
        mvc.perform(post("/actualizarProyecto")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id_proyecto\":1}"))
                .andExpect(status().isOk());

        mockServer.reset();
        mockServer.expect(requestTo("http://localhost:8081/getUsuarioLogin"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess("{\"id_usuario\":1,\"correo\":\"a@b.c\"}", MediaType.APPLICATION_JSON));
        mvc.perform(post("/verificarLogin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"correo\":\"a@b.c\",\"contraseña\":\"123\"}"))
                .andExpect(status().isOk());

        mockServer.reset();
        mockServer.expect(requestTo("http://localhost:8081/buscarUsuarios"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess("[{\"id_usuario\":1,\"nombre\":\"Luis\"}]", MediaType.APPLICATION_JSON));
        mvc.perform(post("/consultarUsuarios"))
                .andExpect(status().isOk());
    }

    @Test
    void endpointsDeTareasYComentariosConRestTemplate() throws Exception {
        mockServer.expect(requestTo("http://localhost:8081/getTarea"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess("[{\"id_tarea\":1,\"nombre\":\"T1\"}]", MediaType.APPLICATION_JSON));
        mvc.perform(post("/obtenerTareas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id_proyecto\":1}"))
                .andExpect(status().isOk());

        mockServer.reset();
        mockServer.expect(requestTo("http://localhost:8081/getComentario"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess("[{\"id_comentario\":1,\"comentario\":\"C1\"}]", MediaType.APPLICATION_JSON));
        mvc.perform(post("/obtenerComentarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id_tarea\":1}"))
                .andExpect(status().isOk());

        mockServer.reset();
        mockServer.expect(requestTo("http://localhost:8081/addTareas"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess("0", MediaType.APPLICATION_JSON));
        mvc.perform(post("/saveTarea").param("id_proyecto", "1").param("nombre", "T1"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrlPattern("/proyecto*"));

        mockServer.reset();
        mockServer.expect(requestTo("http://localhost:8081/addComentario"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess("0", MediaType.APPLICATION_JSON));
        mvc.perform(post("/saveComentario")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id_tarea\":1,\"comentario\":\"C1\"}"))
                .andExpect(status().isOk());

        mockServer.reset();
        mockServer.expect(requestTo("http://localhost:8081/buscarTarea?id_tarea=1"))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withSuccess("{\"id_tarea\":1,\"nombre\":\"T1\"}", MediaType.APPLICATION_JSON));
        mvc.perform(post("/actualizarTarea")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id_tarea\":1}"))
                .andExpect(status().isOk());

        mockServer.reset();
        mockServer.expect(requestTo("http://localhost:8081/deleteTareas"))
                .andExpect(method(HttpMethod.DELETE))
                .andRespond(withSuccess("0", MediaType.APPLICATION_JSON));
        mvc.perform(post("/eliminarTarea")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id_tarea\":1}"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/proyecto"));

        mockServer.reset();
        mockServer.expect(requestTo("http://localhost:8081/addTareas"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess("0", MediaType.APPLICATION_JSON));
        mvc.perform(post("/verificarTarea")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id_tarea\":1,\"nombre\":\"T1\"}"))
                .andExpect(status().isOk());

        mockServer.reset();
        mockServer.expect(requestTo("http://localhost:8081/addTareas"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess("0", MediaType.APPLICATION_JSON));
        mvc.perform(post("/cambiosTareas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id_tarea\":1,\"estatus\":\"TERMINADO\"}"))
                .andExpect(status().isOk());

        mockServer.reset();
        mockServer.expect(requestTo("http://localhost:8081/buscarTareas"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess("[{\"id_tarea\":1,\"nombre\":\"T1\"}]", MediaType.APPLICATION_JSON));
        mvc.perform(post("/consultarTareas"))
                .andExpect(status().isOk());

        mockServer.reset();
        mockServer.expect(requestTo("http://localhost:8081/buscarComentarios"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess("[{\"id_comentario\":1,\"comentario\":\"C1\"}]", MediaType.APPLICATION_JSON));
        mvc.perform(post("/consultarComentarios"))
                .andExpect(status().isOk());
    }
}
