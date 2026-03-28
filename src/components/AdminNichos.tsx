import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Save, 
  Search,
  ChevronLeft,
  AlertCircle
} from 'lucide-react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';

interface Nicho {
  id: string;
  nome_nicho: string;
  prompt_inicial: string;
  slug: string;
}

const AdminNichos = ({ onBack }: { onBack: () => void }) => {
  useEffect(() => {
    console.log('AdminNichos component mounted');
  }, []);
  const [nichos, setNichos] = useState<Nicho[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const [editingNicho, setEditingNicho] = useState<Nicho | null>(null);
  const [formData, setFormData] = useState({
    nome_nicho: '',
    prompt_inicial: '',
    slug: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'nichos'), orderBy('nome_nicho'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const nichosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Nicho[];
      setNichos(nichosData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'nichos');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleOpenModal = (nicho?: Nicho) => {
    if (nicho) {
      setEditingNicho(nicho);
      setFormData({
        nome_nicho: nicho.nome_nicho,
        prompt_inicial: nicho.prompt_inicial,
        slug: nicho.slug
      });
    } else {
      setEditingNicho(null);
      setFormData({
        nome_nicho: '',
        prompt_inicial: '',
        slug: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingNicho(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Auto-generate slug if name changes and we're not editing an existing one or slug is empty
      if (name === 'nome_nicho' && (!editingNicho || !prev.slug)) {
        newData.slug = value
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingNicho) {
        await updateDoc(doc(db, 'nichos', editingNicho.id), formData);
      } else {
        await addDoc(collection(db, 'nichos'), formData);
      }
      handleCloseModal();
    } catch (error) {
      handleFirestoreError(error, editingNicho ? OperationType.UPDATE : OperationType.CREATE, `nichos/${editingNicho?.id || ''}`);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteConfirmation(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation) return;
    
    try {
      await deleteDoc(doc(db, 'nichos', deleteConfirmation));
      setDeleteConfirmation(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `nichos/${deleteConfirmation}`);
    }
  };

  const filteredNichos = nichos.filter(n => 
    n.nome_nicho.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Gerenciar Nichos</h1>
              <p className="text-slate-400 text-sm">Adicione, edite ou remova nichos e seus prompts iniciais.</p>
            </div>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-5 h-5" />
            Novo Nicho
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Buscar nichos..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
        </div>

        {/* List */}
        <div className="grid gap-4">
          {loading ? (
            <div className="text-center py-12 text-slate-500">Carregando nichos...</div>
          ) : filteredNichos.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800">
              <AlertCircle className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500">Nenhum nicho encontrado.</p>
            </div>
          ) : (
            filteredNichos.map((nicho) => (
              <motion.div 
                layout
                key={nicho.id}
                className="glass-card p-6 rounded-3xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div className="space-y-1 flex-grow">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{nicho.nome_nicho}</h3>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                      {nicho.slug}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm line-clamp-2 italic">
                    "{nicho.prompt_inicial}"
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button 
                    onClick={() => handleOpenModal(nicho)}
                    className="flex-1 sm:flex-none p-2 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-xl transition-colors flex items-center justify-center gap-2 px-4"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span className="sm:hidden">Editar</span>
                  </button>
                  <button 
                    onClick={() => handleDelete(nicho.id)}
                    className="flex-1 sm:flex-none p-2 bg-slate-800 hover:bg-red-500/10 text-red-400 rounded-xl transition-colors flex items-center justify-center gap-2 px-4"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="sm:hidden">Excluir</span>
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Modal de Exclusão */}
      <AnimatePresence>
        {deleteConfirmation && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmation(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl p-6 text-center space-y-6"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Excluir Nicho?</h3>
                <p className="text-slate-400 text-sm">
                  Esta ação não pode ser desfeita. Todos os dados deste nicho serão removidos.
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteConfirmation(null)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">
                    {editingNicho ? 'Editar Nicho' : 'Novo Nicho'}
                  </h2>
                  <button 
                    onClick={handleCloseModal}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Nome do Nicho</label>
                    <input 
                      required
                      type="text" 
                      name="nome_nicho"
                      value={formData.nome_nicho}
                      onChange={handleInputChange}
                      placeholder="Ex: Advocacia"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Slug</label>
                    <input 
                      required
                      type="text" 
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      placeholder="ex-advocacia"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Prompt Inicial</label>
                    <textarea 
                      required
                      name="prompt_inicial"
                      value={formData.prompt_inicial}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Você é um assistente de IA especializado em..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none text-sm leading-relaxed"
                    />
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button 
                      type="button"
                      onClick={handleCloseModal}
                      className="flex-1 py-3 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 transition-all"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Save className="w-5 h-5" />
                      Salvar
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminNichos;
