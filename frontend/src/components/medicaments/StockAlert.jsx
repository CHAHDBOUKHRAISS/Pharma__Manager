/**
 * Composant StockAlert.
 *
 * Affiche un badge d'alerte pour les médicaments
 * dont le stock est inférieur au seuil minimum.
 *
 * @param {Object} props
 * @param {number} props.stockActuel - Stock actuel
 * @param {number} props.stockMinimum - Seuil minimum
 */
import './Medicaments.css';

const StockAlert = ({ stockActuel, stockMinimum }) => {
    if (stockActuel > stockMinimum) {
        return <span className="stock-badge stock-ok">{stockActuel}</span>;
    }

    if (stockActuel === 0) {
        return <span className="stock-badge stock-rupture">Rupture</span>;
    }

    return <span className="stock-badge stock-bas">⚠ {stockActuel}</span>;
};

export default StockAlert;
