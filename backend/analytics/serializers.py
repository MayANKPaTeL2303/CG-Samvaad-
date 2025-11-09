from rest_framework import serializers
from .models import ComplaintCluster, ComplaintEmbedding
from complaints.serializers import ComplaintListSerializer


class ComplaintClusterSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComplaintCluster
        fields = ['id', 'cluster_id', 'cluster_name', 'keywords', 'complaint_count', 'created_at']


class ComplaintEmbeddingSerializer(serializers.ModelSerializer):
    complaint_details = ComplaintListSerializer(source='complaint', read_only=True)
    
    class Meta:
        model = ComplaintEmbedding
        fields = ['id', 'complaint', 'complaint_details', 'cluster', 'similarity_score', 'created_at']


class AnalyticsStatsSerializer(serializers.Serializer):
    """Serializer for analytics statistics"""
    total_complaints = serializers.IntegerField()
    pending_complaints = serializers.IntegerField()
    in_progress_complaints = serializers.IntegerField()
    resolved_complaints = serializers.IntegerField()
    rejected_complaints = serializers.IntegerField()
    
    category_distribution = serializers.DictField()
    status_distribution = serializers.DictField()
    
    daily_complaints = serializers.ListField()
    monthly_complaints = serializers.ListField()
    
    avg_resolution_time = serializers.FloatField(allow_null=True)
    top_categories = serializers.ListField()
    
    complaint_heatmap = serializers.ListField()


class ClusteringResultSerializer(serializers.Serializer):
    """Serializer for clustering results"""
    clusters = serializers.ListField()
    total_clusters = serializers.IntegerField()
    total_complaints = serializers.IntegerField()
    outliers = serializers.IntegerField(required=False)