from django.contrib import admin
from .models import ComplaintCluster, ComplaintEmbedding


@admin.register(ComplaintCluster)
class ComplaintClusterAdmin(admin.ModelAdmin):
    list_display = ['cluster_id', 'cluster_name', 'complaint_count', 'created_at']
    list_filter = ['created_at']
    search_fields = ['cluster_name', 'keywords']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(ComplaintEmbedding)
class ComplaintEmbeddingAdmin(admin.ModelAdmin):
    list_display = ['complaint', 'cluster', 'similarity_score', 'created_at']
    list_filter = ['cluster', 'created_at']
    search_fields = ['complaint__title']
    readonly_fields = ['created_at']