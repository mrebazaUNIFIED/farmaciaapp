// pages/Categorias.tsx - Ejemplo con hooks
'use client';

import React, { useState } from 'react';
import PageBreadcrumb from '../common/PageBreadCrumb';
import ComponentCard from '../common/ComponentCard';
import DynamicTable, { ColumnDef } from '../tables/DynamicTable';
import Badge from '../ui/badge/Badge';
import { useCategorias } from '@/hooks/useCategorias';
import { Categoria } from '@/interfaces';
import { Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner'; 
import { Modal } from "@/components/ui/modal/index"; 

export default function Categorias() {
  const {
    categorias,
    isLoading,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    toggleCategoriaStatus,
  } = useCategorias();

  const [showModal, setShowModal] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);

  // Manejar edición
  const handleEdit = (categoria: Categoria) => {
    setEditingCategoria(categoria);
    setShowModal(true);
  };

  // Manejar eliminación
  const handleDelete = async (categoria: Categoria) => {
    if (window.confirm(`¿Estás seguro de eliminar la categoría "${categoria.nombre}"?`)) {
      try {
        await deleteCategoria.mutateAsync(categoria.id);
        toast.success('Categoría eliminada correctamente');
      } catch (error) {
        console.error('Error al eliminar:', error);
        toast.error('No se pudo eliminar la categoría');
      }
    }
  };

  // Manejar cambio de estado
  const handleToggleStatus = async (categoria: Categoria) => {
    try {
      await toggleCategoriaStatus.mutateAsync({
        id: categoria.id,
        activo: !categoria.activo,
      });
      toast.success(
        `Categoría ${categoria.activo ? 'desactivada' : 'activada'} correctamente`
      );
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      toast.error('No se pudo cambiar el estado');
    }
  };

  // Definir columnas
  const columns: ColumnDef<Categoria>[] = [
    {
      header: 'Nombre',
      accessor: (row) => row.nombre,
      render: (row) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {row.nombre}
        </span>
      ),
    },
    {
      header: 'Descripción',
      accessor: (row) => row.descripcion || '',
      render: (row) => (
        <span className="text-gray-600 dark:text-gray-400 text-sm">
          {row.descripcion || 'Sin descripción'}
        </span>
      ),
    },
    {
      header: 'Estado',
      accessor: (row) => row.activo,
      render: (row) => (
        <button
          onClick={() => handleToggleStatus(row)}
          className="cursor-pointer"
        >
          <Badge color={row.activo ? 'success' : 'error'} size="sm">
            {row.activo ? 'Activo' : 'Inactivo'}
          </Badge>
        </button>
      ),
    },
    {
      header: 'Fecha Creación',
      accessor: (row) => row.created_at,
      render: (row) => (
        <span className="text-gray-600 dark:text-gray-400 text-sm">
          {new Date(row.created_at).toLocaleDateString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      header: 'Acciones',
      accessor: (row) => row.id,
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors dark:hover:bg-blue-900/20"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors dark:hover:bg-red-900/20"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // Mostrar estados de carga y error
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">
          Cargando categorías...
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Categorías" />
      
      <div className="space-y-6">
        <ComponentCard
          title="Lista de categorías"
          action={
            <button
              onClick={() => {
                setEditingCategoria(null);
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nueva Categoría
            </button>
          }
        >
          <DynamicTable
            data={categorias || []}
            columns={columns}
            itemsPerPage={10}
            searchPlaceholder="Buscar categorías..."
            emptyMessage="No hay categorías registradas"
          />
        </ComponentCard>
      </div>

      {/* Aquí iría tu modal de crear/editar */}
      {showModal && (
        <CategoriaModal
          categoria={editingCategoria}
          onClose={() => {
            setShowModal(false);
            setEditingCategoria(null);
          }}
          onSave={async (data) => {
            try {
              if (editingCategoria) {
                await updateCategoria.mutateAsync({
                  id: editingCategoria.id,
                  ...data,
                });
                toast.success('Categoría actualizada correctamente');
              } else {
                await createCategoria.mutateAsync(data);
                toast.success('Categoría creada correctamente');
              }
              setShowModal(false);
              setEditingCategoria(null);
            } catch (error) {
              console.error('Error:', error);
              toast.error('Ocurrió un error al guardar');
            }
          }}
        />
      )}
    </div>
  );
}

interface CategoriaModalProps {
  categoria: Categoria | null;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

function CategoriaModal({ categoria, onClose, onSave }: CategoriaModalProps) {
  const [formData, setFormData] = useState({
    nombre: categoria?.nombre || "",
    descripcion: categoria?.descripcion || "",
    activo: categoria?.activo ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <Modal
      isOpen={true} 
      onClose={onClose}
      showCloseButton={true} 
      isFullscreen={false}   
      className="max-w-md p-6" 
    >
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        {categoria ? "Editar Categoría" : "Nueva Categoría"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Nombre *
          </label>
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) =>
              setFormData({ ...formData, nombre: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Descripción
          </label>
          <textarea
            value={formData.descripcion}
            onChange={(e) =>
              setFormData({ ...formData, descripcion: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white"
          ></textarea>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.activo}
            onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
          />
          <span className="text-gray-800 dark:text-gray-200">Activo</span>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-600 text-black dark:text-white"
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white"
          >
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  );
}



