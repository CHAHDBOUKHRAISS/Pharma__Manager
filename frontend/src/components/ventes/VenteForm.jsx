/**
 * Composant VenteForm.
 *
 * Formulaire de création d'une vente avec sélection multiple
 * de médicaments et quantités. Ne fait pas d'appel API directement.
 *
 * @param {Object} props
 * @param {Array} props.medicaments - Médicaments disponibles
 * @param {Function} props.onSubmit - Callback avec les données de la vente
 * @param {boolean} props.loading - État de chargement
 */
import { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';
import './Ventes.css';

const VenteForm = ({ medicaments, onSubmit, loading }) => {
    const [lignes, setLignes] = useState([{ medicament: '', quantite: 1 }]);
    const [notes, setNotes] = useState('');

    /** Ajoute une nouvelle ligne vide au formulaire. */
    const addLigne = () => {
        setLignes([...lignes, { medicament: '', quantite: 1 }]);
    };

    /** Supprime une ligne du formulaire par index. */
    const removeLigne = (index) => {
        if (lignes.length > 1) {
            setLignes(lignes.filter((_, i) => i !== index));
        }
    };

    /** Met à jour une ligne spécifique. */
    const updateLigne = (index, field, value) => {
        const updated = [...lignes];
        updated[index] = { ...updated[index], [field]: value };
        setLignes(updated);
    };

    /** Calcule le total estimé de la vente. */
    const getTotal = () => {
        return lignes.reduce((total, ligne) => {
            const med = medicaments.find((m) => m.id === Number(ligne.medicament));
            if (med) {
                return total + med.prix_vente * ligne.quantite;
            }
            return total;
        }, 0);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const venteData = {
            notes,
            lignes: lignes
                .filter((l) => l.medicament)
                .map((l) => ({
                    medicament: Number(l.medicament),
                    quantite: Number(l.quantite),
                })),
        };
        onSubmit(venteData);
    };

    return (
        <form onSubmit={handleSubmit} className="vente-form">
            <h3>Articles</h3>

            {lignes.map((ligne, index) => {
                const med = medicaments.find((m) => m.id === Number(ligne.medicament));
                return (
                    <div key={index} className="vente-ligne">
                        <div className="form-group ligne-medicament">
                            <label>Médicament *</label>
                            <select
                                value={ligne.medicament}
                                onChange={(e) => updateLigne(index, 'medicament', e.target.value)}
                                required
                            >
                                <option value="">Sélectionner...</option>
                                {medicaments.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.nom} — {formatCurrency(m.prix_vente)} (stock: {m.stock_actuel})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group ligne-quantite">
                            <label>Quantité *</label>
                            <input
                                type="number"
                                min="1"
                                max={med ? med.stock_actuel : 9999}
                                value={ligne.quantite}
                                onChange={(e) => updateLigne(index, 'quantite', e.target.value)}
                                required
                            />
                        </div>

                        <div className="ligne-sous-total">
                            {med ? formatCurrency(med.prix_vente * ligne.quantite) : '—'}
                        </div>

                        <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => removeLigne(index)}
                            disabled={lignes.length === 1}
                        >
                            ✕
                        </button>
                    </div>
                );
            })}

            <button type="button" className="btn btn-secondary" onClick={addLigne}>
                + Ajouter un article
            </button>

            <div className="form-group" style={{ marginTop: '1rem' }}>
                <label htmlFor="notes">Notes (optionnel)</label>
                <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Remarques sur la vente..."
                />
            </div>

            <div className="vente-total">
                <span>Total estimé :</span>
                <strong>{formatCurrency(getTotal())}</strong>
            </div>

            <div className="form-actions">
                <button type="submit" className="btn btn-success" disabled={loading}>
                    {loading ? 'Enregistrement...' : 'Enregistrer la vente'}
                </button>
            </div>
        </form>
    );
};

export default VenteForm;
