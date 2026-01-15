'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ShoppingBag, Coins, Check, Lock, Sparkles, Snowflake } from 'lucide-react';
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
  type: 'skin' | 'item';
  preview?: React.ComponentType<{ percentage: number }>;
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
    id: 'hp-bar',
    name: 'HP Bar',
    description: 'Level up your productivity',
    price: 100,
    type: 'skin',
    preview: HPBarSkin,
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
    id: 'cat-yarn',
    name: 'Playful Kitty',
    description: 'Watch a cute cat play with yarn',
    price: 200,
    type: 'skin',
    preview: CatYarnSkin,
  },
  {
    id: 'streak-freeze',
    name: 'Streak Freeze',
    description: 'Protect your streak! Automatically used if you miss a day.',
    price: 100,
    type: 'item',
  },
];

export default function ShopPage() {
  const { profile, ownedSkins, activeSkin, purchaseSkin, purchaseItem, activateSkin } = useApp();
  const [selectedSkin, setSelectedSkin] = useState<ShopItem | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = useState<'skins' | 'items'>('skins');

  const handlePurchase = (item: ShopItem) => {
    if (item.type === 'skin' && ownedSkins.includes(item.id)) {
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

    if (selectedSkin.type === 'skin') {
      purchaseSkin(selectedSkin.id, selectedSkin.price);
    } else {
      purchaseItem(selectedSkin.id, selectedSkin.price);
    }
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

  // Filter items based on active tab
  const displayedItems = defaultItems.filter(item => {
    if (activeTab === 'skins') return item.type === 'skin';
    if (activeTab === 'items') return item.type === 'item';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-3">
            <ShoppingBag className="text-purple-600" size={28} />
            Shop
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Customize your focus timer and boost your productivity
          </p>
        </div>
        <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 px-4 py-2 rounded-xl border border-yellow-200 dark:border-yellow-700/50">
          <Coins className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
          <span className="text-lg font-bold text-yellow-700 dark:text-yellow-400">{profile.coins}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 mb-8 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab('skins')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'skins'
            ? 'border-purple-500 text-purple-600 dark:text-purple-400'
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
        >
          Timer Skins
        </button>
        <button
          onClick={() => setActiveTab('items')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'items'
            ? 'border-purple-500 text-purple-600 dark:text-purple-400'
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
        >
          Items
        </button>
      </div>

      {/* Items Grid */}
      {displayedItems.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No items found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedItems.map((item) => {
            const isOwned = item.type === 'skin' ? ownedSkins.includes(item.id) : false;
            const isActive = activeSkin === item.id;
            const PreviewComponent = item.preview;

            return (
              <Card
                key={item.id}
                className={`relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${isActive
                  ? 'ring-2 ring-green-500 shadow-green-500/20 bg-white dark:bg-slate-800'
                  : isOwned
                    ? 'ring-1 ring-blue-500/50 bg-white dark:bg-slate-800'
                    : 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                  }`}
              >
                {/* Active Badge */}
                {isActive && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow z-10 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Active
                  </div>
                )}

                {/* Owned Badge */}
                {isOwned && !isActive && (
                  <div className="absolute top-3 right-3 bg-blue-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow z-10 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Owned
                  </div>
                )}

                {/* Quantity Badge for Items */}
                {item.type === 'item' && (profile.inventory?.[item.id] || 0) > 0 && (
                  <div className="absolute top-3 right-3 bg-purple-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow z-10 flex items-center gap-1">
                    <span className="text-[10px] mr-0.5">x</span>
                    {profile.inventory[item.id]}
                  </div>
                )}

                {/* Preview */}
                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-800 dark:to-slate-900 rounded-t-xl flex items-center justify-center mb-4 overflow-hidden group">
                  <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors" />
                  <div className="relative z-0 scale-75 transform group-hover:scale-80 transition-transform duration-300">
                    {PreviewComponent ? <PreviewComponent percentage={65} /> : (
                      item.id === 'streak-freeze' ? <Snowflake className="w-20 h-20 text-blue-400 animate-pulse" /> : <Sparkles className="w-20 h-20 text-yellow-500" />
                    )}
                  </div>
                  {!isOwned && item.type === 'skin' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-black/50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 backdrop-blur-sm">
                        <Lock className="w-4 h-4 text-white/90" />
                        <span className="text-white/90 font-semibold text-xs">Locked</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Item Info */}
                <div className="px-5 pb-5">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-1 flex items-center gap-2">
                    {item.name}
                  </h3>
                  <p className="text-gray-500 dark:text-slate-400 text-xs leading-relaxed mb-4 h-8 line-clamp-2">
                    {item.description}
                  </p>

                  {/* Footer: Price & Action */}
                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-slate-700/50">
                    <div className="flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-yellow-500" />
                      <span className="text-gray-900 dark:text-slate-200 font-bold text-lg">{item.price}</span>
                    </div>

                    {isOwned ? (
                      <Button
                        onClick={() => activateItem(item.id)}
                        variant={isActive ? 'secondary' : 'primary'}
                        size="sm"
                        className={`text-xs px-3 py-1.5 h-8 ${!isActive ? 'bg-blue-600 hover:bg-blue-500' : ''}`}
                      >
                        {isActive ? 'Active' : 'Activate'}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handlePurchase(item)}
                        variant="primary"
                        size="sm"
                        disabled={profile.coins < item.price}
                        className={`text-xs px-3 py-1.5 h-8 ${profile.coins < item.price ? '' : 'bg-green-600 hover:bg-green-500'}`}
                      >
                        {item.type === 'item' ? 'Buy' : 'Purchase'}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Confirm Purchase Dialog */}
      {showConfirmDialog && selectedSkin && (
        <ConfirmDialog
          title="Purchase Item"
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
