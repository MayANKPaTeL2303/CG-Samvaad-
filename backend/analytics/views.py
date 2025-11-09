from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Avg, Q, F
from django.utils import timezone
from datetime import timedelta
from complaints.models import Complaint
from .models import ComplaintCluster, ComplaintEmbedding
from .serializers import (
    ComplaintClusterSerializer, 
    AnalyticsStatsSerializer,
    ClusteringResultSerializer
)
from .ai_service import clustering_service
import logging

logger = logging.getLogger(__name__)


class AnalyticsViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        try:
            total_complaints = Complaint.objects.count()
            pending = Complaint.objects.filter(status='pending').count()
            in_progress = Complaint.objects.filter(status='in_progress').count()
            resolved = Complaint.objects.filter(status='resolved').count()
            rejected = Complaint.objects.filter(status='rejected').count()
            
            category_dist = dict(
                Complaint.objects.values('category')
                .annotate(count=Count('id'))
                .values_list('category', 'count')
            )
            
            status_dist = dict(
                Complaint.objects.values('status')
                .annotate(count=Count('id'))
                .values_list('status', 'count')
            )
            
            seven_days_ago = timezone.now() - timedelta(days=7)
            daily_complaints = []
            for i in range(7):
                date = seven_days_ago + timedelta(days=i)
                count = Complaint.objects.filter(
                    created_at__date=date.date()
                ).count()
                daily_complaints.append({
                    'date': date.strftime('%Y-%m-%d'),
                    'count': count
                })
            
            monthly_complaints = []
            for i in range(6):
                date = timezone.now() - timedelta(days=30*i)
                count = Complaint.objects.filter(
                    created_at__year=date.year,
                    created_at__month=date.month
                ).count()
                monthly_complaints.append({
                    'month': date.strftime('%b %Y'),
                    'count': count
                })
            monthly_complaints.reverse()
            
            resolved_complaints = Complaint.objects.filter(
                status='resolved',
                resolved_at__isnull=False
            )
            
            avg_time = None
            if resolved_complaints.exists():
                total_time = sum([
                    (c.resolved_at - c.created_at).total_seconds() / 3600
                    for c in resolved_complaints
                ])
                avg_time = total_time / resolved_complaints.count()
            
            top_categories = list(
                Complaint.objects.values('category')
                .annotate(count=Count('id'))
                .order_by('-count')[:5]
            )
            
            heatmap_data = list(
                Complaint.objects.values('latitude', 'longitude', 'category')
                .annotate(count=Count('id'))
            )
            
            data = {
                'total_complaints': total_complaints,
                'pending_complaints': pending,
                'in_progress_complaints': in_progress,
                'resolved_complaints': resolved,
                'rejected_complaints': rejected,
                'category_distribution': category_dist,
                'status_distribution': status_dist,
                'daily_complaints': daily_complaints,
                'monthly_complaints': monthly_complaints,
                'avg_resolution_time': round(avg_time, 2) if avg_time else None,
                'top_categories': top_categories,
                'complaint_heatmap': heatmap_data
            }
            
            serializer = AnalyticsStatsSerializer(data)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error in dashboard_stats: {e}")
            return Response(
                {'error': 'Failed to fetch dashboard statistics'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def cluster_complaints(self, request):
        try:
            # Check if user is officer
            if request.user.role != 'officer':
                return Response(
                    {'error': 'Only officers can perform clustering'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            method = request.data.get('method', 'kmeans') 
            n_clusters = int(request.data.get('n_clusters', 5))
            
            complaints = Complaint.objects.all()
            
            if complaints.count() < 3:
                return Response(
                    {'error': 'Need at least 3 complaints for clustering'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            complaints_data = [
                {
                    'id': c.id,
                    'title': c.title,
                    'description': c.description
                }
                for c in complaints
            ]
            
            if method == 'bertopic':
                result = clustering_service.cluster_complaints_bertopic(complaints_data)
            else:
                result = clustering_service.cluster_complaints_kmeans(
                    complaints_data, 
                    n_clusters=n_clusters
                )
            
            if 'error' in result:
                return Response(result, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            ComplaintCluster.objects.all().delete()
            ComplaintEmbedding.objects.all().delete()
            
            for cluster_data in result['clusters']:
                cluster = ComplaintCluster.objects.create(
                    cluster_id=cluster_data['cluster_id'],
                    cluster_name=cluster_data['cluster_name'],
                    keywords=cluster_data['keywords'],
                    complaint_count=cluster_data['count']
                )
                
                for comp_data in cluster_data['complaints']:
                    complaint = Complaint.objects.get(id=comp_data['id'])
                    ComplaintEmbedding.objects.create(
                        complaint=complaint,
                        embedding_vector=comp_data.get('embedding', []),
                        cluster=cluster,
                        similarity_score=comp_data.get('probability', comp_data.get('similarity'))
                    )
            
            serializer = ClusteringResultSerializer(result)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error in cluster_complaints: {e}")
            return Response(
                {'error': f'Clustering failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def get_clusters(self, request):
        try:
            clusters = ComplaintCluster.objects.all()
            serializer = ComplaintClusterSerializer(clusters, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error in get_clusters: {e}")
            return Response(
                {'error': 'Failed to fetch clusters'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def heatmap_data(self, request):
        try:
            category = request.query_params.get('category')
            status_filter = request.query_params.get('status')
            
            queryset = Complaint.objects.all()
            
            if category:
                queryset = queryset.filter(category=category)
            if status_filter:
                queryset = queryset.filter(status=status_filter)
            
            heatmap_data = []
            for complaint in queryset:
                heatmap_data.append({
                    'lat': float(complaint.latitude),
                    'lng': float(complaint.longitude),
                    'intensity': 1,
                    'category': complaint.category,
                    'status': complaint.status
                })
            
            return Response({
                'data': heatmap_data,
                'total_points': len(heatmap_data)
            })
            
        except Exception as e:
            logger.error(f"Error in heatmap_data: {e}")
            return Response(
                {'error': 'Failed to fetch heatmap data'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )