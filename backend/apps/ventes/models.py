"""
Modèles de données pour les ventes.

Gère les transactions de vente de la pharmacie.
Chaque vente peut contenir plusieurs lignes (LigneVente),
chacune référençant un médicament vendu.
"""

from django.db import models


class Vente(models.Model):
    """
    Représente une transaction de vente dans la pharmacie.

    Attributs:
        reference (str): Code unique auto-généré (ex: VNT-2024-0001).
        date_vente (datetime): Horodatage de la transaction.
        total_ttc (Decimal): Montant total calculé automatiquement.
        statut (str): État de la vente (EN_COURS, COMPLETEE, ANNULEE).
        notes (str): Remarques optionnelles sur la vente.
    """

    class StatutChoices(models.TextChoices):
        """Choix possibles pour le statut d'une vente."""
        EN_COURS = 'EN_COURS', 'En cours'
        COMPLETEE = 'COMPLETEE', 'Complétée'
        ANNULEE = 'ANNULEE', 'Annulée'

    reference = models.CharField(
        max_length=20,
        unique=True,
        verbose_name='Référence',
        editable=False,
    )
    date_vente = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Date de vente',
    )
    total_ttc = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        verbose_name='Total TTC',
    )
    statut = models.CharField(
        max_length=10,
        choices=StatutChoices.choices,
        default=StatutChoices.COMPLETEE,
        verbose_name='Statut',
    )
    notes = models.TextField(
        blank=True,
        default='',
        verbose_name='Notes',
    )

    class Meta:
        verbose_name = 'Vente'
        verbose_name_plural = 'Ventes'
        ordering = ['-date_vente']

    def __str__(self):
        return f'{self.reference} — {self.total_ttc}€'

    def save(self, *args, **kwargs):
        """Génère automatiquement la référence si elle n'existe pas."""
        if not self.reference:
            self.reference = self._generate_reference()
        super().save(*args, **kwargs)

    @staticmethod
    def _generate_reference():
        """
        Génère une référence unique au format VNT-YYYY-NNNN.

        Le numéro est incrémenté par rapport à la dernière vente existante.
        """
        from django.utils import timezone

        year = timezone.now().year
        prefix = f'VNT-{year}-'
        last_vente = (
            Vente.objects.filter(reference__startswith=prefix)
            .order_by('-reference')
            .first()
        )
        if last_vente:
            last_number = int(last_vente.reference.split('-')[-1])
            new_number = last_number + 1
        else:
            new_number = 1
        return f'{prefix}{new_number:04d}'


class LigneVente(models.Model):
    """
    Représente une ligne dans une vente (un médicament vendu).

    Attributs:
        vente (FK): Référence vers la vente parente.
        medicament (FK): Référence vers le médicament vendu.
        quantite (int): Nombre d'unités vendues.
        prix_unitaire (Decimal): Snapshot du prix au moment de la vente.
        sous_total (Decimal): Montant calculé = quantité × prix_unitaire.

    Note métier:
        Le prix_unitaire est un snapshot du prix au moment de la vente.
        Il ne change pas même si le prix du médicament est modifié ultérieurement.
    """

    vente = models.ForeignKey(
        Vente,
        on_delete=models.CASCADE,
        related_name='lignes',
        verbose_name='Vente',
    )
    medicament = models.ForeignKey(
        'medicaments.Medicament',
        on_delete=models.PROTECT,
        related_name='lignes_vente',
        verbose_name='Médicament',
    )
    quantite = models.PositiveIntegerField(
        verbose_name='Quantité',
    )
    prix_unitaire = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Prix unitaire',
    )
    sous_total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        verbose_name='Sous-total',
    )

    class Meta:
        verbose_name = 'Ligne de vente'
        verbose_name_plural = 'Lignes de vente'

    def __str__(self):
        return f'{self.medicament.nom} x{self.quantite}'

    def save(self, *args, **kwargs):
        """Calcule automatiquement le sous-total avant la sauvegarde."""
        self.sous_total = self.quantite * self.prix_unitaire
        super().save(*args, **kwargs)
