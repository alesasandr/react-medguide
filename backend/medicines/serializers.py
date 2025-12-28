from rest_framework import serializers
from medicines.models import Medicine


class MedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicine
        fields = ['id', 'name', 'mnn', 'form', 'dosage', 'min_stock', 'stock', 'stock_per_pack', 'diff', 'article', 'qr_payload']
