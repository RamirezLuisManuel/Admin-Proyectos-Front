$(document).ready(function(){
 	
		'use strict'
	
	  // Fetch all the forms we want to apply custom Bootstrap validation styles to
	  const forms = document.querySelectorAll('.needs-validation')
	
	  // Loop over them and prevent submission
	  Array.from(forms).forEach(form => {
	    form.addEventListener('submit', event => {
	      const nombre = form.querySelector('[name="nombre"]');
	      const correo = form.querySelector('[name="correo_electronico"]');
	      const password = form.querySelector('[name="contrasena"]');
	      if (nombre) nombre.value = nombre.value.trim();
	      if (correo) correo.value = correo.value.trim();
	      if (password) {
	        password.setCustomValidity(password.value.trim().length < 4
	          ? 'La contraseña debe contener al menos 4 caracteres no vacíos.' : '');
	      }
	      if (document.getElementById('imagenUsuario').value === '') getRandomColor();
	      if (!form.checkValidity()) {
	        event.preventDefault()
	        event.stopPropagation()
	      }
	
	      form.classList.add('was-validated')
	    }, false)
	  })
});

function getRandomColor(){
	const letras = '0123456789ABCDEF';
	let color = '#';
	for (let i = 0; i < 6; i++){
		color += letras[Math.floor(Math.random() * 16)]
	}
	
	document.getElementById("imagenUsuario").value = color;
	
}
