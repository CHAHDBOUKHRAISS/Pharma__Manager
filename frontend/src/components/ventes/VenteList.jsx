/**
 * Composant VenteList.
 *
 * Affiche l'historique des ventes dans un tableau
 * avec statut, total et action d'annulation.
 *
 * @param {Object} props
 * @param {Array} props.ventes - Liste des ventes
 * @param {Function} props.onCancel - Callback pour annuler une vente
 * @param {Function} props.onView - Callback pour voir le détail
 */
import { formatCurrency, formatDateTime, getStatutLabel, getStatutClass } from '../../utils/formatters';
import './Ventes.css';

const VenteList = ({ ventes, onCancel, onView }) => {
    if (ventes.length === 0) {
        return (
            <div className="empty-state">
                <p>Aucune vente enregistrée.</p>
            </div>
        );
    }

    return (
        <div className="table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Référence</th>
                        <th>Date</th>
                        <th>Total TTC</th>
                        <th>Statut</th>
                        <th>Articles</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {ventes.map((vente) => (
                        <tr key={vente.id}>
                            <td className="td-bold">{vente.reference}</td>
                            <td>{formatDateTime(vente.date_vente)}</td>
                            <td>{formatCurrency(vente.total_ttc)}</td>
                            <td>
                                <span className={`statut-badge ${getStatutClass(vente.statut)}`}>
                                    {getStatutLabel(vente.statut)}
                                </span>
                            </td>
                            <td>{vente.nombre_articles || '—'}</td>
                            <td className="td-actions">
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => onView(vente.id)}
                                >
                                    Détail
                                </button>
                                {vente.statut !== 'ANNULEE' && (
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => onCancel(vente.id)}
                                    >
                                        Annuler
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default VenteList;
