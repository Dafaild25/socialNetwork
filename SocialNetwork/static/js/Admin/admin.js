// Function to get the CSRF cookie value
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Converts form data to JSON
function formatJSON(form) {
    const object = {};
    form.forEach((value, key) => {
        object[key] = value;
    });
    return JSON.stringify(object);
}

document.getElementById('user_type').addEventListener('change', function () {
    let userType = this.value;
    let containerList = document.getElementById('container_lists');
    
    // Clear the container before loading new content
    containerList.innerHTML = '';

    if (userType === 'admin') {
        
        fetch('../listAdministrators/')
            .then(response => {
                if (!response.ok) throw new Error('Error loading the file.');
                return response.text();
            })
            .then(html => {
                containerList.innerHTML = html;
                
                initializeDataTable(); // Assuming you have this function for DataTable setup
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Unable to load the administrator list.');
            });
    } else if (userType === 'visitor') {
        // Load the listVisitors view into the container
        fetch('../listVisitors/')
            .then(response => {
                if (!response.ok) throw new Error('Error loading the file.');
                return response.text();
            })
            .then(html => {
                containerList.innerHTML = html;
                $('#tbl-visitor').DataTable({
                    "paging": true,        // Habilita la paginación
                    "searching": true,     // Habilita la búsqueda
                    "ordering": true,      // Habilita el ordenamiento por columnas
                    "info": true,          // Muestra información de la tabla
                    "autoWidth": false,    // Deshabilita el ajuste automático de las columnas
                });
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Unable to load the visitor list.');
            });
    }
    // Add more conditions for other user types if necessary
});



// Función para inicializar DataTables
function initializeDataTable() {
    // Inicializar DataTables en la tabla con id 'tbl-gallery'
    $('#tbl-admin').DataTable({
        "paging": true,        // Habilita la paginación
        "searching": true,     // Habilita la búsqueda
        "ordering": true,      // Habilita el ordenamiento por columnas
        "info": true,          // Muestra información de la tabla
        "autoWidth": false,    // Deshabilita el ajuste automático de las columnas
    });
}



function loadAdmin(){
    fetch('../listAdministrators/')
        .then(response => response.text())
        .then(html => {
            document.getElementById('container_lists').innerHTML = html;
            initializeDataTable();
            
        })
        .catch(error => {
            console.error('Error loading the teacher list:', error);
    });
}

function loadVisitor(){    
    fetch('../listVisitors/')
    .then(response => response.text())
        .then(html => {
            document.getElementById('container_lists').innerHTML = html;
            initializeDataTable();
            
        })
        .catch(error => {
            console.error('Error loading the teacher list:', error);
    });
}

// Function to show the error toast message
function showToastError(message) {
    // Update the content of the toast
    document.getElementById('toastErrorMessage').innerText = message;

    // Show the toast
    const toastElement = document.getElementById('toastError');
    const toast = new bootstrap.Toast(toastElement);
    toastElement.style.display = 'block'; // Ensure it's visible
    toast.show();
}

// Function to show the success toast message
function showToastSuccess(message) {
    // Update the content of the toast
    document.getElementById('toastSuccessMessage').innerText = message;

    // Show the toast
    const toastElement = document.getElementById('toastSuccess');
    const toast = new bootstrap.Toast(toastElement);
    toastElement.style.display = 'block'; // Ensure it's visible
    toast.show();
}

