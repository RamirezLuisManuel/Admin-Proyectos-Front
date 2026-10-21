function escaparHtmlProyecto(valor){
	return String(valor == null ? '' : valor).replace(/[&<>'"]/g, function(caracter){
		return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[caracter];
	});
}

function rutaFondoSegura(ruta){
	return /^\/Images\/[A-Za-z0-9_-]+\.(?:png|gif|jpg|jpeg)$/i.test(ruta || '') ? ruta : '/Images/blanco.png';
}

$(document).ready(function(){
	var usuarioSesion;
	try {
		usuarioSesion = JSON.parse(localStorage.getItem('usuario'));
	} catch (error) {
		usuarioSesion = null;
	}
	if (!usuarioSesion || !usuarioSesion.nombre || !usuarioSesion.correo_electronico) {
		window.location.replace('/login');
		return;
	}
	configurarValidacionProyectos();
	
	$.ajax({
        url: '/consultarProyectos',
        type: 'POST',
        dataType: 'json',
        success: function(data) {

          var contenedor = $('#cardContainer');
          contenedor.empty();

          // Crear tarjetas para cada proyecto
          if(data.length === 0){
			contenedor.append($('<div>').addClass('alert alert-info').attr('role', 'status').text('Aún no hay proyectos registrados.'));
		  }
          data.forEach(function(proyecto) {
			var idProyecto = Number(proyecto.id_proyecto);
			var nombreSeguro = escaparHtmlProyecto(proyecto.nombre);
			var nombreUrl = encodeURIComponent(proyecto.nombre || '').replace(/'/g, '%27');
			var descripcionSegura = escaparHtmlProyecto(proyecto.descripcion);
			var inicioSeguro = escaparHtmlProyecto(proyecto.fecha_inicio);
			var finSeguro = escaparHtmlProyecto(proyecto.fecha_finalizacion);
			var estadoSeguro = escaparHtmlProyecto(proyecto.estado_proyecto);
			var fondoSeguro = rutaFondoSegura(proyecto.fondo);
            var tarjeta = `
              <div class="col-md-4">
                <div class="card mb-4">
                  <img src="${fondoSeguro}" alt="Fondo del proyecto ${nombreSeguro}">
                  <div class="card-body">
                    <div class="dropdown">
                      <div class="d-flex justify-content-end">
                          <button type="button" data-bs-toggle="dropdown" aria-expanded="false" class="border-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots-vertical" viewBox="0 0 16 16">
                              <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
                            </svg>
                          </button>
                          
                          <ul class="dropdown-menu">
                              <li><a onclick="actualizarProyecto(${idProyecto})" class="dropdown-item">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#6d7578" class="bi bi-pencil-fill me-3 mb-3 mt-2" viewBox="0 0 16 16">
                                  <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z"/>
                                </svg>
                                Editar
                              </a></li>
                              <li><a class="dropdown-item" data-bs-toggle="modal" data-bs-target="#modalAlerta" onclick="obtenerInfo(${idProyecto}, 'hiddenId', decodeURIComponent('${nombreUrl}'))">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#6d7578" class="bi bi-trash3-fill me-3 mb-2" viewBox="0 0 16 16">
                                  <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5"/>
                                </svg>
                                Eliminar
                            </a></li>
                         </ul>
                      </div>
                    </div>
                    <h5 class="card-title">${nombreSeguro}</h5>
                    <p class="card-text">${descripcionSegura}</p>
                    <p class="card-text">Fecha de inicio: ${inicioSeguro}</p>
                    <p class="card-text">Fecha de finalización: ${finSeguro}</p>
                    <p class="card-text">Estado del proyecto: ${estadoSeguro}</p>
                    <a href="/proyecto?id_proyecto=${idProyecto}" class="btn btn-primary">Ir al proyecto</a>
                </div>
              </div>
            `;
            contenedor.append(tarjeta);
           
          });
        },
        error: function(error) {
          console.error('Error al cargar proyectos:', error);
          mostrarMensajeProyecto('No fue posible cargar los proyectos. Verifique la conexión con el servicio e intente nuevamente.', 'danger');}
      });
});

function mostrarMensajeProyecto(mensaje, tipo){
	var alerta = document.getElementById('projectFeedback');
	if(!alerta){ return; }
	alerta.className = 'alert alert-' + (tipo || 'danger');
	alerta.textContent = mensaje;
}

function configurarValidacionProyectos(){
	[
		{form: 'projectCreateForm', inicio: 'fecha_inicio', fin: 'fecha_finalizacion'},
		{form: 'projectEditForm', inicio: 'editar_fecha_inicio', fin: 'editar_fecha_finalizacion'}
	].forEach(function(config){
		var form = document.getElementById(config.form);
		var inicio = document.getElementById(config.inicio);
		var fin = document.getElementById(config.fin);
		if(!form || !inicio || !fin){ return; }

		function validarFechas(){
			fin.setCustomValidity(inicio.value && fin.value && fin.value < inicio.value
				? 'La fecha final debe ser igual o posterior a la fecha de inicio.' : '');
			if(inicio.value){ fin.min = inicio.value; }
		}

		inicio.addEventListener('change', validarFechas);
		fin.addEventListener('change', validarFechas);
		form.addEventListener('submit', function(event){
			validarFechas();
			if(config.form === 'projectCreateForm'){ asignarFondo(); }
			else { asignarFondoEditar(); }
			if(!form.checkValidity()){
				event.preventDefault();
				event.stopPropagation();
				mostrarMensajeProyecto('Revise los campos marcados antes de guardar el proyecto.', 'warning');
			}
			form.classList.add('was-validated');
		});
	});
}

function guardarRutaImagen(imagePath) {
	document.getElementById("fondo").value = imagePath;
	console.log(document.getElementById("fondo").value);
}

function eliminarProyecto(idProyecto){
	$.ajax({
		url : "/eliminarProyecto",
		contentType:"application/json",
		data : JSON.stringify({id_proyecto: idProyecto}),
		type : "POST",
		success: function(){
			window.location.href = 'inicio';
		}
	});
    
}

function obtenerInfo(datos, objetivo, nombre) {
	var nuevoTexto = "¿Esta seguro que sea eliminar el proyecto " + nombre + "?";
	document.getElementById("textAlerta").innerText = nuevoTexto;
    $(`#${objetivo}`).val(datos);
}

function botonEliminar(){
	
	var id = document.getElementById("hiddenId").value;
	eliminarProyecto(id);
}

function actualizarProyecto(idProyecto){
	$.ajax({
		url : "/actualizarProyecto",
		dataType: "json",
		contentType:'application/json',
		data : JSON.stringify({id_proyecto: idProyecto}),
		type : "POST",
		success: function(data){
			$('#modalEditar').modal('show');
			
			var modal = $('#modalEditar');
			modal.find('.modal-title').text('Editar')
				
			document.getElementById("id").value = data.id_proyecto;
			document.getElementById("editarNombre").value = data.nombre;
			document.getElementById("editarDescripcion").value = data.descripcion;
			document.getElementById("editar_fecha_inicio").value = data.fecha_inicio;
			document.getElementById("editar_fecha_finalizacion").value = data.fecha_finalizacion;
			document.getElementById("editar_estado_proyecto").value = data.estado_proyecto;
			document.getElementById("editar_fondo").value = data.fondo;
			console.log(document.getElementById("editar_fondo").value);
		
		},
		
		error: function() {
            console.log("Error");
        }
	});
}

function asignarFondo(){
	console.log(document.getElementById("fondo").value);
	if(document.getElementById("fondo").value == ""){
		document.getElementById("fondo").value = "/Images/blanco.png"; 
	}   
}

function asignarFondoEditar(){
	var fondo = document.getElementById("editar_fondo");
	if(fondo && fondo.value == ""){
		fondo.value = "/Images/blanco.png";
	}
}

function cerrarFondos() {
    const dialog = document.getElementById('imagenesFondo');
    if (dialog) {
        dialog.close();
    }
}
/*function actualizarProyecto(idProyecto){
	
	$.ajax({
		url : "/actualizarProyecto",
		contentType:"application/json",
		data : JSON.stringify({id_proyecto: idProyecto}),
		type : "GET",
		success: function(){
			var miModal = document.getElementById('modalEditar');

			// Crear un nuevo objeto Modal con el modal obtenido
			var modal = new bootstrap.Modal(miModal);
			
			// Abrir el modal
			modal.show();

		}
	});
	
}*/

/*function guardarRutaImagen(ruta){
	 document.getElementById("fondo").value = ruta;
	 console.log(ruta);
	 console.log("esta es la ruta " + document.getElementById("fondo").value)
}*/
