'use client';

import React, { useState } from 'react';
import PageBreadcrumb from '../common/PageBreadCrumb';
import ComponentCard from '../common/ComponentCard';
import DynamicTable, { ColumnDef } from '../tables/DynamicTable';
import Badge from '../ui/badge/Badge';
import { useProveedores } from '@/hooks/useProveedores';
import { Proveedor } from '@/interfaces';
import { Plus, Edit, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from "@/components/ui/modal/index";

export default function Proveedores() {
  const {
    proveedores,
    isLoading,
    createProveedor,
    updateProveedor,
    deleteProveedor,
  } = useProveedores();

  const [showModal, setShowModal] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null);

  // Manejar edición
  const handleEdit = (proveedor: Proveedor) => {
    setEditingProveedor(proveedor);
    setShowModal(true);
  };

  // Manejar eliminación
  const handleDelete = async (proveedor: Proveedor) => {
    if (window.confirm(`¿Estás seguro de eliminar el proveedor "${proveedor.nombre}"?`)) {
      try {
        await deleteProveedor.mutateAsync(proveedor.id);
        toast.success('Proveedor eliminado correctamente');
      } catch (error) {
        console.error('Error al eliminar:', error);
        toast.error('No se pudo eliminar el proveedor');
      }
    }
  };

  // Definir columnas
  const columns: ColumnDef<Proveedor>[] = [
    {
      header: 'Proveedor',
      accessor: (row) => row.nombre,
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {row.nombre}
          </div>
          {row.contacto_nombre && (
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
              <span>Contacto: {row.contacto_nombre}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'RUC',
      accessor: (row) => row.ruc || '',
      render: (row) => (
        <span className="text-gray-700 dark:text-gray-300 text-sm font-mono">
          {row.ruc || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Contacto',
      accessor: (row) => `${row.telefono || ''} ${row.email || ''}`,
      render: (row) => (
        <div className="space-y-1">
          {row.telefono && (
            <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
              <Phone className="w-3.5 h-3.5 text-gray-400" />
              <span>{row.telefono}</span>
            </div>
          )}
          {row.email && (
            <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
              <Mail className="w-3.5 h-3.5 text-gray-400" />
              <span className="truncate max-w-[200px]">{row.email}</span>
            </div>
          )}
          {!row.telefono && !row.email && (
            <span className="text-gray-500 dark:text-gray-400 text-sm">N/A</span>
          )}
        </div>
      ),
    },
    {
      header: 'Dirección',
      accessor: (row) => row.direccion || '',
      render: (row) => (
        <div className="flex items-start gap-1.5">
          {row.direccion ? (
            <>
              <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
              <span className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                {row.direccion}
              </span>
            </>
          ) : (
            <span className="text-gray-500 dark:text-gray-400 text-sm">N/A</span>
          )}
        </div>
      ),
    },
    {
      header: 'Estado',
      accessor: (row) => row.activo,
      render: (row) => (
        <Badge color={row.activo ? 'success' : 'error'} size="sm">
          {row.activo ? 'Activo' : 'Inactivo'}
        </Badge>
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

  // Mostrar estado de carga
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">
          Cargando proveedores...
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Proveedores" />
      
      <div className="space-y-6">
        <ComponentCard
          title="Lista de proveedores"
          desc="Gestiona los proveedores de tu farmacia"
          action={
            <button
              onClick={() => {
                setEditingProveedor(null);
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nuevo Proveedor
            </button>
          }
        >
          <DynamicTable
            data={proveedores || []}
            columns={columns}
            itemsPerPage={10}
            searchPlaceholder="Buscar proveedores por nombre, RUC o contacto..."
            emptyMessage="No hay proveedores registrados"
          />
        </ComponentCard>
      </div>

      {/* Modal de crear/editar */}
      {showModal && (
        <ProveedorModal
          proveedor={editingProveedor}
          onClose={() => {
            setShowModal(false);
            setEditingProveedor(null);
          }}
          onSave={async (data) => {
            try {
              if (editingProveedor) {
                await updateProveedor.mutateAsync({
                  id: editingProveedor.id,
                  ...data,
                });
                toast.success('Proveedor actualizado correctamente');
              } else {
                await createProveedor.mutateAsync(data);
                toast.success('Proveedor creado correctamente');
              }
              setShowModal(false);
              setEditingProveedor(null);
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

// ============================================
// Modal de Proveedor
// ============================================

interface ProveedorModalProps {
  proveedor: Proveedor | null;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

function ProveedorModal({ proveedor, onClose, onSave }: ProveedorModalProps) {
  const [formData, setFormData] = useState({
    nombre: proveedor?.nombre || '',
    ruc: proveedor?.ruc || '',
    telefono: proveedor?.telefono || '',
    email: proveedor?.email || '',
    direccion: proveedor?.direccion || '',
    contacto_nombre: proveedor?.contacto_nombre || '',
    activo: proveedor?.activo ?? true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      showCloseButton={true}
      isFullscreen={false}
      className="max-w-2xl p-6"
    >
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        {proveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Nombre del Proveedor *
          </label>
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) =>
              setFormData({ ...formData, nombre: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Ej: Distribuidora Farmacéutica S.A."
            required
          />
        </div>

        {/* RUC y Teléfono */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              RUC
            </label>
            <input
              type="text"
              value={formData.ruc}
              onChange={(e) =>
                setFormData({ ...formData, ruc: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="20123456789"
              maxLength={11}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Teléfono
            </label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) =>
                setFormData({ ...formData, telefono: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="999 999 999"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="contacto@proveedor.com"
          />
        </div>

        {/* Nombre de contacto */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Nombre del Contacto
          </label>
          <input
            type="text"
            value={formData.contacto_nombre}
            onChange={(e) =>
              setFormData({ ...formData, contacto_nombre: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Ej: Juan Pérez"
          />
        </div>

        {/* Dirección */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Dirección
          </label>
          <textarea
            value={formData.direccion}
            onChange={(e) =>
              setFormData({ ...formData, direccion: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            rows={2}
            placeholder="Av. Principal 123, Distrito, Ciudad"
          />
        </div>

        {/* Estado activo */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="activo"
            checked={formData.activo}
            onChange={(e) =>
              setFormData({ ...formData, activo: e.target.checked })
            }
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <label
            htmlFor="activo"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Proveedor activo
          </label>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-600 text-black dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}