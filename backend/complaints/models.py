from django.db import models
from users.models import User

class Complaint(models.Model):
    CATEGORY_CHOICES = [
        ('water', 'Water Supply'),
        ('sanitation', 'Sanitation'),
        ('roads', 'Roads & Infrastructure'),
        ('electricity', 'Electricity'),
        ('streetlight', 'Street Lighting'),
        ('drainage', 'Drainage'),
        ('garbage', 'Garbage Collection'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('rejected', 'Rejected'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    address = models.CharField(max_length=500, blank=True, null=True)
    
    image = models.ImageField(upload_to='complaints/', blank=True, null=True)
    
    citizen = models.ForeignKey(User, on_delete=models.CASCADE, related_name='complaints')
    assigned_officer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_complaints')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    rating = models.IntegerField(null=True, blank=True, choices=[(i, i) for i in range(1, 6)])
    feedback = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.status}"