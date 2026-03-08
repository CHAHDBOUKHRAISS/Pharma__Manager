"""
Serializers pour l'application Ventes.

Gère la sérialisation des ventes et leurs lignes,
avec support de l'écriture nested (création de vente + lignes en une requête).
"""

from rest_framework import serializers

from apps.medicaments.serializers import MedicamentSerializer

from .models import LigneVente, Vente


class LigneVenteSerializer(serializers.ModelSerializer):
    """
    Serializer pour une ligne de vente.

    En lecture : affiche les détails du médicament.
    En écriture : accepte uniquement l'ID du médicament et la quantité.
    Le prix_unitaire et le sous_total sont calculés automatiquement.
    """

    medicament_detail = MedicamentSerializer(source='medicament', read_only=True)

    class Meta:
        model = LigneVente
        fields = [
            'id', 'medicament', 'medicament_detail',
            'quantite', 'prix_unitaire', 'sous_total',
        ]
        read_only_fields = ['prix_unitaire', 'sous_total']

    def validate_quantite(self, value):
        """Valide que la quantité est strictement positive."""
        if value <= 0:
            raise serializers.ValidationError(
                "La quantité doit être supérieure à zéro."
            )
        return value


class VenteSerializer(serializers.ModelSerializer):
    """
    Serializer pour le modèle Vente avec écriture nested.

    En lecture : affiche la vente avec toutes ses lignes et détails médicaments.
    En écriture : accepte une liste de lignes pour créer la vente complète.

    La création utilise le service layer (vente_service.create_sale)
    pour garantir l'atomicité et la cohérence du stock.
    """

    lignes = LigneVenteSerializer(many=True)

    class Meta:
        model = Vente
        fields = [
            'id', 'reference', 'date_vente', 'total_ttc',
            'statut', 'notes', 'lignes',
        ]
        read_only_fields = ['reference', 'date_vente', 'total_ttc', 'statut']

    def validate_lignes(self, value):
        """Valide qu'il y a au moins une ligne dans la vente."""
        if not value:
            raise serializers.ValidationError(
                "Une vente doit contenir au moins une ligne."
            )
        return value

    def create(self, validated_data):
        """
        Délègue la création au service layer pour respecter la séparation
        des responsabilités et l'atomicité des transactions.
        """
        from apps.services.vente_service import create_sale

        return create_sale(validated_data)


class VenteListSerializer(serializers.ModelSerializer):
    """
    Serializer allégé pour la liste des ventes (sans le détail des lignes).

    Utilisé pour les performances sur l'endpoint de liste.
    """

    nombre_articles = serializers.SerializerMethodField()

    class Meta:
        model = Vente
        fields = [
            'id', 'reference', 'date_vente', 'total_ttc',
            'statut', 'notes', 'nombre_articles',
        ]

    def get_nombre_articles(self, obj):
        """Retourne le nombre de lignes dans la vente."""
        return obj.lignes.count()
