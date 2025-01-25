function uploadPosts(visitorId) {
    const publicacionesDiv = document.getElementById('publicaciones');

    // Realiza una solicitud Fetch al endpoint
    fetch(`/listPostsVisitor/${visitorId}/`)
        .then(response => response.text())
        .then(html => {
            // Limpia el contenido actual
            publicacionesDiv.innerHTML = html;
            document.getElementById('visitorId').value = visitorId;
            document.getElementById('visitorComment_id').value = visitorId;
            document.getElementById('editVisitorComment_id').value = visitorId;
            

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
            alert('post created successfully');
            
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
            alert('Post updated successfully');
            


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
    
    const confirmation = confirm("¿Dou you want to delete this post?");
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


function openAddCommentModal(publication_id) {
    // Establecer el publication_id en el formulario del modal
    document.getElementById('publication_id').value = publication_id;

    var myModal = new bootstrap.Modal(document.getElementById('addCommentModal'));
    myModal.show();
}

function createCommenPublic() {
    const formData = new FormData(document.getElementById('addCommentForm'));
    const visitor_id = document.getElementById('visitorComment_id').value;
    fetch('/createComment/', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'ok') {

            alert(data.message); // Mensaje del servidor en caso de éxito
            const modalElement = document.getElementById('addCommentModal');
            const myModal = bootstrap.Modal.getInstance(modalElement); // Obtener la instancia del modal
            myModal.hide();  // Cerrar el modal

            // Esperar un momento antes de recargar los datos
            setTimeout(() => {
                uploadPosts(document.getElementById('visitorId').value);
            }, 500);
            
            uploadPosts(visitor_id); // Recarga la página para reflejar los cambios
        } else {
            alert('Error: ' + data.message); // Mensaje del servidor en caso de fallo
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Ocurrió un error al intentar crear el comentario.');
    });
}

function openEditCommentModal(comment_id) {
    // Establecer el comment_id en el formulario del modal
    document.getElementById('comment_id').value = comment_id;

    // Realizar la solicitud para obtener el comentario
    fetch(`/selectComment/${comment_id}/`)
        .then(response => response.json())
        .then(data => {
            // Establecer el comentario en el campo correspondiente del formulario
            document.getElementById('commentTextEdit').value = data.comment;
            var myModal = new bootstrap.Modal(document.getElementById('editCommentModal'));
            myModal.show();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Hubo un error al cargar el comentario');
        });

    // Mostrar el modal
    
}


function updateComment() {
    const formData = new FormData(document.getElementById('editCommentForm'));
    const comment_id = document.getElementById('comment_id').value;
    const visitor_id = document.getElementById('editVisitorComment_id').value;
    fetch(`/updateComment/${comment_id}/`, {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'ok') {
            alert(data.message); // Mensaje del servidor en caso de éxito
            const modalElement = document.getElementById('editCommentModal');
            const myModal = bootstrap.Modal.getInstance(modalElement); // Obtener la instancia del modal
            myModal.hide();  // Cerrar el modal

            // Esperar un momento antes de recargar los datos
            setTimeout(() => {
                uploadPosts(document.getElementById('visitorId').value);
            }, 500);
            
            uploadPosts(visitor_id); // Recarga la página para reflejar los cambios
        } else {
            alert('Error: ' + data.message); // Mensaje del servidor en caso de fallo
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Ocurrió un error al intentar actualizar el comentario.');
    });
}

function deleteComment(comment_id,button) {
    const confirmation = confirm("¿do you want to delete this comment?");
    if (!confirmation) return;
    const visitor_id = button.dataset.visitor;

    fetch(`/deleteComment/${comment_id}/`, {
        method: 'DELETE',
        headers: {
            'X-CSRFToken': getCookie('csrftoken') // Si usas protección CSRF
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Error al intentar eliminar el comentario");
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
        alert('Ocurrió un error al intentar eliminar el comentario.');
    });
}