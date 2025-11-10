from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ComplaintViewSet, ComplaintListCreateView, ComplaintDetailView

router = DefaultRouter()
router.register(r'v2', ComplaintViewSet, basename='complaint')

urlpatterns = [
    path('', include(router.urls)),
    path('list/', ComplaintListCreateView.as_view(), name='complaint-list-create'),
    path('detail/<int:pk>/', ComplaintDetailView.as_view(), name='complaint-detail'),
]