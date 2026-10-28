package com.mx.cbtis.modelo;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.Test;

public class ModeloCoverageTest {

    @Test
    void testUsuarioModel() {
        Usuario u1 = new Usuario();
        u1.setId_usuario(1);
        u1.setNombre("Test");
        u1.setCorreo_electronico("test@correo.com");
        u1.setContrasena("pass");
        u1.setRol("User");
        u1.setImagen_usuario("img.png");

        assertEquals(1, u1.getId_usuario());
        assertEquals("Test", u1.getNombre());
        assertEquals("test@correo.com", u1.getCorreo_electronico());
        assertEquals("pass", u1.getContrasena());
        assertEquals("User", u1.getRol());
        assertEquals("img.png", u1.getImagen_usuario());

        Usuario u2 = new Usuario(2, "Test2", "test2@correo.com", "pass2", "Admin", "img2.png");
        assertNotNull(u2);
    }

    @Test
    void testProyectosModel() {
        Proyectos p1 = new Proyectos();
        p1.setId_proyecto(1);
        p1.setNombre("P1");
        p1.setDescripcion("D1");
        p1.setFecha_inicio("2026-01-01");
        p1.setFecha_finalizacion("2026-02-01");
        p1.setEstado_proyecto("Activo");
        p1.setFondo("#fff");

        assertEquals(1, p1.getId_proyecto());
        assertEquals("P1", p1.getNombre());
        assertEquals("D1", p1.getDescripcion());
        assertEquals("2026-01-01", p1.getFecha_inicio());
        assertEquals("2026-02-01", p1.getFecha_finalizacion());
        assertEquals("Activo", p1.getEstado_proyecto());
        assertEquals("#fff", p1.getFondo());

        Proyectos p2 = new Proyectos(2, "P2", "D2", "2026-01-01", "2026-02-01", "Inactivo", "#000");
        assertNotNull(p2);
    }

    @Test
    void testTareasModel() {
        Tareas t1 = new Tareas();
        t1.setId_tarea(1);
        t1.setNombre("T1");
        t1.setDescripcion("D1");
        t1.setFecha_vencimiento("2026-03-01");
        t1.setLista("To Do");
        t1.setEstado("Pendiente");
        t1.setId_proyecto(10);

        assertEquals(1, t1.getId_tarea());
        assertEquals("T1", t1.getNombre());
        assertEquals("D1", t1.getDescripcion());
        assertEquals("2026-03-01", t1.getFecha_vencimiento());
        assertEquals("To Do", t1.getLista());
        assertEquals("Pendiente", t1.getEstado());
        assertEquals(10, t1.getId_proyecto());

        Tareas t2 = new Tareas(2, "T2", "D2", "2026-03-01", "Doing", "En progreso", 10);
        assertNotNull(t2);
    }

    @Test
    void testComentariosModel() {
        Comentarios c1 = new Comentarios();
        c1.setId_comentario(1);
        c1.setId_usuario("User1");
        c1.setId_tarea(5);
        c1.setTexto_comentario("Comentario");
        c1.setFecha_hora("2026-04-01 10:00:00");

        assertEquals(1, c1.getId_comentario());
        assertEquals("User1", c1.getId_usuario());
        assertEquals(5, c1.getId_tarea());
        assertEquals("Comentario", c1.getTexto_comentario());
        assertEquals("2026-04-01 10:00:00", c1.getFecha_hora());

        Comentarios c2 = new Comentarios(2, "User2", 5, "Comentario 2", "2026-04-01 11:00:00");
        assertNotNull(c2);
    }

    @Test
    void testAsignacionesModel() {
        Asignaciones a1 = new Asignaciones();
        a1.setId_asignacion(1);
        a1.setId_usuario(10);
        a1.setId_tarea(20);
        a1.setFecha_asignacion("2026-05-01");

        assertEquals(1, a1.getId_asignacion());
        assertEquals(10, a1.getId_usuario());
        assertEquals(20, a1.getId_tarea());
        assertEquals("2026-05-01", a1.getFecha_asignacion());

        Asignaciones a2 = new Asignaciones(2, 10, 20, "2026-05-02");
        assertNotNull(a2);
    }
}
