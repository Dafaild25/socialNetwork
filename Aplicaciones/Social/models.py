from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager

class UserManager(BaseUserManager):
    def create_user(self, username, password=None, **extra_fields):
        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(username=username, password=password, **extra_fields)

class User(AbstractUser):
    user_type = models.CharField(max_length=10, choices=[('admin', 'Admin'), ('visitor', 'Visitor')])

    objects = UserManager()

# Create your models here.

class Admin(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='admin')
    id_number = models.CharField(max_length=12, unique=True)
    names = models.CharField(max_length=150)
    last_names = models.CharField(max_length=150)   
    phone = models.CharField(max_length=12)
    email = models.EmailField()

    # Convert text fields to uppercase before saving
    def save(self, *args, **kwargs):
        self.names = self.names.upper()
        self.last_names = self.last_names.upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.names} {self.last_names}"


class Visitor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='visitor')
    id_number = models.CharField(max_length=12, unique=True)
    names = models.CharField(max_length=150)
    last_names = models.CharField(max_length=150)
    phone = models.CharField(max_length=12)
    email = models.EmailField()

    # Convert text fields to uppercase before saving
    def save(self, *args, **kwargs):
        self.names = self.names.upper()
        self.last_names = self.last_names.upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.names} {self.last_names}"