function saveAdminData() {
    const form = new FormData(document.getElementById('registerAdmin'));
    const adminData = Object.fromEntries(form.entries());
    console.log("Datos enviados al servidor:", adminData);

    fetch('/registerAdmin/', {
        method: 'POST',
        body: JSON.stringify(adminData),
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToastSuccess('Administrator created successfully');
            document.getElementById('registerAdmin').reset();
           // Close the modal
           const modalElement = document.getElementById('modalAddAdmin');
           const modalInstance = bootstrap.Modal.getInstance(modalElement); // Get the existing instance
           if (modalInstance) {
               modalInstance.hide();
           }
            loadAdmin(); // Reload the administrator list or table
        } else {
            showToastError(data.error || 'Unknown error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToastError('Connection error with the server');
    });
}


function saveVisitorData() {
    const form = new FormData(document.getElementById('registerVisitor'));
    const adminData = Object.fromEntries(form.entries());
    

    fetch('../registerVisitors/', {
        method: 'POST',
        body: JSON.stringify(adminData),
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToastSuccess('Visitor created successfully');
            document.getElementById('registerVisitor').reset();
           // Close the modal
           const modalElement = document.getElementById('modalAddVisitor');
           const modalInstance = bootstrap.Modal.getInstance(modalElement); // Get the existing instance
           if (modalInstance) {
               modalInstance.hide();
           }
           loadVisitor(); // Reload the visitor list or table
        } else {
            showToastError(data.error || 'Unknown error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToastError('Connection error with the server');
    });
}

// Function to delete an administrator
function deleteAdministrator(id) {
    // Show the confirmation modal
    const modalElement = document.getElementById('confirmationModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();

    // Add event to the confirmation button
    const btnConfirmDelete = document.getElementById('btnConfirmDelete');
    btnConfirmDelete.onclick = function () {
        // Close the modal after confirmation
        modal.hide();

        // Perform the deletion
        fetch(`/deleteAdministrator/${id}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'), // Include the CSRF token
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.status) {
                showToastSuccess(data.message); // Show success message
                loadAdmin(); // Update the administrator list
            } else {
                showToastError(data.message); // Show error message
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToastError('Error deleting administrator.'); // Show generic error message
        });
    };
}

// Load the administrator data in the modal
function getAdministrator(id) {
    fetch(`../getAdministrator/${id}/`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('adminId').value = data.id;
            document.getElementById('editIdAdmin').value = data.id_number;
            document.getElementById('editUsernameAdmin').value = data.user;
            document.getElementById('editPasswordAdmin').value = '';
            document.getElementById('editNamesAdmin').value = data.names;
            
            document.getElementById('editLastNamesAdmin').value = data.last_names;
           
            document.getElementById('editPhoneAdmin').value = data.phone;
            document.getElementById('editEmailAdmin').value = data.email;
            var myModalAdmin = new bootstrap.Modal(document.getElementById('modalEditAdmin'));
            myModalAdmin.show();
        })
        .catch(error => console.error('Error:', error));
}

function getVisitor(id) {
    fetch(`../getVisitor/${id}/`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('visitorId').value = data.id;
            document.getElementById('editIdVisitor').value = data.id_number;
            document.getElementById('editUsernameVisitor').value = data.user;
            document.getElementById('editPasswordVisitor').value = '';
            document.getElementById('editNamesVisitor').value = data.names;
            
            document.getElementById('editLastNamesVisitor').value = data.last_names;
           
            document.getElementById('editPhoneVisitor').value = data.phone;
            document.getElementById('editEmailVisitor').value = data.email;
            var myModalAdmin = new bootstrap.Modal(document.getElementById('modalEditVisitor'));
            myModalAdmin.show();
        })
        .catch(error => console.error('Error:', error));
}

// Save the changes of the administrator
function updateAdministrator() {
    var form = new FormData(document.getElementById('formEditAdmin'));
    var adminData = formatJSON(form);
    var adminId = document.getElementById('adminId').value;

    // Ensure the password field is not empty
    var data = JSON.parse(adminData);
    if (!data.password || data.password.trim() === '') {
        delete data.password;
    }
    adminData = JSON.stringify(data);

    fetch(`../updateAdministrator/${adminId}/`, {
        method: 'POST',
        body: adminData,
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw err; });
        }
        return response.json();
    })
    .then(data => {
        showToastSuccess('Administrator successfully updated'); // Mostrar mensaje de éxito
        loadAdmin(); // Actualizar la lista de administradores
        var myModalEl = document.getElementById('modalEditAdmin');
        var modal = bootstrap.Modal.getInstance(myModalEl);
        modal.hide();
    })
    .catch(error => {
        showToastError('There was an error while updating the administrator', error);
    });

    
}


function updateVisitor() {
    var form = new FormData(document.getElementById('formEditVisitor'));
    var adminData = formatJSON(form);
    var visitorId = document.getElementById('visitorId').value;

    // Ensure the password field is not empty
    var data = JSON.parse(adminData);
    if (!data.password || data.password.trim() === '') {
        delete data.password;
    }
    adminData = JSON.stringify(data);

    fetch(`../updateVisitor/${visitorId}/`, {
        method: 'POST',
        body: adminData,
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw err; });
        }
        return response.json();
    })
    .then(data => {
        showToastSuccess('Visitor successfully updated'); // Mostrar mensaje de éxito
        loadVisitor(); // Actualizar la lista de administradores
        var myModalEl = document.getElementById('modalEditVisitor');
        var modal = bootstrap.Modal.getInstance(myModalEl);
        modal.hide();
    })
    .catch(error => {
        showToastError('There was an error while updating the administrator', error);
    });

    
}


function deleteVisitor(id) {
    // Show the confirmation modal
    const modalElement = document.getElementById('confirmationModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();

    // Add event to the confirmation button
    const btnConfirmDelete = document.getElementById('btnConfirmDelete');
    btnConfirmDelete.onclick = function () {
        // Close the modal after confirmation
        modal.hide();

        // Perform the deletion
        fetch(`../deleteVisitor/${id}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'), // Include the CSRF token
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.status) {
                showToastSuccess(data.message); // Show success message
                loadAdmin(); // Update the administrator list
            } else {
                showToastError(data.message); // Show error message
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToastError('Error deleting Visitor.'); // Show generic error message
        });
    };
}

