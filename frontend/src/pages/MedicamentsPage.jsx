/**
 * Page MedicamentsPage.
 *
 * Page principale de gestion des médicaments :
 * - Liste avec filtres et recherche
 * - Formulaire d'ajout/modification en modale
 * - Indicateurs de stock bas
 */
import { useState } from 'react';
import { useMedicaments } from '../hooks/useMedicaments';
import { useCategories } from '../hooks/useCategories';
import { createMedicament, updateMedicament } from '../api/medicamentsApi';
import MedicamentList from '../components/medicaments/MedicamentList';
import MedicamentForm from '../components/medicaments/MedicamentForm';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import './Pages.css';

const MedicamentsPage = () => {
    const { medicaments, loading, error, loadMedicaments, removeMedicament } = useMedicaments();
    const { categories } = useCategories();

    const [showModal, setShowModal] = useState(false);
    const [editMedicament, setEditMedicament] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategorie, setFilterCategorie] = useState('');

    /** Ouvre la modale en mode création. */
    const handleAdd = () => {
        setEditMedicament(null);
        setFormError(null);
        setShowModal(true);
    };

    /** Ouvre la modale en mode édition. */
    const handleEdit = (med) => {
        setEditMedicament(med);
        setFormError(null);
        setShowModal(true);
    };

    /** Soumet le formulaire (création ou modification). */
    const handleSubmit = async (data) => {
        setFormLoading(true);
        setFormError(null);
        try {
            if (editMedicament) {
                await updateMedicament(editMedicament.id, data);
            } else {
                await createMedicament(data);
            }
            setShowModal(false);
            loadMedicaments();
        } catch (err) {
            const errorData = err.response?.data;
            if (errorData) {
                const messages = Object.values(errorData).flat().join(' ');
                setFormError(messages);
            } else {
                setFormError('Erreur lors de l\'enregistrement.');
            }
        } finally {
            setFormLoading(false);
        }
    };

    /** Supprime un médicament avec confirmation. */
    const handleDelete = async (id) => {
        if (window.confirm('Voulez-vous vraiment supprimer ce médicament ?')) {
            await removeMedicament(id);
        }
    };

    /** Applique les filtres de recherche. */
    const handleSearch = () => {
        const params = {};
        if (searchTerm) params.search = searchTerm;
        if (filterCategorie) params.categorie = filterCategorie;
        loadMedicaments(params);
    };

    /** Réinitialise les filtres. */
    const handleReset = () => {
        setSearchTerm('');
        setFilterCategorie('');
        loadMedicaments();
    };

    return (
        <div className="page">
            <div className="page-header">
                <h1 className="page-title">Médicaments</h1>
                <button className="btn btn-primary" onClick={handleAdd}>
                    + Ajouter un médicament
                </button>
            </div>

            <ErrorMessage message={error} />

            {/* Barre de filtres */}
            <div className="filters-bar">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Rechercher par nom ou DCI..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <select
                    value={filterCategorie}
                    onChange={(e) => setFilterCategorie(e.target.value)}
                >
                    <option value="">Toutes les catégories</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.nom}
                        </option>
                    ))}
                </select>
                <button className="btn btn-primary" onClick={handleSearch}>
                    Rechercher
                </button>
                <button className="btn btn-secondary" onClick={handleReset}>
                    Réinitialiser
                </button>
            </div>

            {/* Liste ou spinner */}
            {loading ? (
                <LoadingSpinner message="Chargement des médicaments..." />
            ) : (
                <MedicamentList
                    medicaments={medicaments}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            {/* Modale formulaire */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editMedicament ? 'Modifier le médicament' : 'Ajouter un médicament'}
            >
                <ErrorMessage message={formError} onClose={() => setFormError(null)} />
                <MedicamentForm
                    medicament={editMedicament}
                    categories={categories}
                    onSubmit={handleSubmit}
                    onCancel={() => setShowModal(false)}
                    loading={formLoading}
                />
            </Modal>
        </div>
    );
};

export default MedicamentsPage;
