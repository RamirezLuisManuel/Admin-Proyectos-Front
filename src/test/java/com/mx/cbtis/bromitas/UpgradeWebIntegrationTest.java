package com.mx.cbtis.bromitas;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.model;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class UpgradeWebIntegrationTest {

    @Autowired private MockMvc mvc;

    @Test
    void portadaSeRenderizaConThymeleaf() throws Exception {
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
}
