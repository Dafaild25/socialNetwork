from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
from django.db.models.signals import post_delete
from django.dispatch import receiver
from django.shortcuts import get_object_or_404, render
from ..models import User, Admin
from django.contrib.auth.decorators import login_required


@login_required
def adminHome(request):
    user = request.user
    print(f"Authenticated user: {user.username}")

    try:
        admin = user.admin  # Try to access the admin profile
        admin_name = f'{admin.names} {admin.last_names}'
        print(f"Admin profile found: {admin_name}")
    except Admin.DoesNotExist:
        admin = None
        admin_name = user.username  # Fallback to username if the admin profile does not exist
        print("Admin profile not found.")

    context = {
        'admin_name': admin_name,
        'admin': admin,  # You can also pass the full admin object if needed
    }
    print(f"Context sent to the template: {context}")
    return render(request, '../templates/AdminView/adminHome.html', context)


# List all administrators
def listAdministrators(request):
    administrators = Admin.objects.all()  
    
    context = {
        'administrators': administrators
    }
    return render(request, '../templates/Register/listAdmin.html', context)


@csrf_exempt
def registerAdmin(request):
    if request.method == 'POST':
        try:
            # Leer datos del cuerpo como JSON
            data = json.loads(request.body)
            print(f"Data received: {data}")
            id_number = data.get('id_number_admin')
            phone = data.get('phone_admin')
            names = data.get('names')
            last_names = data.get('last_names')
            email = data.get('email_admin')
            user_type = data.get('userAdmin')

           

           
            # Validation
            if not id_number or not names or not last_names or not phone or not email or not user_type:
                return JsonResponse({'success': False, 'error': "Missing required fields"}, status=400)

            if len(id_number) != 10 or not id_number.isdigit():
                return JsonResponse({'success': False, 'error': "ID must have 10 digits"}, status=400)

            if len(phone) != 10 or not phone.isdigit():
                return JsonResponse({'success': False, 'error': "Phone number must have 10 digits"}, status=400)

            if User.objects.filter(username=id_number).exists():
                return JsonResponse({'success': False, 'error': "User already exists"}, status=400)

            # Crear usuario y administrador
            password = id_number  # Contraseña igual al ID
            user = User.objects.create_user(username=id_number, password=password)
            user.save()

            if user_type == 'admin':
                Admin.objects.create(
                    user=user,
                    id_number=id_number,
                    names=names,
                    last_names=last_names,
                    phone=phone,
                    email=email
                )

            return JsonResponse({'success': True})

        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'error': 'Error decoding JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'success': False, 'error': f"Unexpected error: {str(e)}"}, status=500)

    return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)


@receiver(post_delete, sender=Admin)
def deleteAssociatedUser(sender, instance, **kwargs):
    # Check if the user exists before trying to delete
    if instance.user:
        instance.user.delete()


def deleteAdministrator(request, id):
    print(f'Received ID for deletion: {id}')  # Debug
    if request.method == 'DELETE':
        try:
            administrator =get_object_or_404(Admin, id=id)
            user = administrator.user
            administrator.delete()

            return JsonResponse({
                'status': True,
                'message': 'Administrator successfully deleted.'
            }, status=200)
        except Admin.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'Administrator not found.'}, status=404)
        except Exception as e:
            return JsonResponse({'status': False, 'message': f'Server error: {str(e)}'}, status=500)
    else:
        return JsonResponse({'status': False, 'message': 'Method not allowed.'}, status=405)


def getAdministrator(request, id):
    try:
        administrator = Admin.objects.get(id=id)
        data = {
            "id": administrator.id,
            "id_number": administrator.id_number,
            "user": administrator.user.username if administrator.user else "Not assigned",
            "names": administrator.names,
           
            "last_names": administrator.last_names,
          
            "phone": administrator.phone,
            "email": administrator.email,
        }
        return JsonResponse(data)
    except Admin.DoesNotExist:
        return JsonResponse({"error": "Administrator not found"}, status=404)


@csrf_exempt
def updateAdministrator(request, id):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            administrator = Admin.objects.get(id=id)

            # Validate the new ID is not already assigned to another administrator
            new_id_number = data.get('id_number', administrator.id_number)
            if Admin.objects.filter(id_number=new_id_number).exclude(id=administrator.id).exists():
                return JsonResponse({'success': False, 'error': "ID is already in use by another administrator"}, status=400)
            
            # Validate the ID number and phone number length (max 10 digits)
            if len(new_id_number) > 10:
                return JsonResponse({'success': False, 'error': "ID number cannot exceed 10 digits"}, status=400)

            new_phone_number = data.get('phone', administrator.phone)
            if len(new_phone_number) > 10:
                return JsonResponse({'success': False, 'error': "Phone number cannot exceed 10 digits"}, status=400)

            # Update administrator's data
            administrator.id_number = new_id_number
            administrator.names = data.get('editNamesAdmin', administrator.names)
            administrator.last_names = data.get('editLastNamesAdmin', administrator.last_names)     
            administrator.phone = new_phone_number
            administrator.email = data.get('email', administrator.email)
            administrator.save()

            # Update the associated user data (if it exists)
            user = administrator.user
            if user:
                user.username = data.get('username', user.username)
                new_password = data.get('password')
                if new_password:
                    user.set_password(new_password)

                user.save()

            return JsonResponse({"message": "Administrator and user successfully updated"})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Method not allowed"}, status=405)