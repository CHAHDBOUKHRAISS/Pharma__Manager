/**
 * Composant VenteDetail.
 *
 * Affiche le détail complet d'une vente avec toutes ses lignes.
 *
 * @param {Object} props
 * @param {Object} props.vente - Détail de la vente
 * @param {Function} props.onClose - Callback pour fermer
 */
import { formatCurrency, formatDateTime, getStatutLabel, getStatutClass } from '../../utils/formatters';
import './Ventes.css';

const VenteDetail = ({ vente, onClose }) => {
    if (!vente) return null;

    return (
        <div className="vente-detail">
            <div className="vente-detail-header">
                <div>
                    <h3>{vente.reference}</h3>
                    <p className="vente-detail-date">{formatDateTime(vente.date_vente)}</p>
                </div>
                <span className={`statut-badge ${getStatutClass(vente.statut)}`}>
                    {getStatutLabel(vente.statut)}
                </span>
            </div>

            {vente.notes && (
                <div className="vente-detail-notes">
                    <strong>Notes :</strong> {vente.notes}
                </div>
            )}

            <table className="data-table detail-table">
                <thead>
                    <tr>
                        <th>Médicament</th>
                        <th>Quantité</th>
                        <th>Prix unitaire</th>
                        <th>Sous-total</th>
                    </tr>
                </thead>
                <tbody>
                    {vente.lignes?.map((ligne) => (
                        <tr key={ligne.id}>
                            <td className="td-bold">
                                {ligne.medicament_detail?.nom || `Médicament #${ligne.medicament}`}
                            </td>
                            <td>{ligne.quantite}</td>
                            <td>{formatCurrency(ligne.prix_unitaire)}</td>
                            <td>{formatCurrency(ligne.sous_total)}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={3} className="td-bold" style={{ textAlign: 'right' }}>
                            Total TTC :
                        </td>
                        <td className="td-bold">{formatCurrency(vente.total_ttc)}</td>
                    </tr>
                </tfoot>
            </table>

            <div className="form-actions">
                <button className="btn btn-secondary" onClick={onClose}>
                    Fermer
                </button>
            </div>
        </div>
    );
};

export default VenteDetail;
