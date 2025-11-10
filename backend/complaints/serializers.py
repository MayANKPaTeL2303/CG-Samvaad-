from rest_framework import serializers
from .models import Complaint,ComplaintUpdate
from users.serializers import UserSerializer

class ComplaintSerializer(serializers.ModelSerializer):
    citizen_details = UserSerializer(source='citizen', read_only=True)
    officer_details = UserSerializer(source='assigned_officer', read_only=True)
    resolution_time = serializers.SerializerMethodField()
    
    class Meta:
        model = Complaint
        fields = [
            'id', 'title', 'description', 'category', 'status', 'priority',
            'latitude', 'longitude', 'address', 'district','image',
            'citizen', 'citizen_details', 'assigned_officer', 'officer_details',
            'created_at', 'updated_at', 'resolved_at',
            'rating', 'feedback', 'officer_notes', 'resolution_time'
        ]
        read_only_fields = ['id', 'citizen', 'created_at', 'updated_at']
    
    def get_resolution_time(self, obj):
        return obj.get_resolution_time()
    
    def create(self, validated_data):
        validated_data['citizen'] = self.context['request'].user
        return super().create(validated_data)

class ComplaintListSerializer(serializers.ModelSerializer):
    citizen_name = serializers.CharField(source='citizen.get_full_name', read_only=True)
    officer_name = serializers.CharField(source='assigned_officer.get_full_name', read_only=True)
    
    class Meta:
        model = Complaint
        fields = [
            'id', 'title', 'category', 'status',
            'latitude', 'longitude', 'address',
            'citizen_name', 'created_at', 'officer_name'
        ]

class ComplaintUpdateSerializer(serializers.ModelSerializer):
    updated_by_name = serializers.CharField(source='updated_by.get_full_name', read_only=True)

    class Meta: 
        model = ComplaintUpdate
        fields = ['id', 'old_status', 'new_status', 'comment', 'updated_by_name', 'created_at']

class ComplaintRatingSerializer(serializers.Serializer):
    rating = serializers.IntegerField(min_value=1, max_value=5, required=True)
    feedback = serializers.CharField(required=False, allow_blank=True)