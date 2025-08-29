import { useState, useRef } from 'react';
import { Camera, Lock, X, Save, Pencil, Upload, User as UserIcon } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import axios, { AxiosInstance } from 'axios';
import { User as BaseUser } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import ChangePasswordForm from './ChangePasswordForm';

declare global {
  interface Window {
    axios: AxiosInstance;
  }
}

interface User extends BaseUser {
  username: string;
  department: {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
  };
  avatar: string;
}

export default function ProfilePage() {
  const { user, auth } = usePage<{ user: User; auth: { user: any } }>().props;
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');



  // File upload functionality is currently disabled but kept for future implementation
  /*
  // Handles the click event on the camera button to trigger file input
  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  // Handles file selection from the file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target?.result as string);
        setIsEditingPhoto(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handles saving the new profile photo to the server
  const handleSavePhoto = async () => {
    if (!previewImage) return;
    
    try {
      const fetchRes = await fetch(previewImage);
      const blob = await fetchRes.blob();
      
      const formData = new FormData();
      formData.append('avatar', blob, 'avatar.jpg');
      
      const response = await axios.post('/api/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      window.location.reload();
      
      setIsEditingPhoto(false);
      setPreviewImage(null);
      setSuccessMessage('Foto profil berhasil diperbarui');
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Terjadi kesalahan saat memperbarui foto profil');
      setIsEditingPhoto(false);
    }
  };

  // Handles canceling the photo edit
  const handleCancelPhoto = () => {
    setIsEditingPhoto(false);
    setPreviewImage(null);
  };
  */

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>Gagal memuat data profil. Silahkan refresh halaman.</p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout 
      auth={auth} 
      header="Profil Saya"
    >
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-2xl font-bold mb-6">Profil Pengguna</h1>
        
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 relative">
            <span>{successMessage}</span>
            <button 
              className="absolute top-0 right-0 p-2"
              onClick={() => setSuccessMessage('')}
            >
              <X size={16} />
            </button>
          </div>
        )}
        
        {/* Right column - User details */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Informasi Pengguna</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nama Lengkap</p>
                <p className="font-medium">{user.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Username</p>
                <p className="font-medium">{user.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Jabatan</p>
                <p className="font-medium">{user.role}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Departemen</p>
                <div className="font-medium">{user.department?.name || 'No Department'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Password Change Dialog */}
      {isEditingPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Ubah Password</h2>
              <button
                onClick={() => setIsEditingPassword(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <ChangePasswordForm onCancel={() => setIsEditingPassword(false)} />
          </div>
        </div>
      )}
      
      {/* Password Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Keamanan Akun</h2>
          <Button
            variant="outline"
            onClick={() => setIsEditingPassword(true)}
            className="flex items-center gap-2"
          >
            <Lock size={16} />
            <span>Ubah Password</span>
          </Button>
        </div>
        <p className="text-gray-600 mt-2">
          Pastikan akun Anda menggunakan kata sandi yang acak dan panjang agar tetap aman.
        </p>
      </div>
      
      {/* File upload functionality is currently disabled
      {isEditingPhoto && previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
            <button
              onClick={() => setIsEditingPhoto(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4">Ubah Foto Profil</h2>
            
            <div className="w-40 h-40 mx-auto rounded-full overflow-hidden bg-gray-200 mb-6">
              <img
                src={previewImage}
                alt="Preview"
                className="object-cover w-full h-full"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditingPhoto(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={() => {}}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
              >
                <Save size={16} />
                <span>Simpan</span>
              </button>
            </div>
          </div>
        </div>
      )}
      */}
    </AppLayout>
  );
}