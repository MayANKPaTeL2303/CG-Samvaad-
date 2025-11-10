from rest_framework import generics, filters, status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend # type: ignore
from django.utils import timezone
from .models import Complaint, ComplaintUpdate
from .serializers import ComplaintSerializer, ComplaintListSerializer, ComplaintUpdateSerializer, ComplaintRatingSerializer

class ComplaintListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'status', 'priority', 'district']
    search_fields = ['title', 'description', 'address']
    ordering_fields = ['created_at', 'status', 'priority']
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'officer':
            queryset = Complaint.objects.all() # Officers can see all the complaints
            district = self.request.query_params.get('district')
            if district:
                queryset = queryset.filter(district=district)
            
            return queryset

        # Citizens see only their complaints
        return Complaint.objects.filter(citizen = user)

    
    def get_serializer_class(self):
        if self.action == 'list':
            return ComplaintListSerializer
        return ComplaintSerializer
    
    def perform_create(self, serializer):
        serializer.save(citizen = self.request.user)

    def update(self, request, *args, **kwargs):
        complaint = self.get_object()
        old_status = complaint.status
        
        # Only officers can update status and assign themselves
        if 'status' in request.data and request.user.role != 'officer':
            return Response(
                {"error": "Only officers can update complaint status"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # If status is being updated to resolved, set resolved_at
        if 'status' in request.data and request.data['status'] == 'resolved':
            request.data['resolved_at'] = timezone.now()
        
        response = super().update(request, *args, **kwargs)
        
        # Create update record if status changed
        if 'status' in request.data and old_status != request.data['status']:
            ComplaintUpdate.objects.create(
                complaint=complaint,
                updated_by=request.user,
                old_status=old_status,
                new_status=request.data['status'],
                comment=request.data.get('officer_notes', '')
            )
        
        return response
    
    @action(detail=True, methods=['post'])
    def rate_complaint(self, request, pk=None):
        complaint = self.get_object()
        
        # Check if complaint belongs to the user
        if complaint.citizen != request.user:
            return Response(
                {"error": "You can only rate your own complaints"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if complaint is resolved
        if complaint.status != 'resolved':
            return Response(
                {"error": "Can only rate resolved complaints"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = ComplaintRatingSerializer(data=request.data)
        if serializer.is_valid():
            complaint.rating = serializer.validated_data['rating']
            complaint.feedback = serializer.validated_data.get('feedback', '')
            complaint.save()
            
            return Response(
                ComplaintSerializer(complaint).data,
                status=status.HTTP_200_OK
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def updates(self, request, pk=None):
        # Get the all the complaint for the user
        complaint = self.get_object()
        updates = complaint.updates.all()
        serializer = ComplaintUpdateSerializer(updates, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def assign_to_me(self, request, pk=None):
        # Officer assigns complaint to themselves
        if request.user.role != 'officer':
            return Response(
                {"error": "Only officers can assign complaints"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        complaint = self.get_object()
        complaint.assigned_officer = request.user
        if complaint.status == 'pending':
            complaint.status = 'in_progress'
        complaint.save()
    
        ComplaintUpdate.objects.create(
            complaint=complaint,
            updated_by=request.user,
            old_status='pending',
            new_status='in_progress',
            comment=f'Assigned to {request.user.get_full_name()}'
        )
        
        return Response(ComplaintSerializer(complaint).data)

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
    
    def perform_create(self, serializer):
        serializer.save(citizen=self.request.user)

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