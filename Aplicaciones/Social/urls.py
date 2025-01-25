from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from .views.login_views import login_view,logout_view,register
from .views.Admin_views  import adminHome ,listAdministrators,registerAdmin,deleteAdministrator,getAdministrator,updateAdministrator
from .views.Visitor_views import deleteVisitor, getVisitor, listVisitors, registerVisitors, updateVisitor

urlpatterns = [

    #URLS LOGIN
    path('', login_view, name='login_view'), 
    path('logout_view/', logout_view, name='logout_view'),
    path('register/',register, name='register'),

    #URLS ADMIN
    path('adminHome/', adminHome, name='adminHome'),
    path('listAdministrators/', listAdministrators, name='listAdministrators'),
    path('registerAdmin/', registerAdmin, name='registerAdmin'),
    path('deleteAdministrator/<int:id>/',deleteAdministrator,name='deleteAdministrator'),
    path('getAdministrator/<int:id>/', getAdministrator, name='getAdministrator'),
    path('updateAdministrator/<int:id>/', updateAdministrator, name='updateAdministrator'),
    
    
    #urls VISITOR
    path('listVisitors/', listVisitors, name='listVisitors'),
    path('registerVisitors/', registerVisitors, name='registerVisitors'),
    path('getVisitor/<int:id>/', getVisitor, name='getVisitor'),
    path('updateVisitor/<int:id>/', updateVisitor, name='updateVisitor'),
    path('deleteVisitor/<int:id>/',deleteVisitor,name='deleteVisitor'),
    
    

]