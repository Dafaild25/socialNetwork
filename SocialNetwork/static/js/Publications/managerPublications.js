function uploadPosts(visitorId) {
    const publicacionesDiv = document.getElementById('publicaciones');

    // Realiza una solicitud Fetch al endpoint
    fetch(`/listPostsVisitor/${visitorId}/`)
        .then(response => response.text())
        .then(html => {
            // Limpia el contenido actual
            publicacionesDiv.innerHTML = html;
            document.getElementById('visitorId').value = visitorId;
            

        })
        .catch(error => {
            console.error('Error al cargar la tabla de autores:', error);
        });
}



function createPost() {
    const formData = new FormData(document.getElementById('newPublicacionForm'));

    // Agregar el CSRF token a los encabezados
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Realiza la solicitud Fetch
    fetch('/createPost/', {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRFToken': csrfToken  // Necesario para la protección CSRF
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'ok') {
            alert('Publicación creada exitosamente');
            
            // Cerrar el modal usando bootstrap.Modal
            const modalElement = document.getElementById('newPublicacionModal');
            const myModal = bootstrap.Modal.getInstance(modalElement); // Obtener la instancia del modal
            myModal.hide();  // Cerrar el modal

            // Esperar un momento antes de recargar los datos
            setTimeout(() => {
                uploadPosts(document.getElementById('visitorId').value);
            }, 500);  

        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Hubo un error al crear la publicación');
    });
}


function selectPost(post_id){
    fetch(`/selectPost/${post_id}/`)
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to fetch post data");
        }
        return response.json();
    })
    .then(data => {
        document.getElementById('editPostId').value = data.id;
        document.getElementById('editVisitor_id').value = data.visitor;
        document.getElementById('editPostTitle').value = data.title;
        document.getElementById('editPostDescription').value = data.description;

        const modalElement = document.getElementById('editPostModal');
        const myModal = new bootstrap.Modal(modalElement); // Inicializar modal
        myModal.show();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Hubo un error al cargar la publicación');
    });
}


function updatePost() {
    const formData = new FormData(document.getElementById('editPublicacionForm'));
    const post_id = document.getElementById('editPostId').value;
    const visitor_id = document.getElementById('editVisitor_id').value;
    
    fetch(`/updatePost/${post_id}/`, {
        method: 'POST',
        body: formData,
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to update post");
        }
        return response.json();
        })
        .then(data => {
            console.log(data);
            alert('Publicación actualizada con éxito');
            


            const modalElement = document.getElementById('editPostModal');
            const myModal = bootstrap.Modal.getInstance(modalElement); // Obtener la instancia del modal
            myModal.hide();  // Cerrar el modal

            // Esperar un momento antes de recargar los datos
            setTimeout(() => {
                uploadPosts(document.getElementById('visitorId').value);
            }, 500);
            uploadPosts(visitor_id);

            })
        .catch(error => {
            console.error('Error:', error);
            alert('Hubo un error al actualizar la publicación');
        }); 
}
     
 

function deletePost(post_id,button) {
    
    const confirmation = confirm("¿Estás seguro de que deseas eliminar esta publicación?");
    if (!confirmation) return;
    const visitor_id = button.dataset.visitor;

    fetch(`/deletePost/${post_id}/`, {
        method: 'DELETE',
        headers: {
            'X-CSRFToken': getCookie('csrftoken') // Si usas protección CSRF
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Error al intentar eliminar la publicación");
        }
        return response.json();
    })
    .then(data => {
        if (data.status) {
            alert(data.message); // Mensaje del servidor en caso de éxito
            uploadPosts(visitor_id);// Recarga la página para reflejar los cambios
        } else {
            alert('Error: ' + data.message); // Mensaje del servidor en caso de fallo
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Ocurrió un error al intentar eliminar la publicación.');
    });
}

// Función para obtener el token CSRF (si usas Django con protección CSRF)
function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(name + '=')) {
            return decodeURIComponent(cookie.substring(name.length + 1));
        }
    }
    return null;
}