from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
from django.db.models.signals import post_delete
from django.dispatch import receiver
from django.shortcuts import get_object_or_404, render
from ..models import *
from django.contrib.auth.decorators import login_required
from django.forms.models import model_to_dict



@login_required
def viewPublications(request):
    
    user = request.user
    print(f"Authenticated user: {user.username}")

    try:
        admin = user.admin  
        admin_name = f'{admin.names} {admin.last_names}'
        
    except Admin.DoesNotExist:
        admin = None
        admin_name = user.username  
        
    publications = Publication.objects.all()  
    visitors = Visitor.objects.all()   
    
    context = {
        'publications': publications,
        'visitors': visitors,
        'admin_name': admin_name,
        'admin': admin,
    }
    return render(request, '../templates/Publications/viewPublications.html', context)


def listPostsVisitor(request, visitor_id):
    visitor = get_object_or_404(Visitor, id=visitor_id)
    posts = Publication.objects.filter(visitor=visitor_id)
    context={
        'visitor': visitor,
        'posts': posts,
    }
    return render(request, '../templates/Publications/listPotsVisitor.html', context)

def createPost(request):
    if request.method == 'POST':
        title = request.POST.get('title')
        description = request.POST.get('description')
        visitor_id = request.POST.get('visitor_id')

        # Validar que los campos no estén vacíos
        if not title or not description or not visitor_id:
            return JsonResponse({'status': 'error', 'message': 'Campos incompletos'})

        try:
            visitor = get_object_or_404(Visitor, id=visitor_id)
        except Visitor.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Visitante no encontrado'})

        # Creamos la publicación
        publication = Publication.objects.create(
            title=title,
            description=description,
            visitor=visitor
        )
        return JsonResponse({'status': 'ok'})
    else:
        return JsonResponse({'status': 'error', 'message': 'Método no permitido'})
    

def selectPost(request, post_id):
    
    try:
        post = Publication.objects.get(id=post_id)
        data = {
            'id': post.id,
            'title': post.title,
            'description': post.description,
            'visitor': post.visitor.id,
        }
        
        return JsonResponse(data)
    
    except Admin.DoesNotExist:
        return JsonResponse({"error": "Administrator not found"}, status=404)

def updatePost(request, post_id):
    if request.method == 'POST':
        try:
            post = Publication.objects.get(id=post_id)

            # Obtén datos del cuerpo de la solicitud (FormData)
            title = request.POST.get('editPostTitle', post.title)
            description = request.POST.get('editPostDescription', post.description)

            # Actualiza los campos de la publicación
            post.title = title
            post.description = description
            post.save()

            return JsonResponse({"message": "Post successfully updated"})
        except Publication.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Post not found'}, status=404)
        except Exception as e:
            return JsonResponse({'success': False, 'error': f"Unexpected error: {str(e)}"}, status=500)
    return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)


# def deletePost(request, post_id):
#     if request.method == 'DELETE':
#         try:
#             post = Publication.objects.get(id=post_id)
#             post.delete()

#             return JsonResponse({
#                 'status': True,
#                 'message': 'Post successfully deleted.'
#             }, status=200)
#         except Publication.DoesNotExist:
#             return JsonResponse({'status': False, 'message': 'Post not found.'}, status=404)
#         except Exception as e:
#             return JsonResponse({'status': False, 'message': f'Server error: {str(e)}'}, status=500)
#     else:
#         return JsonResponse({'status': False, 'message': 'Method not allowed.'}, status=405)
    
    
    
def deletePost(request, post_id):
    if request.method == 'DELETE':
        try:
            # Obtén la publicación (post) por su ID
            post = Publication.objects.get(id=post_id)

            # Verifica si la publicación tiene comentarios asociados
            if post.comments.exists():  # Si tiene comentarios, no permitimos la eliminación
                return JsonResponse({
                    'status': False,
                    'message': 'Post cannot be deleted because it has associated comments.'
                }, status=400)

            # Si no tiene comentarios, procedemos con la eliminación
            post.delete()

            return JsonResponse({
                'status': True,
                'message': 'Post successfully deleted.'
            }, status=200)
        
        except Publication.DoesNotExist:
            return JsonResponse({'status': False, 'message': 'Post not found.'}, status=404)
        except Exception as e:
            return JsonResponse({'status': False, 'message': f'Server error: {str(e)}'}, status=500)
    else:
        return JsonResponse({'status': False, 'message': 'Method not allowed.'}, status=405)