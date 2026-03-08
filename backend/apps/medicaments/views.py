"""
ViewSet pour la gestion des médicaments.

Fournit les opérations CRUD, filtrage, recherche,
et un endpoint d'alertes de stock bas.
"""

from drf_spectacular.utils import (
    OpenApiResponse,
    extend_schema,
    extend_schema_view,
)
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Medicament
from .serializers import MedicamentSerializer


@extend_schema_view(
    list=extend_schema(
        tags=['Médicaments'],
        summary='Liste des médicaments actifs',
        description=(
            'Retourne une liste paginée des médicaments actifs '
            'avec filtrage par catégorie, forme, ordonnance et recherche par nom/DCI.'
        ),
    ),
    retrieve=extend_schema(
        tags=['Médicaments'],
        summary='Détail d\'un médicament',
        description='Retourne les informations détaillées d\'un médicament.',
    ),
    create=extend_schema(
        tags=['Médicaments'],
        summary='Créer un médicament',
        description='Ajoute un nouveau médicament au catalogue.',
        responses={
            201: MedicamentSerializer,
            400: OpenApiResponse(description='Données invalides'),
        },
    ),
    update=extend_schema(
        tags=['Médicaments'],
        summary='Modifier un médicament',
        description='Modifie complètement les informations d\'un médicament.',
    ),
    partial_update=extend_schema(
        tags=['Médicaments'],
        summary='Modifier partiellement un médicament',
        description='Modifie partiellement les informations d\'un médicament.',
    ),
    destroy=extend_schema(
        tags=['Médicaments'],
        summary='Supprimer un médicament (soft delete)',
        description='Désactive un médicament (soft delete). Le médicament reste en base.',
        responses={
            204: OpenApiResponse(description='Médicament désactivé avec succès'),
        },
    ),
)
class MedicamentViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les opérations CRUD sur les médicaments.

    Endpoints:
        GET    /api/v1/medicaments/              — Liste paginée (filtrée, recherchée)
        POST   /api/v1/medicaments/              — Créer un médicament
        GET    /api/v1/medicaments/{id}/          — Détail d'un médicament
        PUT    /api/v1/medicaments/{id}/          — Modifier un médicament
        PATCH  /api/v1/medicaments/{id}/          — Modification partielle
        DELETE /api/v1/medicaments/{id}/          — Soft delete (est_actif=False)
        GET    /api/v1/medicaments/alertes/       — Médicaments sous stock minimum

    Filtrage:
        ?categorie=ID  — Filtrer par catégorie
        ?forme=...     — Filtrer par forme galénique
        ?ordonnance_requise=true/false
        ?search=...    — Recherche par nom ou DCI
    """

    serializer_class = MedicamentSerializer
    filterset_fields = ['categorie', 'forme', 'ordonnance_requise']
    search_fields = ['nom', 'dci']
    ordering_fields = ['nom', 'prix_vente', 'stock_actuel', 'date_creation']

    def get_queryset(self):
        """Retourne uniquement les médicaments actifs."""
        return Medicament.objects.filter(est_actif=True).select_related('categorie')

    def perform_destroy(self, instance):
        """
        Soft delete : désactive le médicament au lieu de le supprimer.

        Met est_actif à False plutôt que de supprimer l'enregistrement.
        """
        instance.est_actif = False
        instance.save(update_fields=['est_actif'])

    @extend_schema(
        tags=['Médicaments'],
        summary='Alertes de stock bas',
        description=(
            'Retourne la liste des médicaments actifs dont le stock actuel '
            'est inférieur ou égal au stock minimum.'
        ),
        responses={200: MedicamentSerializer(many=True)},
    )
    @action(detail=False, methods=['get'], url_path='alertes')
    def alertes(self, request):
        """
        Retourne les médicaments dont le stock est sous le seuil minimum.

        Un médicament est en alerte quand stock_actuel <= stock_minimum.
        """
        from django.db.models import F

        medicaments_en_alerte = self.get_queryset().filter(
            stock_actuel__lte=F('stock_minimum')
        )
        serializer = self.get_serializer(medicaments_en_alerte, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
