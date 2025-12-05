from rest_framework import serializers
from chat.models import Profile, IssuedMedicine
from medicines.models import Medicine


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['id', 'user', 'full_name', 'is_staff', 'is_doctor', 'avatar_url', 'specialty', 'work_location', 'employee_id']
        read_only_fields = ['id', 'user', 'is_staff', 'is_doctor', 'employee_id']  # Эти поля нельзя изменять через API
    
    def validate_avatar_url(self, value):
        """Валидация avatar_url - принимаем только URL или null, не локальные пути"""
        if value and not (value.startswith('http://') or value.startswith('https://')):
            # Если это не URL, возвращаем null (локальные пути не сохраняем на сервере)
            return None
        return value


class MedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicine
        fields = ['id', 'name', 'mnn', 'form', 'dosage', 'article', 'qr_payload']


class IssuedMedicineSerializer(serializers.ModelSerializer):
    medicine = MedicineSerializer(read_only=True)
    medicine_id = serializers.IntegerField(write_only=True)
    doctor_name = serializers.CharField(source='doctor.full_name', read_only=True)
    doctor_id = serializers.CharField(source='doctor.employee_id', read_only=True)

    class Meta:
        model = IssuedMedicine
        fields = ['id', 'medicine', 'medicine_id', 'quantity', 'issued_at', 'doctor_name', 'doctor_id']
        read_only_fields = ['id', 'issued_at', 'doctor_name', 'doctor_id']

    def create(self, validated_data):
        """Создает запись о выданном препарате с правильной связью с Medicine"""
        medicine_id = validated_data.pop('medicine_id', None)
        if medicine_id:
            from medicines.models import Medicine
            try:
                medicine = Medicine.objects.get(id=medicine_id)
                validated_data['medicine'] = medicine
            except Medicine.DoesNotExist:
                raise serializers.ValidationError({'medicine_id': 'Препарат не найден'})
        return super().create(validated_data)