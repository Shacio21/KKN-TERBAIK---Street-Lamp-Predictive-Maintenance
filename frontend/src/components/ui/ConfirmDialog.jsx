/**
 * @fileoverview Confirmation dialog for the PJU IoT Monitoring System.
 * Wraps the Modal component with pre-configured icons, messaging, and action buttons.
 * Used for destructive actions, warnings, and confirmations.
 */

import { motion } from 'framer-motion';
import { AlertTriangle, Info, CheckCircle, Loader2 } from 'lucide-react';
import Modal from './Modal';
import { Button } from "@/components/ui/button";

/**
 * Variant configuration: icon component, icon color, and confirm button styling.
 */
const VARIANT_CONFIG = {
  danger: {
    Icon: AlertTriangle,
    iconBg: 'bg-neon-red/10',
    iconColor: 'text-neon-red',
    iconShadow: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]',
    confirmBg:
      'bg-neon-red/20 hover:bg-neon-red/30 border border-neon-red/30 text-neon-red',
  },
  warning: {
    Icon: AlertTriangle,
    iconBg: 'bg-neon-amber/10',
    iconColor: 'text-neon-amber',
    iconShadow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    confirmBg:
      'bg-neon-amber/20 hover:bg-neon-amber/30 border border-neon-amber/30 text-neon-amber',
  },
  info: {
    Icon: Info,
    iconBg: 'bg-neon-blue/10',
    iconColor: 'text-neon-blue',
    iconShadow: 'shadow-[0_0_20px_rgba(0,212,255,0.15)]',
    confirmBg:
      'bg-neon-blue/20 hover:bg-neon-blue/30 border border-neon-blue/30 text-neon-blue',
  },
  success: {
    Icon: CheckCircle,
    iconBg: 'bg-neon-green/10',
    iconColor: 'text-neon-green',
    iconShadow: 'shadow-[0_0_20px_rgba(0,255,136,0.15)]',
    confirmBg:
      'bg-neon-green/20 hover:bg-neon-green/30 border border-neon-green/30 text-neon-green',
  },
};

/**
 * Confirmation dialog with contextual icons and variant-based styling.
 *
 * @param {object} props
 * @param {boolean} props.isOpen - Controls dialog visibility.
 * @param {() => void} props.onClose - Callback when the dialog should close.
 * @param {() => void} props.onConfirm - Callback when the user confirms the action.
 * @param {string} [props.title='Konfirmasi'] - Dialog heading.
 * @param {string} [props.message='Apakah Anda yakin ingin melanjutkan?'] - Dialog body message.
 * @param {'danger'|'warning'|'info'|'success'} [props.variant='danger'] - Visual style variant.
 * @param {string} [props.confirmText='Konfirmasi'] - Text for the confirm button.
 * @param {string} [props.cancelText='Batal'] - Text for the cancel button.
 * @param {boolean} [props.isLoading=false] - Shows a spinner and disables the confirm button.
 * @returns {JSX.Element}
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi',
  message = 'Apakah Anda yakin ingin melanjutkan?',
  variant = 'danger',
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  isLoading = false,
}) {
  const config = VARIANT_CONFIG[variant] || VARIANT_CONFIG.danger;
  const { Icon, iconBg, iconColor, iconShadow, confirmBg } = config;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center">
        {/* Icon */}
        <motion.div
          className={`
            w-16 h-16 rounded-2xl flex items-center justify-center mb-5
            ${iconBg} ${iconShadow}
          `}
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
        >
          <Icon size={28} className={iconColor} />
        </motion.div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          {title}
        </h3>

        {/* Message */}
        <p className="text-sm text-text-secondary leading-relaxed max-w-xs mb-6">
          {message}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3 w-full">
          {/* Cancel Button (Ghost) */}
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            {cancelText}
          </Button>

          {/* Confirm Button */}
          <Button
            variant="outline"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 inline-flex items-center justify-center gap-2 ${confirmBg}`}
          >
            {isLoading && (
              <Loader2 size={16} className="animate-spin" />
            )}
            {isLoading ? 'Memproses...' : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
