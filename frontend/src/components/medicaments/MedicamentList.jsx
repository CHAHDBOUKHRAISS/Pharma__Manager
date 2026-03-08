/**
 * Composant MedicamentList.
 *
 * Affiche la liste des médicaments dans un tableau
 * avec indicateurs de stock et actions (modifier, supprimer).
 *
 * @param {Object} props
 * @param {Array} props.medicaments - Liste des médicaments
 * @param {Function} props.onEdit - Callback pour modifier un médicament
 * @param {Function} props.onDelete - Callback pour supprimer un médicament
 */
import StockAlert from './StockAlert';
import { formatCurrency, formatDate } from '../../utils/formatters';
import './Medicaments.css';

const MedicamentList = ({ medicaments, onEdit, onDelete }) => {
    if (medicaments.length === 0) {
        return (
            <div className="empty-state">
                <p>Aucun médicament trouvé.</p>
            </div>
        );
    }

    return (
        <div className="table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>DCI</th>
                        <th>Catégorie</th>
                        <th>Forme</th>
                        <th>Dosage</th>
                        <th>Prix vente</th>
                        <th>Stock</th>
                        <th>Expiration</th>
                        <th>Ordonnance</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {medicaments.map((med) => (
                        <tr key={med.id} className={med.est_en_alerte ? 'row-alert' : ''}>
                            <td className="td-bold">{med.nom}</td>
                            <td>{med.dci}</td>
                            <td>{med.categorie_nom}</td>
                            <td>{med.forme}</td>
                            <td>{med.dosage}</td>
                            <td>{formatCurrency(med.prix_vente)}</td>
                            <td>
                                <StockAlert
                                    stockActuel={med.stock_actuel}
                                    stockMinimum={med.stock_minimum}
                                />
                            </td>
                            <td>{formatDate(med.date_expiration)}</td>
                            <td>{med.ordonnance_requise ? '✓' : '—'}</td>
                            <td className="td-actions">
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => onEdit(med)}
                                >
                                    Modifier
                                </button>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => onDelete(med.id)}
                                >
                                    Supprimer
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MedicamentList;
