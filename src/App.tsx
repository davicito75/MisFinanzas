import { useState, useEffect } from 'react';
import { AppLayout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { MovementsTable } from './components/MovementsTable';
import { SubscriptionsList } from './components/SubscriptionsList';
import { supabaseStorageProvider } from './lib/supabase/SupabaseStorageProvider';
import { supabaseAuthService } from './lib/auth/SupabaseAuthService';
import { supabase } from './lib/supabase/client';
import { GmailService } from './lib/gmail/GmailService';
import { LoginView } from './components/LoginView';
import { MovementModal } from './components/MovementModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { SettingsView } from './components/SettingsView';
import { NotificationService } from './lib/notifications/NotificationService';
import type { Movement, AppState, MovementStatus, UserProfile, Subscription } from './types';

const INITIAL_STATE: AppState = {
  movements: [],
  subscriptions: [],
  rules: [],
  profile: null,
  syncState: {
    lastSyncTimestamp: '',
    totalProcessedCount: 0
  },
  isAuthenticated: false,
  ignoredSubscriptions: []
};

function App() {
  const [activeView, setActiveView] = useState<'dashboard' | 'movements' | 'subscriptions' | 'settings'>('dashboard');
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<Movement | undefined>();
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | undefined>();
  const [manualSubscriptions, setManualSubscriptions] = useState<Subscription[]>([]);

  const handleViewChange = (view: typeof activeView) => {
    setActiveView(view);
    window.scrollTo(0, 0);
  };

  // Load from storage on mount
  useEffect(() => {
    const loadData = async () => {
      const currentUser = await supabaseAuthService.getCurrentUser();
      const saved = await supabaseStorageProvider.loadState();

      let cleanMovements: Movement[] = [];
      let detectedSubs: Subscription[] = [];
      let syncState = state.syncState;

      if (saved) {
        cleanMovements = saved.movements || [];
        detectedSubs = saved.subscriptions || [];
        syncState = saved.syncState || state.syncState;
      }

      setState(prev => ({
        ...prev,
        movements: cleanMovements,
        subscriptions: detectedSubs,
        syncState,
        profile: currentUser,
        isAuthenticated: !!currentUser
      }));
      setManualSubscriptions(saved?.subscriptions || []);

      // Request notification permission and check upcoming
      if (currentUser) {
        NotificationService.requestPermission().then(() => {
          NotificationService.checkUpcomingSubscriptions(saved?.subscriptions || []);
        });
      }
    };
    loadData();
  }, []);

  // Save to storage on change
  useEffect(() => {
    const saveData = async () => {
      if (state.isAuthenticated && state.profile) {
        try {
          await supabaseStorageProvider.saveState({
            ...state,
            subscriptions: manualSubscriptions // Save manual subs to persistent storage
          });
        } catch (error) {
          console.error('Error auto-saving:', error);
        }
      }
    };
    saveData();
  }, [state, manualSubscriptions]);

  // Automatic Subscription Detection
  useEffect(() => {
    if (state.movements.length === 0) return;

    // A subscription is a recurring merchant with category "Suscripciones"
    // or a merchant that appears multiple times in different months
    const subMovements = state.movements.filter(m =>
      (m.category === 'Suscripciones' || m.category === 'Servicios') &&
      m.status !== 'descartado'
    );

    const merchants = new Map<string, Movement[]>();
    subMovements.forEach(m => {
      const list = merchants.get(m.merchant) || [];
      list.push(m);
      merchants.set(m.merchant, list);
    });

    const detectedSubs = Array.from(merchants.entries())
      .map(([_name, movements]) => {
        // Sort by date to find latest
        const sorted = [...movements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const last = sorted[0];

        // Use the amount from the latest CONFIRMED movement if available, otherwise just the last one
        const confirmedMovements = movements.filter(m => m.status === 'confirmado');
        const latestConfirmed = confirmedMovements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

        const amountToUse = latestConfirmed ? latestConfirmed.amount : last.amount;
        const currencyToUse = latestConfirmed ? latestConfirmed.currency : last.currency;

        // Estimate next billing date (last date + 1 month)
        const lastDate = new Date(last.date);
        const nextDate = new Date(lastDate);
        nextDate.setMonth(lastDate.getMonth() + 1);

        return {
          id: `sub-${last.id}`,
          name: last.merchant,
          amount: amountToUse,
          currency: currencyToUse,
          frequency: 'mensual' as const,
          nextBillingDate: nextDate.toISOString().split('T')[0],
          category: last.category,
          active: true
        };
      })
      // Only keep merchants that appeared more than once OR explicitly categorized as Subscriptions
      .filter(sub => {
        const moveCount = merchants.get(sub.name)?.length || 0;
        const isIgnored = state.ignoredSubscriptions?.includes(sub.name);
        return !isIgnored && (moveCount >= 1 && sub.category === 'Suscripciones' || moveCount >= 2);
      });

    // Combine manual and detected, favoring manual by ID or name
    const combinedSubs = [...manualSubscriptions];
    detectedSubs.forEach(ds => {
      const exists = combinedSubs.find(ms => ms.name.toLowerCase() === ds.name.toLowerCase());
      if (!exists) {
        combinedSubs.push(ds);
      }
    });

    // Update state if different
    if (JSON.stringify(combinedSubs) !== JSON.stringify(state.subscriptions)) {
      setState(prev => ({ ...prev, subscriptions: combinedSubs }));
    }
  }, [state.movements, manualSubscriptions]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const token = await GmailService.requestToken();
      const newMovements = await GmailService.syncMovements(token);

      setState(prev => ({
        ...prev,
        // Preserve existing movements (and their user edits/confirmations)
        // Only add new ones that don't already exist by ID
        movements: [...prev.movements, ...newMovements.filter(nm => !prev.movements.find(pm => pm.id === nm.id))],
        syncState: {
          lastSyncTimestamp: new Date().toISOString(),
          totalProcessedCount: (prev.syncState?.totalProcessedCount || 0) + newMovements.length
        }
      }));

      alert(`Sincronización exitosa: ${newMovements.length} movimientos encontrados.`);
    } catch (error) {
      console.error('Sync failed:', error);
      alert('Error en la sincronización.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveMovement = (movement: Movement) => {
    setState(prev => {
      const exists = prev.movements.find(m => m.id === movement.id);
      const newMovements = exists
        ? prev.movements.map(m => m.id === movement.id ? movement : m)
        : [movement, ...prev.movements];
      return { ...prev, movements: newMovements };
    });
    setSelectedMovement(undefined);
    setIsModalOpen(false);
  };

  const handleDeleteMovement = (id: string) => {
    setState(prev => ({
      ...prev,
      movements: prev.movements.filter(m => m.id !== id)
    }));
    setSelectedMovement(undefined);
    setIsModalOpen(false);
  };

  const handleEditMovement = (movement: Movement) => {
    setSelectedMovement(movement);
    setIsModalOpen(true);
  };

  const handleAddManual = () => {
    setSelectedMovement(undefined);
    setIsModalOpen(true);
  };

  const updateMovementStatus = (id: string, status: MovementStatus) => {
    setState(prev => ({
      ...prev,
      movements: prev.movements.map(m => m.id === id ? { ...m, status } : m)
    }));
  };

  const handleSaveSubscription = (subscription: Subscription) => {
    setManualSubscriptions(prev => {
      const exists = prev.find(s => s.id === subscription.id);
      if (exists) {
        return prev.map(s => s.id === subscription.id ? subscription : s);
      }
      return [subscription, ...prev];
    });

    // If it was ignored, stop ignoring it
    setState(prev => ({
      ...prev,
      ignoredSubscriptions: prev.ignoredSubscriptions?.filter(name => name !== subscription.name) || []
    }));

    setIsSubModalOpen(false);
  };

  const handleDeleteSubscription = (id: string) => {
    // Find if it was a manual or detected one
    const subToDelete = state.subscriptions.find(s => s.id === id);

    if (subToDelete) {
      // If it's a detected subscription (or manual by name), add to ignored list
      setState(prev => ({
        ...prev,
        ignoredSubscriptions: [...(prev.ignoredSubscriptions || []), subToDelete.name]
      }));
    }

    setManualSubscriptions(prev => prev.filter(s => s.id !== id));
    setIsSubModalOpen(false);
  };

  const handleEditSubscription = (sub: Subscription) => {
    setSelectedSubscription(sub);
    setIsSubModalOpen(true);
  };

  const handleAddSubscription = () => {
    setSelectedSubscription(undefined);
    setIsSubModalOpen(true);
  };

  const handleToggleReminder = (id: string) => {
    setManualSubscriptions(prev => prev.map(s =>
      s.id === id ? { ...s, remindersEnabled: !s.remindersEnabled } : s
    ));
    // If enabling, ensure permission
    const sub = state.subscriptions.find(s => s.id === id);
    if (!sub?.remindersEnabled) {
      NotificationService.requestPermission();
    }
  };

  const handleLogout = async () => {
    await supabaseAuthService.logout();
    GmailService.clearToken(); // Clear cached Gmail token
    setState(prev => ({ ...prev, isAuthenticated: false, profile: null }));
  };

  const handleLoginSuccess = (profile: UserProfile) => {
    setState(prev => ({ ...prev, isAuthenticated: true, profile }));
  };

  const handleClearData = async () => {
    if (window.confirm("⚠️ ¿ESTÁS SEGURO? Esta acción eliminará TODOS tus movimientos, suscripciones y reglas de Supabase.")) {
      if (window.confirm("⚠️⚠️ ÚLTIMA CONFIRMACIÓN: Esta acción es IRREVERSIBLE. ¿Continuar?")) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('No hay usuario autenticado');

          // Delete all user data from Supabase
          await Promise.all([
            supabase.from('movements').delete().eq('user_id', user.id),
            supabase.from('subscriptions').delete().eq('user_id', user.id),
            supabase.from('rules').delete().eq('user_id', user.id),
            supabase.from('sync_state').update({
              last_processed_email_id: null,
              last_sync_timestamp: null,
              total_processed_count: 0,
              ignored_subscriptions: []
            }).eq('user_id', user.id)
          ]);

          // Clear local state
          setState({ ...INITIAL_STATE, isAuthenticated: true, profile: state.profile });
          setManualSubscriptions([]);

          alert("✅ Todos tus datos han sido eliminados de Supabase.");
        } catch (error) {
          console.error('Error clearing data:', error);
          alert("❌ Error al eliminar datos. Por favor intenta de nuevo.");
        }
      }
    }
  };

  const handleImportData = (importedState: Partial<AppState>) => {
    setState(prev => ({
      ...prev,
      ...importedState,
      isAuthenticated: true, // Keep authenticated
      profile: prev.profile // Keep current profile
    }));
    alert("Datos importados exitosamente.");
  };

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const updatedProfile = await supabaseAuthService.updateProfile(updates);
      setState(prev => ({ ...prev, profile: updatedProfile }));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard movements={state.movements} onViewChange={handleViewChange} />;
      case 'movements':
        return (
          <MovementsTable
            movements={state.movements}
            onUpdateStatus={updateMovementStatus}
            onEdit={handleEditMovement}
          />
        );
      case 'subscriptions':
        return (
          <SubscriptionsList
            subscriptions={state.subscriptions}
            onEdit={handleEditSubscription}
            onDelete={handleDeleteSubscription}
            onAdd={handleAddSubscription}
            onToggleReminder={handleToggleReminder}
          />
        );
      case 'settings':
        return (
          <SettingsView
            user={state.profile}
            state={state}
            onImportData={handleImportData}
            onClearData={handleClearData}
            onUpdateProfile={handleUpdateProfile}
          />
        );
      default:
        return <Dashboard movements={state.movements} onViewChange={handleViewChange} />;
    }
  };

  if (!state.isAuthenticated) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <>
      <AppLayout
        activeView={activeView}
        onViewChange={handleViewChange}
        onSync={handleSync}
        onAddManual={handleAddManual}
        onClearData={handleClearData}
        onLogout={handleLogout}
        user={state.profile}
        isSyncing={isSyncing}
      >
        {renderContent()}
      </AppLayout>

      <MovementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMovement}
        onDelete={handleDeleteMovement}
        initialData={selectedMovement}
      />

      <SubscriptionModal
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
        onSave={handleSaveSubscription}
        onDelete={handleDeleteSubscription}
        initialData={selectedSubscription}
      />
    </>
  );
}

export default App;
