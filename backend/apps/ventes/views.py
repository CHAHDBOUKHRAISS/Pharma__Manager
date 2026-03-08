"""
ViewSet pour la gestion des ventes.

Fournit les opérations de consultation et de création des ventes,
ainsi que l'annulation avec réintégration du stock.
"""

from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import (
    OpenApiResponse,
    extend_schema,
    extend_schema_view,
)
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter
from rest_framework.response import Response

from apps.services.vente_service import cancel_sale

from .models import Vente
from .serializers import VenteListSerializer, VenteSerializer


@extend_schema_view(
    list=extend_schema(
        tags=['Ventes'],
        summary='Historique des ventes',
        description=(
            'Retourne une liste paginée de l\'historique des ventes '
            'avec filtrage par statut et date.'
        ),
    ),
    retrieve=extend_schema(
        tags=['Ventes'],
        summary='Détail d\'une vente',
        description='Retourne les détails complets d\'une vente avec toutes ses lignes.',
    ),
    create=extend_schema(
        tags=['Ventes'],
        summary='Enregistrer une vente',
        description=(
            'Crée une nouvelle vente avec ses lignes. '
            'Le stock est automatiquement déduit pour chaque médicament. '
            'Le total TTC est calculé automatiquement. '
            'Opération atomique : si une ligne échoue, tout est annulé.'
        ),
        responses={
            201: VenteSerializer,
            400: OpenApiResponse(description='Données invalides'),
            422: OpenApiResponse(description='Stock insuffisant'),
        },
    ),
)
class VenteViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les opérations sur les ventes.

    Endpoints:
        GET    /api/v1/ventes/                — Historique paginé des ventes
        POST   /api/v1/ventes/                — Enregistrer une nouvelle vente
        GET    /api/v1/ventes/{id}/           — Détail d'une vente
        POST   /api/v1/ventes/{id}/annuler/   — Annuler une vente

    Filtrage:
        ?statut=COMPLETEE/ANNULEE  — Filtrer par statut
        ?ordering=-date_vente      — Tri par date
    """

    http_method_names = ['get', 'post', 'head', 'options']
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['statut']
    ordering_fields = ['date_vente', 'total_ttc']

    def get_queryset(self):
        """Retourne toutes les ventes avec leurs lignes préchargées."""
        return Vente.objects.prefetch_related(
            'lignes', 'lignes__medicament', 'lignes__medicament__categorie'
        )

    def get_serializer_class(self):
        """Utilise un serializer allégé pour la liste, détaillé pour le reste."""
        if self.action == 'list':
            return VenteListSerializer
        return VenteSerializer

    @extend_schema(
        tags=['Ventes'],
        summary='Annuler une vente',
        description=(
            'Annule une vente et réintègre les quantités vendues dans le stock. '
            'Opération atomique. Échoue si la vente est déjà annulée.'
        ),
        request=None,
        responses={
            200: VenteSerializer,
            400: OpenApiResponse(description='La vente est déjà annulée'),
            404: OpenApiResponse(description='Vente non trouvée'),
        },
    )
    @action(detail=True, methods=['post'], url_path='annuler')
    def annuler(self, request, pk=None):
        """
        Annule une vente et réintègre le stock.

        Utilise le service layer (cancel_sale) pour garantir
        l'atomicité et la réintégration correcte du stock.
        """
        vente = self.get_object()
        vente = cancel_sale(vente)
        serializer = VenteSerializer(vente)
        return Response(serializer.data, status=status.HTTP_200_OK)
