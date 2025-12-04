from django.db import models

class Medicine(models.Model):
    name = models.CharField(max_length=255)
    mnn = models.CharField(max_length=255)
    form = models.CharField(max_length=255)
    dosage = models.CharField(max_length=255)
    min_stock = models.IntegerField()
    stock = models.IntegerField()
    stock_per_pack = models.IntegerField()
    diff = models.IntegerField()
    article = models.CharField(max_length=20, unique=True)
    qr_payload = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return f"{self.name} ({self.article})"
