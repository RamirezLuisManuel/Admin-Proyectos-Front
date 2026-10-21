function escaparHtml(valor){
	return String(valor == null ? '' : valor).replace(/[&<>'"]/g, function(caracter){
		return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[caracter];
	});
}

function mostrarMensajeTarea(mensaje, tipo){
	var alerta = document.getElementById('taskFeedback');
	if(!alerta){ return; }
	alerta.className = 'alert alert-' + (tipo || 'warning');
	alerta.textContent = mensaje;
}

$(document).ready(function() {
	
	//Seleccionar estado
	document.getElementById("etiqueta").selectedIndex = "0";

	
	var usuarioString = localStorage.getItem("usuario");
	if(!usuarioString){
		window.location.replace('/login');
		return;
	}
	var usuario;
	try {
		usuario = JSON.parse(usuarioString);
	} catch (error) {
		localStorage.removeItem('usuario');
		window.location.replace('/login');
		return;
	}
	if(!usuario || !usuario.nombre){
		localStorage.removeItem('usuario');
		window.location.replace('/login');
		return;
	}
	var taskEditForm = document.getElementById('taskEditForm');
	if(taskEditForm){
		taskEditForm.addEventListener('submit', function(event){
			if(!taskEditForm.checkValidity()){
				event.preventDefault();
				event.stopPropagation();
				mostrarMensajeTarea('Seleccione una prioridad y una lista válidas antes de guardar.', 'warning');
			}
			taskEditForm.classList.add('was-validated');
		});
	}
	var imagen = document.getElementById("imagenUsuario");
	imagen.style.backgroundColor = usuario.imagen_usuario;
	var inicial = usuario.nombre[0];
	document.getElementById("Nombre").innerHTML = usuario.nombre;
	document.getElementById("Email").innerHTML = usuario.correo_electronico;
	document.getElementById("inicial").innerHTML = inicial;
	
	var urlParams = new URLSearchParams(window.location.search);
	var id = urlParams.get('id_proyecto');
	var id_proyecto = Number(id);
	console.log(id_proyecto);
	document.getElementById("IdProyectoURL").value = id_proyecto;
	
	llenarBarraLateral(id_proyecto);
	
		$.ajax({
	        url: '/consultarUsuarios',
	        type: 'POST',
	        dataType: 'json',
	    	contentType: 'application/json',
	        success: function(data){
				var contenedor = $('#miembrosLateral');
	            contenedor.empty();
	            
	             data.forEach(function(usuario) {
					var miembro = $('<p>').text(usuario.nombre || '');
	             contenedor.append(miembro);})
	       }

         });


	
	$.ajax({
        url: '/obtenerTareas',
        data : JSON.stringify({id_proyecto: id_proyecto}),
        type: 'POST',
        dataType: 'json',
    	contentType: 'application/json',
        success: function(data){
			var contenedor = $('#tareasPendientes');
            contenedor.empty();
            var contenedor2 = $('#enCurso');
            contenedor2.empty();
            var contenedor3 = $('#trabajoTerminado');
            contenedor3.empty();
            
            var contenedorLateral1 = $('#dropdownPendientes');
            contenedorLateral1.empty();
            var contenedorLateral2 = $('#dropdownEnCurso');
            contenedorLateral2.empty();
            var contenedorLateral3 = $('#dropdownTerminado');
            contenedorLateral3.empty();
            
            // Crear tarjetas para cada proyecto

	          data.forEach(function(tarea) {
			var tarjeta = '';
			var tarjeta2 = '';
			var tarjeta3 = '';
			var lateral1 = '';
			var lateral2 = '';
			var lateral3 = '';
			var nombreSeguro = escaparHtml(tarea.nombre);
			var nombreUrl = encodeURIComponent(tarea.nombre || '').replace(/'/g, '%27');
			var estadoSeguro = escaparHtml(tarea.estado || 'secondary');
			if(tarea.lista == "pendientes"){
				tarjeta = `
	            <ul class="my-2">
	              <li>
					<div class="my-2 badge text-bg-light-subtle mx-auto d-flex">
						<button type="button" class="btn btn-light text-start d-grid gap-2 border border-${estadoSeguro}" data-bs-toggle="modal" data-bs-target="#editarTarea" onclick="actualizarTarea(${tarea.id_tarea});comentarios(${tarea.id_tarea})">${nombreSeguro}</button>
						<button data-bs-toggle="modal" data-bs-target="#modalAlerta" onclick="obtenerInfo(${tarea.id_tarea}, 'hiddenId', decodeURIComponent('${nombreUrl}'))" class="bg-light-subtle m-1 p-2 border border-0"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
						  <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
						  </svg>
						</button>
					</div>
				  </li>
				</ul>
            	`;
            	
	            	lateral1 = `
	            		<button type="button" class="btn btn-light text-start d-grid gap-2 dropdown-item" data-bs-toggle="modal" data-bs-target="#editarTarea" onclick="actualizarTarea(${tarea.id_tarea});comentarios(${tarea.id_tarea})">${nombreSeguro}</button>
            	`;
            	
            	
            	
	              // Crea comentarios
			      /*$.ajax({
			        url: '/obtenerComentarios',
			        data : JSON.stringify({id_tarea: tarea.id_tarea}),
	        		type: 'POST',
	        		dataType: 'json',
	    			contentType: 'application/json',
			        success: function(data){
						var contenedorComentario = $('#contenedorComentario');
			            contenedorComentario.empty();
			            
			            data.forEach(function(comentarios) {
								var comentario = `
								<div class="text-start bg-secondary p-2 bg-opacity-50 mb-3 rounded">
								    <strong class="me-auto">Liliana Gómez Martínez</strong>
								    <small class="text-body-secondary">${comentarios.fecha_hora}</small>
								  <div>
								    ${comentarios.texto_comentario}
								  </div>
							    </div>
								`
								contenedorComentario.append(comentario);
						});
			        }
			       });*/
			}
			
			if(tarea.lista == "encurso"){
				tarjeta2 = `
	            <ul class="my-2">
	              <li>
					<div class="my-2 badge text-bg-light-subtle mx-auto d-flex">
						<button type="button" class="btn btn-light text-start d-grid gap-2 border border-${estadoSeguro}" data-bs-toggle="modal" data-bs-target="#editarTarea" onclick="actualizarTarea(${tarea.id_tarea});comentarios(${tarea.id_tarea})">${nombreSeguro}</button>
						<button onclick="eliminarTarea(${tarea.id_tarea});" class="bg-light-subtle m-1 p-2 border border-0"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
						  <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
						  </svg>
						</button>
					</div>
				  </li>
				</ul>
            	`;
            	
	            	lateral2 = `
	            		<button type="button" class="btn btn-light text-start d-grid gap-2 dropdown-item" data-bs-toggle="modal" data-bs-target="#editarTarea" onclick="actualizarTarea(${tarea.id_tarea});comentarios(${tarea.id_tarea})">${nombreSeguro}</button>
            	`;
            	
            	// Crea comentarios
		     /* $.ajax({
			        url: '/obtenerComentarios',
			        data : JSON.stringify({id_tarea: tarea.id_tarea}),
	        		type: 'POST',
	        		dataType: 'json',
	    			contentType: 'application/json',
			        success: function(data){
						var contenedorComentario = $('#contenedorComentario');
			            contenedorComentario.empty();
			            
			            data.forEach(function(comentarios) {
								var comentario = `
								<div class="text-start bg-secondary p-2 bg-opacity-50 mb-3 rounded">
								    <strong class="me-auto">Liliana Gómez Martínez</strong>
								    <small class="text-body-secondary">${comentarios.fecha_hora}</small>
								  <div>
								    ${comentarios.texto_comentario}
								  </div>
							    </div>
								`
								contenedorComentario.append(comentario);
						});
			        }
			       });*/
			}
           if(tarea.lista == "terminado"){
			   tarjeta3 = `
	            <ul class="my-2">
	              <li>
					<div class="my-2 badge text-bg-light-subtle mx-auto d-flex">
						<button type="button" class="btn btn-light text-start d-grid gap-2 border border-${estadoSeguro}" data-bs-toggle="modal" data-bs-target="#editarTarea" onclick="actualizarTarea(${tarea.id_tarea});comentarios(${tarea.id_tarea})">${nombreSeguro}</button>
						<button onclick="eliminarTarea(${tarea.id_tarea});" class="bg-light-subtle m-1 p-2 border border-0"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
						  <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
						  </svg>
						</button>
					</div>
				  </li>
				</ul>
	            `;
	            
	            lateral3 = `
	            	<button type="button" class="btn btn-light text-start d-grid gap-2 dropdown-item" data-bs-toggle="modal" data-bs-target="#editarTarea" onclick="actualizarTarea(${tarea.id_tarea});comentarios(${tarea.id_tarea})">${nombreSeguro}</button>
            	`;
	            
	            // Crea comentarios
		       /*$.ajax({
			        url: '/obtenerComentarios',
			        data : JSON.stringify({id_tarea: tarea.id_tarea}),
	        		type: 'POST',
	        		dataType: 'json',
	    			contentType: 'application/json',
			        success: function(data){
						var contenedorComentario = $('#contenedorComentario');
			            contenedorComentario.empty();
			            
			            data.forEach(function(comentarios) {
								var comentario = `
								<div class="text-start bg-secondary p-2 bg-opacity-50 mb-3 rounded">
								    <strong class="me-auto">Liliana Gómez Martínez</strong>
								    <small class="text-body-secondary">${comentarios.fecha_hora}</small>
								  <div>
								    ${comentarios.texto_comentario}
								  </div>
							    </div>
								`
								contenedorComentario.append(comentario);
						});
			        }
			       });*/
		   }
            
            
            if(tarjeta){ contenedor.append(tarjeta); }
            if(tarjeta2){ contenedor2.append(tarjeta2); }
            if(tarjeta3){ contenedor3.append(tarjeta3); }
            if(lateral1){ contenedorLateral1.append(lateral1); }
            if(lateral2){ contenedorLateral2.append(lateral2); }
            if(lateral3){ contenedorLateral3.append(lateral3); }

          });
		},
		  error: function(error) {
          console.error('Error al cargar tareas:', error);
		  mostrarMensajeTarea('No fue posible cargar las tareas del proyecto.', 'danger');}
      });
       
});

function newTarea(){
	var inputTarea = document.getElementById("inputTarea");
	var displayStyle = window.getComputedStyle(inputTarea).display;
	var btnTarea = document.getElementById("btnTarea");
	var displayStyle2 = window.getComputedStyle(btnTarea).display;
	
	if(displayStyle === "none" & displayStyle2 === "none"){
		inputTarea.style.display = "block";
		btnTarea.style.display = "block";
		inputTarea.focus();
	}
	else{
		inputTarea.style.display = "none";
		btnTarea.style.display = "none";
	}
}
function newTarea2(){
	var inputTarea2 = document.getElementById("inputTarea2");
	var displayStyle = window.getComputedStyle(inputTarea2).display;
	var btnTarea2 = document.getElementById("btnTarea2");
	var displayStyle2 = window.getComputedStyle(btnTarea2).display;
	
	if(displayStyle === "none" & displayStyle2 === "none"){
		inputTarea2.style.display = "block";
		btnTarea2.style.display = "block";
		inputTarea2.focus();
	}
	else{
		inputTarea2.style.display = "none";
		btnTarea2.style.display = "none";
	}
}
function newTarea3(){
	var inputTarea3 = document.getElementById("inputTarea3");
	var displayStyle = window.getComputedStyle(inputTarea3).display;
	var btnTarea3 = document.getElementById("btnTarea3");
	var displayStyle2 = window.getComputedStyle(btnTarea3).display;
	
	if(displayStyle === "none" & displayStyle2 === "none"){
		inputTarea3.style.display = "block";
		btnTarea3.style.display = "block";
		inputTarea3.focus();
	}
	else{
		inputTarea3.style.display = "none";
		btnTarea3.style.display = "none";
	}
}

function Fechas(){
	var inputFechas = document.getElementById("inputFechas");
	var displayStyle = window.getComputedStyle(inputFechas).display;
	
	if(displayStyle === "none"){
		inputFechas.style.display = "block";
		inputFechas.focus();
	}
	else{
		inputFechas.style.display = "none";
	}
}

function enviarNuevaTarea(inputId, listaId){
	var input = document.getElementById(inputId);
	var nombre = input ? input.value.trim() : '';
	var id = new URLSearchParams(window.location.search).get('id_proyecto');
	var idProyecto = Number(id);
	if(nombre.length < 2 || nombre.length > 100){
		mostrarMensajeTarea('La tarea debe tener un nombre de entre 2 y 100 caracteres.', 'warning');
		if(input){ input.focus(); }
		return;
	}
	if(!Number.isInteger(idProyecto) || idProyecto <= 0){
		mostrarMensajeTarea('El proyecto solicitado no es válido.', 'danger');
		return;
	}

	$.ajax({
		url : "/verificarTarea",
		contentType:"application/json",
		data : JSON.stringify({nombre:nombre, lista:document.getElementById(listaId).value, id_proyecto:idProyecto}),
		type : "POST",
		success: function(){ window.location.href = `proyecto?id_proyecto=${idProyecto}`; },
		error: function(){ mostrarMensajeTarea('No fue posible guardar la tarea. Intente nuevamente.', 'danger'); }
	});
}

function validarTarea(){ enviarNuevaTarea('inputTarea', 'estado'); }
function validarTarea2(){ enviarNuevaTarea('inputTarea2', 'estado2'); }
function validarTarea3(){ enviarNuevaTarea('inputTarea3', 'estado3'); }

function eliminarTarea(id_tarea){
	
	$.ajax({
		url : "/eliminarTarea",
		contentType:"application/json",
		data : JSON.stringify({id_tarea:id_tarea}),
		type : "POST",
		success: function(){
			var id = document.getElementById("IdProyectoURL").value;
			var url = `proyecto?id_proyecto=${id}`;
            window.location.href= url;}
	});
}

function actualizarTarea(id_tarea){
	
	/*let now = new Date();
	let day = ('0' + now.getDate()).slice(-2);        // Día del mes (dos dígitos)
	let month = ('0' + (now.getMonth() + 1)).slice(-2); // Mes (dos dígitos)
	let year = now.getFullYear().toString(); // Año (dos últimos dígitos)
	let fecha = day + '/' + month + '/' + year;
	console.log(fecha);
	
	document.getElementById("descripcionT").value = "_";
	var fechas = document.getElementById('inputFechas');
	fechas.value = fecha;
	
	document.getElementById("etiqueta").value = "primary";
	console.log(document.getElementById("etiqueta").value);
	console.log(document.getElementById("inputFechas").value);*/
			
	
	$.ajax({
		url : "/actualizarTarea",
		dataType : "json",
		contentType:"application/json",
		data : JSON.stringify({id_tarea:id_tarea}),
		type : "POST",
		success: function(data){
			$('#editarTarea').modal('show');
			
			var modal = $('#editarTarea');
			modal.find('.modal-title').text(data.nombre);
			
			document.getElementById("id_tarea").value = data.id_tarea;
			document.getElementById("id_proyecto").value = data.id_proyecto;
			document.getElementById("descripcionT").value = data.descripcion;
			document.getElementById("inputFechas").value = data.fecha_vencimiento;
			document.getElementById("etiqueta").value = data.estado;
			document.getElementById("cambiarLista").value = data.lista;
			document.getElementById("nombre").value = data.nombre;
		},
		error:function(){
			console.log("Error");
		}
	});
}/*
function verificarComentario(){
	$.ajax({
		url : "/verificarTarea",
		contentType:"application/json",
		data : JSON.stringify({texto_comentario:$("#comentarioT").val()}),
		type : "POST",
		success: function(data){
			console.log(data);
			var id = document.getElementById("IdProyectoURL").value;
			var url = `proyecto?id_proyecto=${id}`;
            window.location.href= url;}
	})
}*/

function guardarComentario(){
	var comentario = $('#comentarioT').val().trim();
	if(comentario.length < 1 || comentario.length > 250){
		mostrarMensajeTarea('El comentario debe contener entre 1 y 250 caracteres.', 'warning');
		document.getElementById('comentarioT').focus();
		return;
	}
	let now = new Date();
	let day = ('0' + now.getDate()).slice(-2);        // Día del mes (dos dígitos)
	let month = ('0' + (now.getMonth() + 1)).slice(-2); // Mes (dos dígitos)
	let year = now.getFullYear().toString();
	let hour = ('0' + now.getHours()).slice(-2);       // Hora (dos dígitos)
	let minute = ('0' + now.getMinutes()).slice(-2);   // Minutos (dos dígitos)
	let fecha = `${year}-${month}-${day} ${hour}:${minute}:00`;
	
	var usuarioString = localStorage.getItem("usuario");
	var usuario = JSON.parse(usuarioString);
	
	$.ajax({
            url: '/saveComentario',
            contentType: 'application/json',
            data: JSON.stringify({
                id_tarea: $('#id_tarea').val(), // Obtener el ID de la tarea
                texto_comentario: comentario,
                fecha_hora: fecha,
                id_usuario: usuario.nombre
            }),
            type: 'POST',
            success: function(response) {
				
                // Manejar la respuesta del servidor según sea necesario
                console.log('Comentario guardado exitosamente');
                // Puedes actualizar la UI si es necesario
                var id = document.getElementById("IdProyectoURL").value;
				var url = `proyecto?id_proyecto=${id}`;
	            window.location.href= url;
            },
            error: function(error) {
                console.error('Error al guardar el comentario:', error);
				mostrarMensajeTarea('No fue posible guardar el comentario. Intente nuevamente.', 'danger');
            }
        }); 
	
}


function llenarBarraLateral(idProyecto){
	$.ajax({
		url : '/actualizarProyecto',
		dataType: "json",
		contentType:'application/json',
		data : JSON.stringify({id_proyecto: idProyecto}),
		type : "POST",
			success: function(data){
			console.log(data);
			
			var nombre = document.getElementById("offcanvasScrollingLabel");
			nombre.textContent = data.nombre || 'Proyecto no encontrado';
			
			var descripcion = document.getElementById("despliegueDescripcion");
			descripcion.textContent = data.descripcion || '';
		
		},
		
		error: function() {
			mostrarMensajeTarea('No fue posible consultar la información del proyecto.', 'danger');
        }
	});
}

function comentarios(idTarea){
	
	$.ajax({
	    url: '/obtenerComentarios',
	    data : JSON.stringify({id_tarea: idTarea}),
		type: 'POST',
		dataType: 'json',
		contentType: 'application/json',
	    success: function(data){
			var contenedorComentario = $('#contenedorComentario');
	        contenedorComentario.empty();
	        
	        data.forEach(function(comentario){
				var caja = $('<div>').addClass('text-start bg-secondary p-2 bg-opacity-50 mb-3 rounded');
				caja.append($('<strong>').addClass('me-auto').text(comentario.id_usuario || 'Usuario'));
				caja.append(document.createTextNode(' '));
				caja.append($('<small>').addClass('text-body-secondary').text(comentario.fecha_hora || ''));
				caja.append($('<div>').text(comentario.texto_comentario || ''));
				contenedorComentario.append(caja);
			});
	    },
		error: function(){ mostrarMensajeTarea('No fue posible consultar los comentarios.', 'danger'); }
   });
}

function IrInicio(){
	window.location.href = 'inicio';
}

function obtenerInfo(datos, objetivo, nombre) {
	var nuevoTexto = "¿Esta seguro que sea eliminar la tarea " + nombre + "?";
	document.getElementById("textAlerta").innerText = nuevoTexto;
    $(`#${objetivo}`).val(datos);
}

function botonEliminar(){
	
	var id = document.getElementById("hiddenId").value;
	eliminarTarea(id);
}
