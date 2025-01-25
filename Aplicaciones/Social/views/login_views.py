from django.contrib.auth import authenticate, login, logout
from django.shortcuts import render, redirect
from django.contrib import messages
from ..models import Admin

def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        password = request.POST.get('password', '').strip()
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            request.session['username'] = user.username  # Save the username in the session
            # Redirect based on user type
            if user.user_type == 'admin':
                return redirect('adminHome')
            elif user.user_type == 'visitor':
                return redirect('visitorHome')
        else:
            # Add the error message
            messages.error(request, 'Invalid credentials')
            return render(request, '../templates/Login/login.html')  # Make sure the path is correct
    return render(request, '../templates/Login/login.html')

def logout_view(request):
    logout(request)
    return redirect('login_view')


def register(request):
    user = request.user
    print(f"Authenticated user: {user.username}")

    try:
        admin = user.admin  # Attempt to access the admin profile
        admin_name = f'{admin.last_names} {admin.names} '
        print(f"Admin profile found: {admin_name}")
    except Admin.DoesNotExist:
        admin = None
        admin_name = user.username  # In case the admin profile does not exist
        print("Admin profile not found.")

    context = {
        'admin_name': admin_name,
        'admin': admin
    }
    print(f"Context sent to the template: {context}")
    
    return render(request, '../templates/Register/register.html', context)
