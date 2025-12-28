from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from medicines.models import Medicine
from medicines.serializers import MedicineSerializer


class MedicineViewSet(viewsets.ModelViewSet):
    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer

    @action(detail=False, methods=['get'])
    def search(self, request):
        """Поиск лекарств по названию, артикулу или МНН"""
        query = request.query_params.get('q', '').strip()
        
        if not query:
            return Response({'error': 'Параметр поиска не может быть пустым'}, status=status.HTTP_400_BAD_REQUEST)
        
        medicines = Medicine.objects.filter(
            name__icontains=query
        ) | Medicine.objects.filter(
            article__icontains=query
        ) | Medicine.objects.filter(
            mnn__icontains=query
        )
        
        serializer = self.get_serializer(medicines, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_article(self, request):
        """Получить лекарство по артикулу"""
        article = request.query_params.get('article', '').strip().upper()
        
        if not article:
            return Response({'error': 'Артикул не может быть пустым'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            medicine = Medicine.objects.get(article=article)
            serializer = self.get_serializer(medicine)
            return Response(serializer.data)
        except Medicine.DoesNotExist:
            return Response({'error': 'Лекарство не найдено'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def by_qr(self, request):
        """Получить лекарство по QR коду"""
        qr_payload = request.query_params.get('qr', '').strip()
        
        if not qr_payload:
            return Response({'error': 'QR код не может быть пустым'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            medicine = Medicine.objects.get(qr_payload=qr_payload)
            serializer = self.get_serializer(medicine)
            return Response(serializer.data)
        except Medicine.DoesNotExist:
            return Response({'error': 'Лекарство не найдено'}, status=status.HTTP_404_NOT_FOUND)
