/**
 * Composant MedicamentForm.
 *
 * Formulaire de création/modification d'un médicament.
 * Utilisé dans une modale, ne fait pas d'appel API directement.
 *
 * @param {Object} props
 * @param {Object|null} props.medicament - Médicament à modifier (null = création)
 * @param {Array} props.categories - Liste des catégories disponibles
 * @param {Function} props.onSubmit - Callback avec les données du formulaire
 * @param {Function} props.onCancel - Callback d'annulation
 * @param {boolean} props.loading - État de chargement
 */
import { useState, useEffect } from 'react';
import './Medicaments.css';

const MedicamentForm = ({ medicament, categories, onSubmit, onCancel, loading }) => {
    const [formData, setFormData] = useState({
        nom: '',
        dci: '',
        categorie: '',
        forme: '',
        dosage: '',
        prix_achat: '',
        prix_vente: '',
        stock_actuel: '',
        stock_minimum: '10',
        date_expiration: '',
        ordonnance_requise: false,
    });

    useEffect(() => {
        if (medicament) {
            setFormData({
                nom: medicament.nom || '',
                dci: medicament.dci || '',
                categorie: medicament.categorie || '',
                forme: medicament.forme || '',
                dosage: medicament.dosage || '',
                prix_achat: medicament.prix_achat || '',
                prix_vente: medicament.prix_vente || '',
                stock_actuel: medicament.stock_actuel ?? '',
                stock_minimum: medicament.stock_minimum ?? '10',
                date_expiration: medicament.date_expiration || '',
                ordonnance_requise: medicament.ordonnance_requise || false,
            });
        }
    }, [medicament]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            categorie: Number(formData.categorie),
            prix_achat: formData.prix_achat,
            prix_vente: formData.prix_vente,
            stock_actuel: Number(formData.stock_actuel),
            stock_minimum: Number(formData.stock_minimum),
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="nom">Nom commercial *</label>
                    <input
                        id="nom"
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="dci">DCI</label>
                    <input
                        id="dci"
                        name="dci"
                        value={formData.dci}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="categorie">Catégorie *</label>
                    <select
                        id="categorie"
                        name="categorie"
                        value={formData.categorie}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Sélectionner...</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.nom}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="forme">Forme galénique</label>
                    <select id="forme" name="forme" value={formData.forme} onChange={handleChange}>
                        <option value="">Sélectionner...</option>
                        <option value="Comprimé">Comprimé</option>
                        <option value="Sirop">Sirop</option>
                        <option value="Injection">Injection</option>
                        <option value="Pommade">Pommade</option>
                        <option value="Gélule">Gélule</option>
                        <option value="Suppositoire">Suppositoire</option>
                    </select>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="dosage">Dosage</label>
                    <input
                        id="dosage"
                        name="dosage"
                        value={formData.dosage}
                        onChange={handleChange}
                        placeholder="Ex: 500mg"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="date_expiration">Date d'expiration *</label>
                    <input
                        id="date_expiration"
                        name="date_expiration"
                        type="date"
                        value={formData.date_expiration}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="prix_achat">Prix d'achat (€) *</label>
                    <input
                        id="prix_achat"
                        name="prix_achat"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.prix_achat}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="prix_vente">Prix de vente (€) *</label>
                    <input
                        id="prix_vente"
                        name="prix_vente"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.prix_vente}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="stock_actuel">Stock actuel *</label>
                    <input
                        id="stock_actuel"
                        name="stock_actuel"
                        type="number"
                        min="0"
                        value={formData.stock_actuel}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="stock_minimum">Stock minimum *</label>
                    <input
                        id="stock_minimum"
                        name="stock_minimum"
                        type="number"
                        min="0"
                        value={formData.stock_minimum}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div className="form-group">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        name="ordonnance_requise"
                        checked={formData.ordonnance_requise}
                        onChange={handleChange}
                    />
                    Ordonnance requise
                </label>
            </div>

            <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={onCancel}>
                    Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Enregistrement...' : medicament ? 'Modifier' : 'Ajouter'}
                </button>
            </div>
        </form>
    );
};

export default MedicamentForm;
