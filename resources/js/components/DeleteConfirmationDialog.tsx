import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel?: () => void;
  title: string;
  description: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  itemName?: string;
}

export function DeleteConfirmationDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  onCancel,
  title,
  description,
  confirmText = 'Hapus',
  cancelText = 'Batal',
  isLoading = false,
  itemName = '',
}: DeleteConfirmationDialogProps) {
  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white" hideCloseButton>
        <div className="flex items-center justify-between">
          <DialogTitle>{title}</DialogTitle>
          <DialogClose asChild>
            <button
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              disabled={isLoading}
              aria-label="Tutup"
            >
              <X className="h-5 w-5" />
            </button>
          </DialogClose>
        </div>
        
        <div className="py-4">
          {typeof description === 'string' ? (
            <p>{description} <span className="font-medium">{itemName}</span>?</p>
          ) : (
            description
          )}
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            type="button"
          >
            {cancelText}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
            type="button"
          >
            {isLoading ? 'Memproses...' : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteConfirmationDialog;
