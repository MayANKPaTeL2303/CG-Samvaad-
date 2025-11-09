from django.db import models
from complaints.models import Complaint

class ComplaintCluster(models.Model):
    cluster_id = models.IntegerField()
    cluster_name = models.CharField(max_length=200)
    keywords = models.JSONField(default=list)
    complaint_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-complaint_count']
    
    def __str__(self):
        return f"Cluster {self.cluster_id}: {self.cluster_name}"


class ComplaintEmbedding(models.Model):
    complaint = models.OneToOneField(Complaint, on_delete=models.CASCADE, related_name='embedding')
    embedding_vector = models.JSONField()
    cluster = models.ForeignKey(ComplaintCluster, on_delete=models.SET_NULL, null=True, blank=True)
    similarity_score = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Embedding for {self.complaint.title}"