import { useState, useRef } from 'react';
import { Camera, Lock, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Mock user data - in a real app, this would come from authentication/API
const mockUser = {
  name: 'Azka M Ridwan',
  role: 'Camat Tarogong Kidul',
  username: 'azkaridwan',
  avatar: '/images/avatar.png',
  department: 'Kecamatan Tarogong Kidul',
};

export default function ProfilePage() {
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Handle password form submission
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    
    // Validate passwords
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Semua kolom harus diisi');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Password baru dan konfirmasi tidak cocok');
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError('Password baru minimal 8 karakter');
      return;
    }
    
    // In a real app, you would call an API to update the password
    setSuccessMessage('Password berhasil diperbarui');
    setIsEditingPassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  // Handle photo upload
  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

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

  const handleSavePhoto = () => {
    // In a real app, you would upload the photo to a server
    setIsEditingPhoto(false);
    setSuccessMessage('Foto profil berhasil diperbarui');
    
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  const handleCancelPhoto = () => {
    setIsEditingPhoto(false);
    setPreviewImage(null);
  };

  return (
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - User photo */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="relative mx-auto w-32 h-32 mb-4">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 relative">
                <img
                  src={previewImage || mockUser.avatar}
                  alt={mockUser.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={handlePhotoClick}
                className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 shadow"
                aria-label="Edit photo"
              >
                <Camera size={16} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
            </div>
            <h2 className="text-xl font-semibold">{mockUser.name}</h2>
            <p className="text-gray-500">{mockUser.role}</p>
            <button
              onClick={() => setIsEditingPassword(true)}
              className="mt-4 flex items-center justify-center gap-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md transition-colors"
            >
              <Lock size={16} />
              <span>Ubah Password</span>
            </button>
          </div>
        </div>
        
        {/* Right column - User details */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Informasi Pengguna</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nama Lengkap</p>
                <p className="font-medium">{mockUser.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Username</p>
                <p className="font-medium">{mockUser.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Jabatan</p>
                <p className="font-medium">{mockUser.role}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Departemen</p>
                <p className="font-medium">{mockUser.department}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Aktivitas Terbaru</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="font-medium">Mengunggah Laporan Bulanan</p>
                <p className="text-sm text-gray-500">19 Juni 2025, 14:30</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="font-medium">Mengubah Profil</p>
                <p className="text-sm text-gray-500">15 Juni 2025, 10:15</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="font-medium">Mengunggah Laporan Keuangan</p>
                <p className="text-sm text-gray-500">10 Juni 2025, 09:45</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Password Change Dialog */}
      <Dialog open={isEditingPassword} onOpenChange={setIsEditingPassword}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ubah Password</DialogTitle>
            <DialogDescription>
              Masukkan password saat ini dan password baru Anda.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="currentPassword" className="text-right">
                  Password Saat Ini
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="newPassword" className="text-right">
                  Password Baru
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="confirmPassword" className="text-right">
                  Konfirmasi Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              {passwordError && (
                <p className="col-span-4 text-red-500 text-sm text-center">
                  {passwordError}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsEditingPassword(false);
                  setPasswordError('');
                }}
              >
                Batal
              </Button>
              <Button type="submit">Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Floating photo edit form */}
      {isEditingPhoto && previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
            <button
              onClick={handleCancelPhoto}
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
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancelPhoto}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleSavePhoto}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
              >
                <Save size={16} />
                <span>Simpan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
