from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
from django.db.models.signals import post_delete
from django.dispatch import receiver
from django.shortcuts import render
from ..models import *
from django.contrib.auth.decorators import login_required





# List all visitors
def listVisitors(request):
    visitors= Visitor.objects.all()  # Get all visitors

    return render(request, '../templates/Register/listVisitor.html', {'visitors': visitors})


@csrf_exempt
def registerVisitors(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            id_number = data.get('id_number_visitor')
            names = data.get('names')
            last_names = data.get('last_names')
            phone = data.get('phone_visitor')
            email = data.get('email_visitor')
            user_type = data.get('userVisitor')

            # Validation
            if not id_number or not names or not last_names or not phone or not email or not user_type:
                return JsonResponse({'success': False, 'error': "Missing required fields"}, status=400)

            if len(id_number) != 10 or not id_number.isdigit():
                return JsonResponse({'success': False, 'error': "ID must have 10 digits"}, status=400)

            if len(phone) != 10 or not phone.isdigit():
                return JsonResponse({'success': False, 'error': "Phone number must have 10 digits"}, status=400)

            if User.objects.filter(username=id_number).exists():
                return JsonResponse({'success': False, 'error': "User already exists"}, status=400)

            # Create the user
            password = id_number  # Password is set to the ID
            user = User.objects.create_user(username=id_number, user_type=user_type, password=password)
            user.save()

            if user_type == 'visitor':
                Visitor.objects.create(
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


@receiver(post_delete, sender=Visitor)
def deleteAssociatedUser(sender, instance, **kwargs):
    # Check if the user exists before trying to delete
    if instance.user:
        instance.user.delete()


def deleteVisitor(request, id):
    print(f'Received ID for deletion: {id}')  # Debug
    if request.method == 'DELETE':
        try:
            visitor = Visitor.objects.get(id=id)
            user = visitor.user
            visitor.delete()

            return JsonResponse({
                'status': True,
                'message': 'visitor successfully deleted.'
            }, status=200)
        except Admin.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'visitor not found.'}, status=404)
        except Exception as e:
            return JsonResponse({'status': False, 'message': f'Server error: {str(e)}'}, status=500)
    else:
        return JsonResponse({'status': False, 'message': 'Method not allowed.'}, status=405)


def getVisitor(request, id):
    try:
        visitors = Visitor.objects.get(id=id)
        data = {
            "id": visitors.id,
            "id_number": visitors.id_number,
            "user": visitors.user.username if visitors.user else "Not assigned",
            "names": visitors.names,
            "last_names": visitors.last_names,
            "phone": visitors.phone,
            "email": visitors.email,
        }
        return JsonResponse(data)
    except Admin.DoesNotExist:
        return JsonResponse({"error": "visitors not found"}, status=404)


@csrf_exempt
def updateVisitor(request, id):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            visitor = Visitor.objects.get(id=id)

            # Validate the new ID is not already assigned to another visitor
            new_id_number = data.get('id_number', visitor.id_number)
            if Admin.objects.filter(id_number=new_id_number).exclude(id=visitor.id).exists():
                return JsonResponse({'success': False, 'error': "ID is already in use by another visitor"}, status=400)
            
            # Validate the ID number and phone number length (max 10 digits)
            if len(new_id_number) > 10:
                return JsonResponse({'success': False, 'error': "ID number cannot exceed 10 digits"}, status=400)

            new_phone_number = data.get('editPhoneVisitor', visitor.phone)
            if len(new_phone_number) > 10:
                return JsonResponse({'success': False, 'error': "Phone number cannot exceed 10 digits"}, status=400)

            # Update visitor's data
            visitor.id_number = new_id_number
            visitor.names = data.get('editNamesVisitor', visitor.names)
            visitor.last_names = data.get('editLastNamesVisitor', visitor.last_names)     
          
            visitor.phone = new_phone_number
            visitor.email = data.get('editEmailVisitor', visitor.email)
            visitor.save()

            # Update the associated user data (if it exists)
            user = visitor.user
            if user:
                user.username = data.get('username', user.username)
                new_password = data.get('password')
                if new_password:
                    user.set_password(new_password)

                user.save()

            return JsonResponse({"message": "Visitor and user successfully updated"})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Method not allowed"}, status=405)

