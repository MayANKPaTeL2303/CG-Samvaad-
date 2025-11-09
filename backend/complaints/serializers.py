from rest_framework import serializers
from .models import Complaint
from users.serializers import UserSerializer

class ComplaintSerializer(serializers.ModelSerializer):
    citizen_details = UserSerializer(source='citizen', read_only=True)
    officer_details = UserSerializer(source='assigned_officer', read_only=True)
    
    class Meta:
        model = Complaint
        fields = [
            'id', 'title', 'description', 'category', 'status',
            'latitude', 'longitude', 'address', 'image',
            'citizen', 'citizen_details', 'assigned_officer', 'officer_details',
            'created_at', 'updated_at', 'resolved_at',
            'rating', 'feedback'
        ]
        read_only_fields = ['id', 'citizen', 'created_at', 'updated_at', 'resolved_at']
    
    def create(self, validated_data):
        validated_data['citizen'] = self.context['request'].user
        return super().create(validated_data)

class ComplaintListSerializer(serializers.ModelSerializer):
    citizen_name = serializers.CharField(source='citizen.get_full_name', read_only=True)
    
    class Meta:
        model = Complaint
        fields = [
            'id', 'title', 'category', 'status',
            'latitude', 'longitude', 'address',
            'citizen_name', 'created_at'
        ]