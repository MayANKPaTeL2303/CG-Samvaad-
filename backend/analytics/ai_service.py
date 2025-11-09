# Pipelines for clustering citizen complaints
from sentence_transformers import SentenceTransformer
from bertopic import BERTopic
from sklearn.cluster import KMeans
import numpy as np
from typing import List, Dict, Tuple
import logging

logger = logging.getLogger(__name__)


class ComplaintClusteringService:
    def __init__(self):
        self.model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
        self.bertopic_model = None
    
    def generate_embeddings(self, texts: List[str]) -> np.ndarray:
        try:
            embeddings = self.model.encode(texts, show_progress_bar=False)
            return embeddings
        except Exception as e:
            logger.error(f"Error generating embeddings: {e}")
            return np.array([])
    
    def cluster_complaints_kmeans(self, complaints_data: List[Dict], n_clusters: int = 5) -> Dict:
        try:
            texts = [f"{c['title']}. {c['description']}" for c in complaints_data]
            
            if len(texts) < n_clusters:
                n_clusters = max(1, len(texts) // 2)
            
            embeddings = self.generate_embeddings(texts)
            
            if embeddings.size == 0:
                return {'error': 'Failed to generate embeddings'}
            
            kmeans = KMeans(n_clusters=n_clusters, random_state=42)
            cluster_labels = kmeans.fit_predict(embeddings)
            
            clusters = {}
            for idx, label in enumerate(cluster_labels):
                label = int(label)
                if label not in clusters:
                    clusters[label] = {
                        'cluster_id': label,
                        'complaints': [],
                        'count': 0
                    }
                clusters[label]['complaints'].append({
                    'id': complaints_data[idx]['id'],
                    'title': complaints_data[idx]['title'],
                    'embedding': embeddings[idx].tolist()
                })
                clusters[label]['count'] += 1
            
            for cluster_id, cluster_data in clusters.items():
                cluster_texts = [c['title'] for c in cluster_data['complaints']]
                keywords = self._extract_keywords(cluster_texts)
                clusters[cluster_id]['keywords'] = keywords
                clusters[cluster_id]['cluster_name'] = self._generate_cluster_name(keywords)
            
            return {
                'clusters': list(clusters.values()),
                'total_clusters': len(clusters),
                'total_complaints': len(complaints_data)
            }
            
        except Exception as e:
            logger.error(f"Error in KMeans clustering: {e}")
            return {'error': str(e)}
    
    def cluster_complaints_bertopic(self, complaints_data: List[Dict]) -> Dict:
        try:
            texts = [f"{c['title']}. {c['description']}" for c in complaints_data]
            
            if len(texts) < 5:
                return self.cluster_complaints_kmeans(complaints_data, n_clusters=2)
            
            self.bertopic_model = BERTopic(
                language='multilingual',
                calculate_probabilities=True,
                verbose=False,
                min_topic_size=2
            )
            
            topics, probs = self.bertopic_model.fit_transform(texts)
            
            topic_info = self.bertopic_model.get_topic_info()
            
            clusters = {}
            for idx, (topic_id, prob) in enumerate(zip(topics, probs)):
                if topic_id == -1: 
                    continue
                    
                if topic_id not in clusters:
                    topic_words = self.bertopic_model.get_topic(topic_id)
                    keywords = [word for word, _ in topic_words[:5]] if topic_words else []
                    
                    clusters[topic_id] = {
                        'cluster_id': topic_id,
                        'complaints': [],
                        'count': 0,
                        'keywords': keywords,
                        'cluster_name': self._generate_cluster_name(keywords)
                    }
                
                clusters[topic_id]['complaints'].append({
                    'id': complaints_data[idx]['id'],
                    'title': complaints_data[idx]['title'],
                    'probability': float(prob)
                })
                clusters[topic_id]['count'] += 1
            
            return {
                'clusters': list(clusters.values()),
                'total_clusters': len(clusters),
                'total_complaints': len([t for t in topics if t != -1]),
                'outliers': sum(1 for t in topics if t == -1)
            }
            
        except Exception as e:
            logger.error(f"Error in BERTopic clustering: {e}")
            return self.cluster_complaints_kmeans(complaints_data)
    
    def _extract_keywords(self, texts: List[str], top_n: int = 5) -> List[str]:
        """Extract top keywords from texts"""
        from collections import Counter
        import re
        
        words = []
        for text in texts:
            clean_text = re.sub(r'[^\w\s]', '', text.lower())
            words.extend(clean_text.split())
        
        # Remove stop words 
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
                     'है', 'का', 'की', 'के', 'में', 'से', 'को', 'और', 'हे', 'ह'}
        words = [w for w in words if w not in stop_words and len(w) > 2]
        
        counter = Counter(words)
        keywords = [word for word, _ in counter.most_common(top_n)]
        
        return keywords
    
    def _generate_cluster_name(self, keywords: List[str]) -> str:
        if not keywords:
            return "Miscellaneous Issues"
        
        # Map common keywords
        keyword_mapping = {
            'water': 'Water Supply Issues',
            'road': 'Road Problems',
            'electricity': 'Power Supply Issues',
            'garbage': 'Waste Management',
            'drainage': 'Drainage Problems',
            'street': 'Street Issues',
            'light': 'Street Lighting',
            'sanitation': 'Sanitation Issues'
        }
        
        for keyword in keywords:
            if keyword in keyword_mapping:
                return keyword_mapping[keyword]
        
        return f"{keywords[0].capitalize()} Related Issues"
    
    def find_similar_complaints(self, complaint_text: str, all_complaints: List[Dict], 
                               top_k: int = 5) -> List[Dict]:
        try:
            query_embedding = self.generate_embeddings([complaint_text])[0]
            
            similarities = []
            for comp in all_complaints:
                if 'embedding' in comp:
                    comp_embedding = np.array(comp['embedding'])
                    similarity = np.dot(query_embedding, comp_embedding) / (
                        np.linalg.norm(query_embedding) * np.linalg.norm(comp_embedding)
                    )
                    similarities.append({
                        'id': comp['id'],
                        'title': comp['title'],
                        'similarity': float(similarity)
                    })
            
            similarities.sort(key=lambda x: x['similarity'], reverse=True)
            
            return similarities[:top_k]
            
        except Exception as e:
            logger.error(f"Error finding similar complaints: {e}")
            return []


clustering_service = ComplaintClusteringService()