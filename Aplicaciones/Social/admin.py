from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User,Admin,Visitor

class UserAdmin(BaseUserAdmin):
    model = User
    # Define los campos a mostrar en el panel de administración
    list_display = ('username', 'user_type', 'is_staff', 'is_active')
    # Opcionalmente puedes añadir filtros y campos de búsqueda
    list_filter = ('user_type', 'is_staff', 'is_active')
    search_fields = ('username', 'email')
    ordering = ('username',)

    # Definir los campos del formulario para crear un nuevo usuario
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2', 'user_type'),
        }),
    )
    # Definir los campos del formulario para editar un usuario existente
    fieldsets = (
        (None, {
            'fields': ('username', 'password'),
        }),
        ('Permissions', {
            'classes': ('collapse',),
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Important dates', {
            'classes': ('collapse',),
            'fields': ('last_login', 'date_joined'),
        }),
        ('User Info', {
            'fields': ('user_type',),
        }),
    )

admin.site.register(User, UserAdmin)
admin.site.register(Admin)
admin.site.register(Visitor)