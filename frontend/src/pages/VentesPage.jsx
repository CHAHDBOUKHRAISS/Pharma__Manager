/**
 * Page VentesPage.
 *
 * Page de gestion des ventes :
 * - Formulaire de création d'une vente
 * - Historique avec filtrage par statut
 * - Détail d'une vente en modale
 */
import { useState } from 'react';
import { useVentes } from '../hooks/useVentes';
import { useMedicaments } from '../hooks/useMedicaments';
import { createVente, fetchVente } from '../api/ventesApi';
import VenteForm from '../components/ventes/VenteForm';
import VenteList from '../components/ventes/VenteList';
import VenteDetail from '../components/ventes/VenteDetail';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import './Pages.css';

const VentesPage = () => {
    const { ventes, loading, error, loadVentes, cancelVente } = useVentes();
    const { medicaments, loadMedicaments } = useMedicaments();

    const [showForm, setShowForm] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedVente, setSelectedVente] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState(null);
    const [filterStatut, setFilterStatut] = useState('');

    /** Crée une nouvelle vente via le service layer API. */
    const handleCreateVente = async (data) => {
        setFormLoading(true);
        setFormError(null);
        try {
            await createVente(data);
            setShowForm(false);
            loadVentes();
            loadMedicaments();
        } catch (err) {
            const errorData = err.response?.data;
            if (errorData?.error) {
                setFormError(typeof errorData.error === 'string' ? errorData.error : JSON.stringify(errorData.error));
            } else if (errorData) {
                const messages = Object.values(errorData).flat().join(' ');
                setFormError(messages);
            } else {
                setFormError('Erreur lors de la création de la vente.');
            }
        } finally {
            setFormLoading(false);
        }
    };

    /** Annule une vente avec confirmation. */
    const handleCancel = async (id) => {
        if (window.confirm('Voulez-vous vraiment annuler cette vente ?')) {
            await cancelVente(id);
            loadMedicaments();
        }
    };

    /** Ouvre le détail d'une vente dans une modale. */
    const handleViewDetail = async (id) => {
        try {
            const data = await fetchVente(id);
            setSelectedVente(data);
            setShowDetail(true);
        } catch {
            setFormError('Erreur lors du chargement du détail.');
        }
    };

    /** Filtre les ventes par statut. */
    const handleFilterStatut = (statut) => {
        setFilterStatut(statut);
        const params = statut ? { statut } : {};
        loadVentes(params);
    };

    return (
        <div className="page">
            <div className="page-header">
                <h1 className="page-title">Ventes</h1>
                <button
                    className="btn btn-success"
                    onClick={() => {
                        setFormError(null);
                        setShowForm(!showForm);
                    }}
                >
                    {showForm ? 'Fermer le formulaire' : '+ Nouvelle vente'}
                </button>
            </div>

            <ErrorMessage message={error || formError} onClose={() => setFormError(null)} />

            {/* Formulaire de création */}
            {showForm && (
                <div className="vente-form-container">
                    <h2>Nouvelle vente</h2>
                    <VenteForm
                        medicaments={medicaments}
                        onSubmit={handleCreateVente}
                        loading={formLoading}
                    />
                </div>
            )}

            {/* Filtres */}
            <div className="filters-bar">
                <select
                    value={filterStatut}
                    onChange={(e) => handleFilterStatut(e.target.value)}
                >
                    <option value="">Tous les statuts</option>
                    <option value="COMPLETEE">Complétée</option>
                    <option value="ANNULEE">Annulée</option>
                    <option value="EN_COURS">En cours</option>
                </select>
            </div>

            {/* Liste des ventes */}
            {loading ? (
                <LoadingSpinner message="Chargement des ventes..." />
            ) : (
                <VenteList
                    ventes={ventes}
                    onCancel={handleCancel}
                    onView={handleViewDetail}
                />
            )}

            {/* Modale détail */}
            <Modal
                isOpen={showDetail}
                onClose={() => setShowDetail(false)}
                title="Détail de la vente"
            >
                <VenteDetail
                    vente={selectedVente}
                    onClose={() => setShowDetail(false)}
                />
            </Modal>
        </div>
    );
};

export default VentesPage;
