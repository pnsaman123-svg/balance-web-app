import React from 'react';
import {
  House,
  ShoppingBasket,
  Zap,
  Car,
  Activity,
  UtensilsCrossed,
  ShoppingBag,
  Repeat,
  Gamepad2,
  ShieldCheck,
  TrendingUp,
  ArrowDownRight,
  Wallet,
  DollarSign,
  Coffee,
  Sparkles,
  Heart,
  Plane,
  Smartphone,
  Gift,
  HelpCircle
} from 'lucide-react';

const ICON_MAP = {
  House,
  ShoppingBasket,
  Zap,
  Car,
  Activity,
  UtensilsCrossed,
  ShoppingBag,
  Repeat,
  Gamepad2,
  ShieldCheck,
  TrendingUp,
  ArrowDownRight,
  Wallet,
  DollarSign,
  Coffee,
  Sparkles,
  Heart,
  Plane,
  Smartphone,
  Gift,
};

export default function CategoryIcon({
  iconName,
  size = 18,
  variant = 'dark', // 'dark' (white on dark grey) | 'light' (black on light grey) | 'solid'
  className = '',
}) {
  const IconComponent = ICON_MAP[iconName] || HelpCircle;

  const baseStyles = 'flex items-center justify-center rounded-full transition-all duration-200 shrink-0';
  
  const variantStyles = {
    dark: 'bg-[#1C1C1C] text-[#FFFFFF] border border-[#292929]',
    light: 'bg-[#F2F2F2] text-[#0A0A0A] border border-[#D6D6D6]',
    charcoal: 'bg-[#292929] text-[#F8F8F8]',
    white: 'bg-[#FFFFFF] text-[#0A0A0A]',
    black: 'bg-[#0A0A0A] text-[#FFFFFF] border border-[#292929]',
  };

  const containerSizes = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
  };

  const cSize = size <= 16 ? containerSizes.sm : size <= 22 ? containerSizes.md : containerSizes.lg;

  return (
    <div className={`${baseStyles} ${cSize} ${variantStyles[variant] || variantStyles.dark} ${className}`}>
      <IconComponent size={size} strokeWidth={1.75} />
    </div>
  );
}
