from rest_framework import serializers
from chat.models import Profile, IssuedMedicine
from medicines.models import Medicine


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['id', 'user', 'full_name', 'is_staff', 'is_doctor', 'avatar_url', 'specialty', 'work_location', 'employee_id']


class MedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicine
        fields = ['id', 'name', 'mnn', 'form', 'dosage', 'article', 'qr_payload']


class IssuedMedicineSerializer(serializers.ModelSerializer):
    medicine = MedicineSerializer(read_only=True)
    medicine_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = IssuedMedicine
        fields = ['id', 'medicine', 'medicine_id', 'quantity', 'issued_at']
        read_only_fields = ['id', 'issued_at']
