"""
Serializers pour l'application Médicaments.

Gère la sérialisation/désérialisation et la validation
des données de médicaments.
"""

from rest_framework import serializers

from .models import Medicament


class MedicamentSerializer(serializers.ModelSerializer):
    """
    Serializer pour le modèle Medicament.

    Inclut un champ en lecture seule 'est_en_alerte' pour indiquer
    si le stock est inférieur au seuil minimum.
    Valide que le prix de vente est supérieur au prix d'achat
    et que les stocks ne sont pas négatifs.
    """

    est_en_alerte = serializers.BooleanField(read_only=True)
    categorie_nom = serializers.CharField(
        source='categorie.nom',
        read_only=True,
    )

    class Meta:
        model = Medicament
        fields = [
            'id', 'nom', 'dci', 'categorie', 'categorie_nom',
            'forme', 'dosage', 'prix_achat', 'prix_vente',
            'stock_actuel', 'stock_minimum', 'date_expiration',
            'ordonnance_requise', 'date_creation', 'est_actif',
            'est_en_alerte',
        ]
        read_only_fields = ['date_creation']

    def validate_prix_vente(self, value):
        """Valide que le prix de vente est positif."""
        if value <= 0:
            raise serializers.ValidationError(
                "Le prix de vente doit être supérieur à zéro."
            )
        return value

    def validate_prix_achat(self, value):
        """Valide que le prix d'achat est positif."""
        if value <= 0:
            raise serializers.ValidationError(
                "Le prix d'achat doit être supérieur à zéro."
            )
        return value

    def validate(self, data):
        """
        Validation au niveau de l'objet.

        Vérifie que le prix de vente est supérieur au prix d'achat.
        """
        prix_achat = data.get('prix_achat', getattr(self.instance, 'prix_achat', None))
        prix_vente = data.get('prix_vente', getattr(self.instance, 'prix_vente', None))

        if prix_achat is not None and prix_vente is not None:
            if prix_vente <= prix_achat:
                raise serializers.ValidationError({
                    'prix_vente': "Le prix de vente doit être supérieur au prix d'achat."
                })

        return data
