'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ShoppingBag, Coins, Check, Lock, Sparkles } from 'lucide-react';
import Toast from '@/components/features/Toast';
import ConfirmDialog from '@/components/features/ConfirmDialog';
import BatterySkin from '@/components/features/timer-skins/BatterySkin';
import ClockSkin from '@/components/features/timer-skins/ClockSkin';
import HPBarSkin from '@/components/features/timer-skins/HPBarSkin';
import CatYarnSkin from '@/components/features/timer-skins/CatYarnSkin';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'skin';
  preview: React.ComponentType<{ percentage: number }>;
}

const defaultItems: ShopItem[] = [
  {
    id: 'battery',
    name: 'Battery Power',
    description: 'Track your focus like a charging battery',
    price: 100,
    type: 'skin',
    preview: BatterySkin,
  },
  {
    id: 'clock',
    name: 'Classic Clock',
    description: 'Time flows like clockwork',
    price: 150,
    type: 'skin',
    preview: ClockSkin,
  },
  {
    id: 'hp-bar',
    name: 'HP Bar',
    description: 'Level up your productivity',
    price: 100,
    type: 'skin',
    preview: HPBarSkin,
  },
  {
    id: 'cat-yarn',
    name: 'Playful Kitty',
    description: 'Watch a cute cat play with yarn',
    price: 200,
    type: 'skin',
    preview: CatYarnSkin,
  },
];

export default function ShopPage() {
  const { profile, ownedSkins, activeSkin, purchaseSkin, activateSkin } = useApp();
  const [selectedSkin, setSelectedSkin] = useState<ShopItem | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handlePurchase = (item: ShopItem) => {
    if (ownedSkins.includes(item.id)) {
      setToast({ message: 'You already own this skin!', type: 'error' });
      return;
    }
    if (profile.coins < item.price) {
      setToast({ message: 'Not enough coins!', type: 'error' });
      return;
    }
    setSelectedSkin(item);
    setShowConfirmDialog(true);
  };

  const confirmPurchase = () => {
    if (!selectedSkin) return;

    purchaseSkin(selectedSkin.id, selectedSkin.price);
    setToast({ message: `Successfully purchased ${selectedSkin.name}!`, type: 'success' });
    setShowConfirmDialog(false);
    setSelectedSkin(null);
  };

  const activateItem = (itemId: string) => {
    if (!ownedSkins.includes(itemId)) {
      setToast({ message: 'You need to purchase this skin first!', type: 'error' });
      return;
    }
    activateSkin(itemId);
    setToast({ message: 'Skin activated!', type: 'success' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-100 mb-4 flex items-center gap-3">
              <ShoppingBag className="w-10 h-10 text-blue-500" />
              Timer Skins Shop
            </h1>
            <p className="text-slate-400 text-lg">
              Customize your focus timer with amazing skins
            </p>
          </div>
          <div className="flex items-center gap-3 bg-gradient-to-r from-yellow-500 to-amber-500 px-8 py-4 rounded-full shadow-lg">
            <Coins className="w-7 h-7 text-white" />
            <span className="text-3xl font-bold text-white">{profile.coins}</span>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {defaultItems.map((item) => {
          const isOwned = ownedSkins.includes(item.id);
          const isActive = activeSkin === item.id;
          const PreviewComponent = item.preview;

          return (
            <Card
              key={item.id}
              className={`relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${isActive
                  ? 'ring-2 ring-green-500 shadow-2xl shadow-green-500/20 bg-slate-800'
                  : isOwned
                    ? 'ring-2 ring-blue-500 shadow-xl shadow-blue-500/20 bg-slate-800/80'
                    : 'hover:bg-slate-800/80'
                }`}
            >
              {/* Active Badge */}
              {isActive && (
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-10 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Active
                </div>
              )}

              {/* Owned Badge */}
              {isOwned && !isActive && (
                <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-10 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Owned
                </div>
              )}

              {/* Preview */}
              <div className="relative h-64 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center mb-6 overflow-hidden group">
                <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors" />
                <div className="relative z-0 scale-75 transform group-hover:scale-80 transition-transform duration-300">
                  <PreviewComponent percentage={65} />
                </div>
                {!isOwned && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/70 px-4 py-2 rounded-lg flex items-center gap-2">
                      <Lock className="w-5 h-5 text-yellow-400" />
                      <span className="text-yellow-400 font-semibold text-sm">Locked</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Item Info */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-100 mb-2 flex items-center gap-2">
                  {item.name}
                  {item.id === 'cat-yarn' && <Sparkles className="w-4 h-4 text-yellow-500" />}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
              </div>

              {/* Footer: Price & Action */}
              <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-700/50">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-500" />
                  <span className="text-slate-200 font-bold text-xl">{item.price}</span>
                </div>

                {isOwned ? (
                  <Button
                    onClick={() => activateItem(item.id)}
                    variant={isActive ? 'secondary' : 'primary'}
                    className={!isActive ? 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20' : ''}
                  >
                    {isActive ? 'Active' : 'Activate'}
                  </Button>
                ) : (
                  <Button
                    onClick={() => handlePurchase(item)}
                    variant="primary"
                    disabled={profile.coins < item.price}
                    className={profile.coins < item.price ? '' : 'bg-green-600 hover:bg-green-500 shadow-lg shadow-green-500/20'}
                  >
                    Purchase
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Confirm Purchase Dialog */}
      {showConfirmDialog && selectedSkin && (
        <ConfirmDialog
          title="Purchase Skin"
          message={`Are you sure you want to purchase "${selectedSkin.name}" for ${selectedSkin.price} coins?`}
          confirmLabel="Purchase"
          onConfirm={confirmPurchase}
          onCancel={() => {
            setShowConfirmDialog(false);
            setSelectedSkin(null);
          }}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
