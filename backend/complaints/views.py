from rest_framework import generics, filters, status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend # type: ignore
from django.utils import timezone
from .models import Complaint
from .serializers import ComplaintSerializer, ComplaintListSerializer

class ComplaintListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'status']
    search_fields = ['title', 'description', 'address']
    ordering_fields = ['created_at', 'status']
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'officer':
            return Complaint.objects.all()
        return Complaint.objects.filter(citizen=user)
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ComplaintListSerializer
        return ComplaintSerializer

class ComplaintDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ComplaintSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'officer':
            return Complaint.objects.all()
        return Complaint.objects.filter(citizen=user)
    
    def update(self, request, *args, **kwargs):
        complaint = self.get_object()
        
        # Only officers can update status
        if 'status' in request.data and request.user.role != 'officer':
            return Response(
                {"error": "Only officers can update complaint status"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().update(request, *args, **kwargs)