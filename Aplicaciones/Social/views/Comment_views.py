from datetime import timezone
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
def listComment(request, publication_id):
    
    comments = Comment.objects.filter(publication=publication_id)
    context={
        'comments': comments,
        
    }
    return render(request, '../templates/Publications/listPotsVisitor.html', context)



def createComment(request):
    if request.method == 'POST':
        comment_text = request.POST.get('commentText')
        publication_id = request.POST.get('publication_id')

        # Validar que los campos no estén vacíos
        if not comment_text or not publication_id:
            return JsonResponse({'status': 'error', 'message': 'Incomplete fields'})

        # Obtener la publicación
        publication = get_object_or_404(Publication, id=publication_id)

        # Crear el comentario con el usuario logueado
        try:
            comment = Comment.objects.create(
                comment=comment_text,
                publication=publication,
                user=request.user  
            )
            return JsonResponse({'status': 'ok', 'message': 'Comment saved successfully'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': f'Error al guardar el comentario: {str(e)}'})
    else:
        return JsonResponse({'status': 'error', 'message': 'Método no permitido'})


def selectComment(request, comment_id):
    comment = get_object_or_404(Comment, id=comment_id)
    return JsonResponse({
        'comment': comment.comment
    })


def updateComment(request, comment_id):
    if request.method == 'POST':
        comment_text = request.POST.get('commentTextEdit')

        # Validar que el campo no esté vacío
        if not comment_text:
            return JsonResponse({'status': 'error', 'message': 'Incomoplete fields'})

        # Obtener el comentario
        comment = get_object_or_404(Comment, id=comment_id)

        # Actualizar el comentario
        try:
            comment.comment = comment_text
           
            
            comment.save()
            return JsonResponse({'status': 'ok', 'message': 'Comment updated successfully'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': f'Error updating comment: {str(e)}'})
    else:
        return JsonResponse({'status': 'error', 'message': 'Disallowed method'})
    
    
@login_required
def deleteComment(request, comment_id):
    # Verificar que la solicitud es un DELETE
    if request.method == 'DELETE':
        # Obtener el comentario a eliminar
        comment = get_object_or_404(Comment, id=comment_id)

        if comment.user != request.user and not request.user.is_staff:
            return JsonResponse({'status': 'error', 'message': 'You do not have permission to delete this comment'})

        # Delete the comment
        try:
            comment.delete()
            return JsonResponse({'status': 'ok', 'message': 'Comment successfully deleted'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': f'Error deleting the comment: {str(e)}'})

    return JsonResponse({'status': 'error', 'message': 'Method not allowed'})